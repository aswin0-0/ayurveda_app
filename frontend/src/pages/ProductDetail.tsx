import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_CONFIG } from '@/config/api.config'
import { PageLayout } from "@/components/layout/page-layout"
import { Button } from "@/components/ui/button"
import { cartService } from '@/services/cart.service'
import { isAuthenticated } from '@/lib/api-client'
import { useAuth } from '@/contexts/AuthContext'
import { Star, ChevronLeft, ChevronRight, ShoppingCart, AlertCircle } from 'lucide-react'

interface Product {
  _id: string
  name: string
  price: number
  description?: string
  image?: string
  images?: string[]
  stock?: number
  category?: string
  tags?: string[]
  longDescription?: string
  benefits?: string[]
  usage?: string
  ingredients?: string[]
  avgRating?: number
  reviewCount?: number
}

interface Review {
  _id: string
  userId: string
  userName: string
  rating: number
  title: string
  comment: string
  verified: boolean
  createdAt: string
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [currentCartQty, setCurrentCartQty] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [adding, setAdding] = useState(false)
  const [hasOrdered, setHasOrdered] = useState(false)
  const [reviewPage, setReviewPage] = useState(1)
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  useEffect(() => {
    fetchProductDetail()
    fetchReviews()
    fetchCartQuantity()

    // check whether user ordered this product (used to gate review submission)
    fetchHasOrdered()

    const onCartUpdated = () => {
      fetchCartQuantity()
      fetchHasOrdered()
    }
    window.addEventListener('cartUpdated', onCartUpdated)
    return () => window.removeEventListener('cartUpdated', onCartUpdated)
  }, [id])

  const { user } = useAuth()

