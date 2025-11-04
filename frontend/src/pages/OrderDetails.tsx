import { PageLayout } from "@/components/layout/page-layout"
import { useState, useEffect } from "react"
import { orderService } from "@/services/order.service"
import { useParams, useNavigate } from "react-router-dom"
import type { Order } from "@/types/api.types"
import { Package, Calendar, MapPin, Phone, ArrowLeft, Truck, CheckCircle, Clock } from "lucide-react"

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return
      
      try {
        const data = await orderService.getOrderById(orderId)
        setOrder(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order details")
        console.error("Error fetching order:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={20} />
      case 'shipped':
        return <Truck size={20} />
      case 'processing':
        return <Clock size={20} />
      default:
        return <Package size={20} />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading order details...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error || !order) {
    return (
      <PageLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="mx-auto max-w-4xl space-y-6">
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft size={16} />
              Back to Orders
            </button>
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error || "Order not found"}
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 50 // Default shipping cost
  const tax = subtotal * 0.18 // 18% GST

  return (
    <PageLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </button>

          {/* Order Header */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold">Order Details</h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Order ID:</span>
                  <span className="font-mono text-sm font-medium">#{order._id}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={14} />
                  <span>{formatDate(order.createdAt || '')}</span>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="font-semibold capitalize">{order.status || 'pending'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Items ({order.items.length})</h2>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b border-border last:border-b-0 last:pb-0">
                      <div className="w-20 h-20 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {typeof item.product === 'object' && (item.product as any).image ? (
                          <img 
                            src={(item.product as any).image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-3xl">🌿</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">₹{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Delivery Address</div>
                      <div className="font-medium">{order.address}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={20} className="text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Contact Number</div>
                      <div className="font-medium">{order.phone}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 space-y-4 sticky top-24">
                <h2 className="text-xl font-semibold">Order Summary</h2>
                
                <div className="space-y-3 py-4 border-y border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (GST 18%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">₹{order.total.toFixed(2)}</span>
                </div>

                {order.status === 'delivered' && (
                  <button
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
                  >
                    Reorder Items
                  </button>
                )}

                {(order.status === 'pending' || order.status === 'processing') && (
                  <button
                    className="w-full py-3 border border-border rounded-lg hover:bg-muted transition font-medium"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
