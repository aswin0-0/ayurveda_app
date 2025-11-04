import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, User, Calendar, Heart, ShoppingCart, LogOut, Settings } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "My Appointments", href: "/dashboard/appointments", icon: Calendar },
  { label: "Health Tracking", href: "/dashboard/health", icon: Heart },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function SidebarNav() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <aside className="hidden md:flex w-64 border-r border-border/40 bg-muted/20 flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border/40">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            🌿
          </div>
          <span className="text-foreground">Ayurveda</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border/40">
        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition">
          <LogOut size={20} />
          <span className="text-sm">Log Out</span>
        </button>
      </div>
    </aside>
  )
}
