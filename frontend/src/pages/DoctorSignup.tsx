import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { doctorService } from "@/services/doctor.service"

export default function DoctorSignup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    speciality: '',
    clinicAddress: '',
    fee: '',
    phone: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      const response = await doctorService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        speciality: formData.speciality,
        clinicAddress: formData.clinicAddress,
        fee: formData.fee ? Number(formData.fee) : undefined,
        phone: formData.phone,
      })
      
      console.log("Doctor signup successful:", response.doctor.name)
      alert("Doctor account created successfully! Please login.")
      navigate("/doctor/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
      console.error("Doctor signup error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold text-lg mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              🌿
            </div>
            <span className="text-foreground">Ayurveda</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Doctor Registration</h1>
          <p className="text-muted-foreground">Join our network of Ayurvedic practitioners</p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border/40 rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {loading && (
            <div className="text-center text-sm text-muted-foreground">
              Creating your account...
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="speciality" className="block text-sm font-medium mb-2">
                  Speciality
                </label>
                <input
                  type="text"
                  id="speciality"
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleChange}
                  placeholder="e.g., Panchakarma, General Wellness"
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="clinicAddress" className="block text-sm font-medium mb-2">
                Clinic Address
              </label>
              <input
                type="text"
                id="clinicAddress"
                name="clinicAddress"
                value={formData.clinicAddress}
                onChange={handleChange}
                placeholder="Full clinic address"
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="fee" className="block text-sm font-medium mb-2">
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                id="fee"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                placeholder="500"
                min="0"
                className="w-full px-3 py-2 border border-border rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:bg-primary/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Doctor Account'}
            </button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/doctor/login" className="text-primary hover:text-primary/90 font-medium">
              Login here
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By signing up, you agree to our{" "}
          <Link to="/terms" className="text-primary hover:text-primary/90">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-primary hover:text-primary/90">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
