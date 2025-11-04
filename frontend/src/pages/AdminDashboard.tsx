import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Link } from "react-router-dom"
import { Package, Users, Stethoscope, Calendar, ShoppingCart, Settings, Plus } from "lucide-react"

export default function AdminDashboard() {
  const quickActions = [
    {
      title: "Add Product",
      description: "Add new Ayurvedic products",
      icon: <Plus className="w-8 h-8" />,
      href: "/admin/products/add",
      color: "bg-blue-500",
    },
    {
      title: "Manage Products",
      description: "View and edit all products",
      icon: <Package className="w-8 h-8" />,
      href: "/admin/products",
      color: "bg-green-500",
    },
    {
      title: "Manage Users",
      description: "View patient accounts",
      icon: <Users className="w-8 h-8" />,
      href: "/admin/users",
      color: "bg-purple-500",
    },
    {
      title: "Manage Doctors",
      description: "View doctor profiles",
      icon: <Stethoscope className="w-8 h-8" />,
      href: "/admin/doctors",
      color: "bg-orange-500",
    },
    {
      title: "Appointments",
      description: "View all bookings",
      icon: <Calendar className="w-8 h-8" />,
      href: "/admin/appointments",
      color: "bg-pink-500",
    },
    {
      title: "Orders",
      description: "Manage product orders",
      icon: <ShoppingCart className="w-8 h-8" />,
      href: "/admin/orders",
      color: "bg-yellow-500",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your Ayurveda platform</p>
          </div>
          <Link
            to="/admin/settings"
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "Total Users", value: "1,234", icon: "👥", change: "+12%" },
            { title: "Active Doctors", value: "45", icon: "👨‍⚕️", change: "+5%" },
            { title: "Appointments", value: "567", icon: "📅", change: "+23%" },
            { title: "Revenue", value: "₹12.5k", icon: "💰", change: "+18%" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg p-6 space-y-2">
              <div className="flex justify-between items-start">
                <div className="text-3xl">{stat.icon}</div>
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.title}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                to={action.href}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow group"
              >
                <div className={`${action.color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: "New user registered", user: "John Doe", time: "2 minutes ago" },
              { action: "New appointment booked", user: "Dr. Sharma", time: "15 minutes ago" },
              { action: "Product order placed", user: "Jane Smith", time: "1 hour ago" },
              { action: "Doctor profile updated", user: "Dr. Verma", time: "3 hours ago" },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
