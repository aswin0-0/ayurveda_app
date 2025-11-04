import { Link, useNavigate } from "react-router-dom"
import { SignUpForm, type SignUpData } from "@/components/forms/signup-form"
import { useState } from "react"
import { authService } from "@/services/auth.service"
import { doctorService } from "@/services/doctor.service"
import { useAuth } from "@/contexts/AuthContext"

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()

  const handleSubmit = async (data: SignUpData) => {
    setLoading(true)
    setError(null)
    
    try {
      // If user selected "doctor", use doctor signup
      if (data.userType === 'doctor') {
        const response = await doctorService.signup({
          name: data.name,
          email: data.email,
          password: data.password,
        })
        console.log("Doctor signup successful:", response.doctor.name)
        alert("Doctor account created successfully! Please login to continue.")
        navigate("/login")
      } else {
        // For patient/admin, use regular signup
        const response = await authService.signup({
          name: data.name,
          email: data.email,
          password: data.password,
          accountType: data.userType === 'admin' ? 'pro' : (data.userType as 'free' | 'pro')
        })
        console.log("Signup successful:", response.user.name)
        // Store token and redirect to dashboard
        if (response.token) {
          authLogin(response.token, data.userType, response.user)
        }
        navigate("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
      console.error("Signup error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold text-lg mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              🌿
            </div>
            <span className="text-foreground">Ayurveda</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Join Us</h1>
          <p className="text-muted-foreground">Begin your personalized wellness journey</p>
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
          
          <SignUpForm onSubmit={handleSubmit} />
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
