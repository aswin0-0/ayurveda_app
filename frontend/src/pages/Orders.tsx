import { PageLayout } from "@/components/layout/page-layout"
import { useState, useEffect } from "react"
import { orderService } from "@/services/order.service"
import { useNavigate } from "react-router-dom"
import type { Order } from "@/types/api.types"
import { Package, Calendar, MapPin, Phone } from "lucide-react"

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders()
        setOrders(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders")
        console.error("Error fetching orders:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <PageLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">My Orders</h1>
              <p className="text-muted-foreground mt-1">
                {orders.length === 0 ? "No orders yet" : `${orders.length} order${orders.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center py-20 space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
                <Package size={40} className="text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">No orders yet</h2>
                <p className="text-muted-foreground mt-2">Start shopping to see your orders here!</p>
              </div>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                Browse Products
              </button>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-card border border-border rounded-lg p-6 space-y-4">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-border">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">Order #{order._id.slice(-8)}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status || 'pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        <span>{formatDate(order.createdAt || '')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                      <div className="text-2xl font-bold text-primary">₹{order.total.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 bg-muted/30 rounded-lg px-4">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-xs text-muted-foreground">Delivery Address</div>
                        <div className="text-sm font-medium">{order.address}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone size={16} className="text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-xs text-muted-foreground">Contact</div>
                        <div className="text-sm font-medium">{order.phone}</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <div className="text-sm font-semibold mb-3">Items ({order.items.length})</div>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <div className="w-16 h-16 flex-shrink-0 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                            {typeof item.product === 'object' && (item.product as any).image ? (
                              <img 
                                src={(item.product as any).image} 
                                alt={item.name} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <span className="text-2xl">🌿</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">₹{item.price.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">each</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="text-sm px-4 py-2 border border-border rounded-lg hover:bg-muted transition"
                    >
                      View Details
                    </button>
                    {order.status === 'delivered' && (
                      <button
                        className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                      >
                        Reorder
                      </button>
                    )}
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
