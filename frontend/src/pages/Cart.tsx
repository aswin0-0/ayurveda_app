import { PageLayout } from "@/components/layout/page-layout"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { cartService } from "@/services/cart.service"
import { paymentService } from "@/services/payment.service"
import { useNavigate } from "react-router-dom"
import type { CartItem, Product } from "@/types/api.types"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { initializeRazorpay, createProductPaymentOptions } from "../lib/razorpay"
import type { RazorpayResponse } from "../lib/razorpay"
import { useAuth } from "@/contexts/AuthContext"

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const fetchCart = async () => {
    try {
      const data = await cartService.getCart()
      setCart(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart")
      console.error("Error fetching cart:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdating(productId)
    try {
      await cartService.addToCart({ productId, quantity: newQuantity })
      await fetchCart()
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quantity")
    } finally {
      setUpdating(null)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    setUpdating(productId)
    try {
      // Set quantity to 0 to remove item
      await cartService.addToCart({ productId, quantity: 0 })
      await fetchCart()
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item")
    } finally {
      setUpdating(null)
    }
  }

  const handleCheckout = async () => {
    setCheckingOut(true)
    setError(null) // Clear previous errors
    try {
      console.log("Step 1: Creating order...")
      // Step 1: Create order in backend
      const order = await cartService.checkout({
        address: "Default address",
        phone: "1234567890"
      })
      console.log("Order created:", order._id)
      
      console.log("Step 2: Creating Razorpay order...")
      // Step 2: Create Razorpay order
      const razorpayOrder = await paymentService.createProductOrder(order._id)
      console.log("Razorpay order created:", razorpayOrder.order.id)
      
      // Step 3: Initialize Razorpay checkout
      const paymentOptions = createProductPaymentOptions(
        order._id,
        {
          razorpayOrderId: razorpayOrder.order.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: razorpayOrder.key_id,
        },
        {
          name: user?.name,
          email: user?.email,
          phone: "1234567890",
        },
        async (response: RazorpayResponse) => {
          // Step 4: Verify payment on backend
          try {
            await paymentService.verifyProductPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            })
            
            // Clear cart and show success
            await fetchCart()
            window.dispatchEvent(new Event('cartUpdated'))
            alert(`Payment successful! Order ID: ${order._id}`)
            navigate('/orders')
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed")
          } finally {
            setCheckingOut(false)
          }
        },
        () => {
          // Payment cancelled
          setCheckingOut(false)
          setError("Payment cancelled")
        }
      )
      
      console.log("Step 3: Opening Razorpay checkout...")
      await initializeRazorpay(paymentOptions)
    } catch (err) {
      console.error("Checkout error:", err)
      const errorMessage = err instanceof Error ? err.message : "Checkout failed"
      setError(errorMessage)
      setCheckingOut(false)
      
      // Show user-friendly error
      if (errorMessage.includes("500")) {
        alert("Server error. Please check if all products in your cart are valid and try again.")
      }
    }
  }

  const getProductFromItem = (item: CartItem): Product | null => {
    if (typeof item.product === 'object') {
      return item.product as Product
    }
    return null
  }

  const subtotal = cart.reduce((sum, item) => {
    const product = getProductFromItem(item)
    return sum + (product?.price || 0) * item.quantity
  }, 0)

  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal + shipping

  return (
    <PageLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Shopping Cart</h1>
              <p className="text-muted-foreground mt-1">
                {cart.length === 0 ? "Your cart is empty" : `${cart.length} item${cart.length > 1 ? 's' : ''} in your cart`}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading cart...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm space-y-2">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
              <button 
                onClick={() => setError(null)} 
                className="text-xs underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {!loading && cart.length === 0 && (
            <div className="text-center py-20 space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
                <ShoppingBag size={40} className="text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Your cart is empty</h2>
                <p className="text-muted-foreground mt-2">Add some products to get started!</p>
              </div>
              <Button onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </div>
          )}

          {!loading && cart.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => {
                  const product = getProductFromItem(item)
                  if (!product) return null

                  return (
                    <div key={product._id} className="bg-card border border-border rounded-lg p-6">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 flex-shrink-0 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">🌿</span>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {product.description || "Ayurvedic product"}
                          </p>
                          <div className="flex items-center gap-4 mt-4">
                            <span className="text-xl font-bold text-primary">₹{product.price}</span>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateQuantity(product._id, item.quantity - 1)}
                                disabled={updating === product._id || item.quantity <= 1}
                                className="w-8 h-8 rounded-md border border-border hover:bg-muted transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(product._id, item.quantity + 1)}
                                disabled={updating === product._id}
                                className="w-8 h-8 rounded-md border border-border hover:bg-muted transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(product._id)}
                              disabled={updating === product._id}
                              className="ml-auto text-destructive hover:text-destructive/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Remove from cart"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6 space-y-4 sticky top-20">
                  <h2 className="text-xl font-semibold text-foreground">Order Summary</h2>
                  
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                    </div>
                    {shipping === 0 && subtotal > 0 && (
                      <p className="text-xs text-green-600">🎉 Free shipping on orders over ₹500</p>
                    )}
                  </div>

                  <div className="flex justify-between text-lg font-bold pt-4 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={checkingOut || cart.length === 0}
                  >
                    {checkingOut ? "Processing..." : "Proceed to Checkout"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Secure checkout powered by Razorpay
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
