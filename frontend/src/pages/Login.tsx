import { Link, useNavigate } from "react-router-dom"
import { LoginForm } from "@/components/forms/login-form"
import { useState } from "react"
import { authService } from "@/services/auth.service"
import { doctorService } from "@/services/doctor.service"
import { adminService } from "@/services/admin.service"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()

  const handleSubmit = async (email: string, password: string, userType: "patient" | "doctor" | "admin") => {
    setLoading(true)
    setError(null)
    
    try {
      if (userType === 'admin') {
        // Admin login
        localStorage.setItem('temp_email', email) // Store email temporarily
        const response = await adminService.login({ email, password })
        authLogin(response.token, 'admin')
        console.log("Admin login successful")
        navigate("/admin/dashboard")
      } else if (userType === 'doctor') {
        // Doctor login
        localStorage.setItem('temp_email', email) // Store email temporarily
        const response = await doctorService.login({ email, password })
        authLogin(response.token, 'doctor')
        console.log("Doctor login successful")
        navigate("/doctor/dashboard")
      } else {
        // Patient login
        const response = await authService.login({ email, password })
        authLogin(response.token, userType, response.user)
        console.log("Login successful:", response.user.name)
        navigate("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      console.error("Login error:", err)
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
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your wellness journey</p>
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
              Logging in...
            </div>
          )}
          
          <LoginForm onSubmit={handleSubmit} />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue as</span>
            </div>
          </div>

          {/* Social Login Placeholders */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-border/40 rounded-lg hover:bg-muted transition">
              <span>🔵</span>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-border/40 rounded-lg hover:bg-muted transition">
              <span>🍎</span>
              <span className="text-sm font-medium">Apple</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
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
