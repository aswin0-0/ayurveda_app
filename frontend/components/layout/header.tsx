import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, User, LogOut, Calendar, UserCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated, userType, user, logout } = useAuth()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <span className="text-xl">🌿</span>
            </div>
            <span className="hidden sm:inline text-foreground">Ayurveda</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition group"
            >
              <Home size={16} className="group-hover:text-primary transition" />
              <span className="hidden lg:inline">Home</span>
            </Link>
            <Link
              to="/learn-ayurveda"
              className="text-sm text-muted-foreground hover:text-foreground transition font-medium hover:text-primary"
            >
              Learn Ayurveda
            </Link>
            <Link to="/quick-remedies" className="text-sm text-muted-foreground hover:text-foreground transition">
              Quick Remedies
            </Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition">
              About
            </Link>
            <Link to="/doctors" className="text-sm text-muted-foreground hover:text-foreground transition">
              Doctors
            </Link>
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition">
              Products
            </Link>
            <Link to="/quiz" className="text-sm text-muted-foreground hover:text-foreground transition">
              Body Type Quiz
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium">{user?.name?.split(' ')[0] || 'User'}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to={userType === 'doctor' ? '/doctor/dashboard' : '/dashboard'}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <UserCircle size={16} />
                        <span>Dashboard</span>
                      </Link>
                      
                      <Link
                        to={userType === 'doctor' ? '/doctor/dashboard' : '/dashboard/profile'}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <User size={16} />
                        <span>My Profile</span>
                      </Link>

                      {userType !== 'doctor' && (
                        <Link
                          to="/dashboard/appointments"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <Calendar size={16} />
                          <span>My Appointments</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-border pt-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          logout()
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted transition">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">
              <Home size={16} className="text-primary" />
              Home
            </Link>
            <Link to="/learn-ayurveda" className="block px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium">
              Learn Ayurveda
            </Link>
            <Link to="/quick-remedies" className="block px-3 py-2 rounded-lg hover:bg-muted text-sm">
              Quick Remedies
            </Link>
            <Link to="/about" className="block px-3 py-2 rounded-lg hover:bg-muted text-sm">
              About
            </Link>
            <Link to="/doctors" className="block px-3 py-2 rounded-lg hover:bg-muted text-sm">
              Doctors
            </Link>
            <Link to="/products" className="block px-3 py-2 rounded-lg hover:bg-muted text-sm">
              Products
            </Link>
            <Link to="/quiz" className="block px-3 py-2 rounded-lg hover:bg-muted text-sm">
              Body Type Quiz
            </Link>
            
            {isAuthenticated ? (
              <div className="space-y-2 pt-2 border-t border-border mt-2">
                {/* User Info */}
                <div className="px-3 py-2 bg-muted rounded-lg">
                  <p className="text-sm font-semibold">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                </div>

                {/* Menu Items */}
                <Link 
                  to={userType === 'doctor' ? '/doctor/dashboard' : '/dashboard'} 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <UserCircle size={16} />
                  Dashboard
                </Link>
                
                <Link 
                  to={userType === 'doctor' ? '/doctor/dashboard' : '/dashboard/profile'} 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={16} />
                  My Profile
                </Link>

                {userType !== 'doctor' && (
                  <Link 
                    to="/dashboard/appointments" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <Calendar size={16} />
                    My Appointments
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-destructive/10 text-sm text-destructive font-medium"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2 border-t border-border mt-2">
                <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" className="flex-1" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
