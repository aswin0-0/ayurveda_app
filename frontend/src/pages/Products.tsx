import { PageLayout } from "@/components/layout/page-layout"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { productService } from "@/services/product.service"
import { cartService } from "@/services/cart.service"
import type { Product } from "@/types/api.types"
import { isAuthenticated } from "@/lib/api-client"
import { useNavigate } from "react-router-dom"

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts({ limit: 12 })
        setProducts(data.products)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products")
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated()) {
      navigate("/login")
      return
    }

    setAddingToCart(productId)
    try {
      await cartService.addToCart({ productId, quantity: 1 })
      alert("Product added to cart!")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add to cart")
    } finally {
      setAddingToCart(null)
    }
  }

  return (
    <PageLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Ayurvedic Products</h1>
            <p className="text-lg text-muted-foreground">
              Authentic herbs, supplements, and remedies from trusted sources
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products available at the moment.</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center text-4xl overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      "🌿"
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{product.description || "Ayurvedic product"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">₹{product.price}</span>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToCart(product._id)}
                      disabled={addingToCart === product._id}
                    >
                      {addingToCart === product._id ? "Adding..." : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