  const deleteReview = async (reviewId: string) => {
    if (!isAuthenticated()) {
      alert('Please login to delete your review')
      return
    }
    if (!confirm('Are you sure you want to delete your review?')) return
    try {
      const token = localStorage.getItem('ayurveda_auth_token')
      const res = await fetch(`${API_CONFIG.BASE_URL}/reviews/${id}/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error('Failed to delete review')
      alert('Review deleted')
      fetchReviews()
    } catch (err) {
      console.error('Delete review failed', err)
      alert('Failed to delete review')
    }
  }

  // check if current user has ordered this product
  const fetchHasOrdered = async () => {
    if (!id) return
    try {
      const token = localStorage.getItem('ayurveda_auth_token')
      if (!token) {
        setHasOrdered(false)
        return
      }
      const res = await fetch(`${API_CONFIG.BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        setHasOrdered(false)
        return
      }
      const data = await res.json()
      const orders = data.orders || []
      const found = orders.some((o: any) => (o.items || []).some((it: any) => {
        const pid = it.product && it.product._id ? it.product._id : it.product
        return String(pid) === String(id)
      }))
      setHasOrdered(found)
    } catch (err) {
      console.error('Failed to check orders', err)
      setHasOrdered(false)
    }
  }

  const fetchCartQuantity = async () => {
    if (!id) return
    try {
      const cart = await cartService.getCart()
      const item = cart.find((c: any) => {
        const prod = typeof c.product === 'object' ? c.product : null
        return (prod && prod._id === id) || (typeof c.product === 'string' && c.product === id)
      })
      const qty = item ? item.quantity || 0 : 0
      setCurrentCartQty(qty)
      // Initialize selector to current cart qty or 1
      setQuantity(qty > 0 ? qty : 1)
    } catch (err) {
      console.error('Failed to fetch cart quantity', err)
    }
  }

  // Keyboard navigation for modal
  useEffect(() => {
    if (!showImageModal || !product) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const imgList = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])
      if (e.key === 'Escape') {
        setShowImageModal(false)
      } else if (e.key === 'ArrowLeft') {
        setModalImageIndex((prev) => (prev - 1 + imgList.length) % imgList.length)
      } else if (e.key === 'ArrowRight') {
        setModalImageIndex((prev) => (prev + 1) % imgList.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showImageModal, product])

  const fetchProductDetail = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/products/${id}`)
      if (!response.ok) throw new Error('Failed to fetch product')
      const data = await response.json()
      console.log('Product loaded:', data.product)
      console.log('Main image:', data.product.image)
      console.log('Images array:', data.product.images)
      setProduct(data.product)
      setError(null)
    } catch (err) {
      setError('Failed to load product details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/reviews/${id}?page=${reviewPage}&limit=5`)
      if (!response.ok) throw new Error('Failed to fetch reviews')
      const data = await response.json()
      setReviews(data.reviews)
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    setAdding(true)
    try {
      // Calculate delta between desired quantity and current cart quantity
      const desired = quantity
      const delta = desired - (currentCartQty || 0)

      if (delta === 0) {
        alert('Quantity unchanged')
      } else {
        await cartService.addToCart({ productId: id!, quantity: delta })
        const newQty = (currentCartQty || 0) + delta
        setCurrentCartQty(newQty > 0 ? newQty : 0)
        setQuantity(newQty > 0 ? newQty : 1)
        alert(`✓ Cart updated: ${newQty} ${product?.name}`)
        window.dispatchEvent(new Event('cartUpdated'))
      }
    } catch (err) {
      alert('Failed to add to cart')
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    if (!newReview.title || !newReview.comment) {
      alert('Please fill in all fields')
      return
    }

    setSubmittingReview(true)
    try {
      const token = localStorage.getItem('ayurveda_auth_token')
      const response = await fetch(`${API_CONFIG.BASE_URL}/reviews/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReview)
      })

      if (!response.ok) throw new Error('Failed to submit review')
      
      alert('Review submitted successfully!')
      setNewReview({ rating: 5, title: '', comment: '' })
      fetchReviews()
      fetchProductDetail() // refresh to get updated rating
    } catch (err) {
      alert('Failed to submit review')
      console.error(err)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error || !product) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[600px]">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-lg text-muted-foreground">{error || 'Product not found'}</p>
            <Button onClick={() => navigate('/products')} className="mt-4">
              Back to Products
            </Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : [])
  const currentImage = images.length > 0 ? images[currentImageIndex] : null

  return (
    <PageLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <button 
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            ← Back to Products
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div 
                className="relative bg-muted rounded-lg overflow-hidden aspect-square cursor-pointer group"
                onClick={() => {
                  setModalImageIndex(currentImageIndex)
                  setShowImageModal(true)
                }}
              >
                {currentImage ? (
                  <>
                    <img
                      src={currentImage.startsWith('http') ? currentImage : `${API_CONFIG.BASE_URL}${currentImage}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                      onError={(e) => console.error('Image failed to load:', (e.target as HTMLImageElement).src)}
                      onLoad={() => console.log('Image loaded:', currentImage)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="bg-white/90 p-3 rounded-full">
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>
                )}
              </div>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, idx) => (
                    img && (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex ? 'border-primary' : 'border-muted'
                      }`}
                    >
                      <img
                        src={img.startsWith('http') ? img : `${API_CONFIG.BASE_URL}${img}`}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => console.error('Thumbnail failed to load:', (e.target as HTMLImageElement).src)}
                      />
                    </button>
                    )
                  ))}
                </div>
              )}

              {/* Image Navigation Arrows */}
              {images.length > 1 && (
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="p-2 rounded-full bg-muted hover:bg-primary hover:text-white transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                    className="p-2 rounded-full bg-muted hover:bg-primary hover:text-white transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Rating */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.floor(product.avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{product.avgRating || 'No'} ({product.reviewCount || 0} reviews)</span>
                </div>
              </div>

              {/* Name & Price */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                {product.category && (
                  <p className="text-sm text-muted-foreground mb-4">Category: {product.category}</p>
                )}
                <div className="text-3xl font-bold text-primary mb-4">₹{product.price}</div>
              </div>

              {/* Stock Status */}
              {product.stock !== undefined && (
                <div className={`p-3 rounded-lg ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {product.stock > 0 ? `In Stock: ${product.stock} available` : 'Out of Stock'}
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>
              )}

              {/* Benefits */}
              {product.benefits && product.benefits.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Benefits</h3>
                  <ul className="space-y-1">
                    {product.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ingredients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Key Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ingredient, idx) => (
                      <span key={idx} className="px-3 py-1 bg-muted text-sm rounded-full">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-lg hover:bg-muted transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-x border-border py-2 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-lg hover:bg-muted transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={adding || (product.stock !== undefined && product.stock === 0)}
                className="w-full gap-2 py-6 text-lg"
              >
                <ShoppingCart size={20} />
                {adding ? 'Adding to Cart...' : 'Add to Cart'}
              </Button>
            </div>
          </div>

          {/* Additional Information */}
          {(product.longDescription || product.usage) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 pb-12 border-b">
              {product.longDescription && (
                <div>
                  <h2 className="text-xl font-bold mb-4">About This Product</h2>
                  <p className="text-muted-foreground leading-relaxed">{product.longDescription}</p>
                </div>
              )}
              {product.usage && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Usage Instructions</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{product.usage}</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>

            {/* Add Review Form: only allow if logged in AND user has ordered this product */}
            {isAuthenticated() ? (
              hasOrdered ? (
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Write a Review</h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            size={28}
                            className={star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Great product!"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <textarea
                      placeholder="Share your experience with this product..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="w-full"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground">You can submit a review for this product only after purchasing it.</p>
                </div>
              )
            ) : (
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground">Please login to submit a review.</p>
              </div>
            )}

            {/* Existing Reviews */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to review!</p>
              ) : (
                <>
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-card border border-border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{review.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            by {review.userName}
                            {review.verified && <span className="ml-2 px-2 py-1 bg-green-50 text-green-700 text-xs rounded">Verified Purchase</span>}
                          </p>
                        </div>

                        {/* Show delete button only to the review author */}
                        {user && review.userId && String(user.id) === String(review.userId) && (
                          <div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteReview(review._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}

                  {/* Review Pagination */}
                  <div className="flex justify-center gap-4 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setReviewPage(Math.max(1, reviewPage - 1))}
                      disabled={reviewPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center text-sm text-muted-foreground">
                      Page {reviewPage}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setReviewPage(reviewPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setShowImageModal(false)}>
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowImageModal(false)
            }}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-lg transition-colors z-50 cursor-pointer"
            title="Close image"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Main image */}
          <div className="relative w-full h-full flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
            {images[modalImageIndex] ? (
              <img
                src={images[modalImageIndex].startsWith('http') ? images[modalImageIndex] : `${API_CONFIG.BASE_URL}${images[modalImageIndex]}`}
                alt={`${product?.name} - Image ${modalImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => console.error('Modal image failed to load:', (e.target as HTMLImageElement).src)}
              />
            ) : (
              <div className="text-6xl">🌿</div>
            )}

            {/* Left arrow */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setModalImageIndex((prev) => (prev - 1 + images.length) % images.length)
                }}
                className="absolute left-4 text-white p-3 rounded-full bg-white/20 hover:bg-white/40 transition-colors hover:scale-110 transform z-50"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Right arrow */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setModalImageIndex((prev) => (prev + 1) % images.length)
                }}
                className="absolute right-4 text-white p-3 rounded-full bg-white/20 hover:bg-white/40 transition-colors hover:scale-110 transform z-50"
              >
                <ChevronRight size={28} />
              </button>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
                {modalImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Image thumbnails at bottom */}
          {images.length > 1 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 px-4 z-50">
              {images.map((img, idx) => (
                img && (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      setModalImageIndex(idx)
                    }}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === modalImageIndex
                        ? 'border-primary scale-110'
                        : 'border-white/30 hover:border-white/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.startsWith('http') ? img : `${API_CONFIG.BASE_URL}${img}`}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  )
}
