import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useEffect, useState, useCallback } from 'react'
import { appointmentService } from '@/services/appointment.service'
import { orderService } from '@/services/order.service'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/contexts/AuthContext'
import { Package, Calendar, User } from 'lucide-react'

export default function Dashboard() {
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useAuth()

  const [upcomingCount, setUpcomingCount] = useState<number | null>(null)
  const [healthScore, setHealthScore] = useState<string | null>(null)
  const [activeProgramsCount, setActiveProgramsCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch appointments and orders in parallel
      const [appointments, orders, currentUser] = await Promise.all([
        appointmentService.getMyAppointments(),
        orderService.getMyOrders(),
        // If auth context already has a user, we still call getCurrentUser to ensure latest profile
        authService.getCurrentUser(),
      ])

      // Debug: log raw responses so you can inspect network response shapes
      // (This will appear in browser console)
      // eslint-disable-next-line no-console
      console.log('Dashboard API responses:', { appointments, orders, currentUser })

      // Upcoming appointments: count appointments with date >= now and not cancelled
      const now = new Date()
      const upcoming = appointments.filter((a) => {
        try {
          const d = new Date(a.date)
          return d >= now && a.status !== 'cancelled'
        } catch (e) {
          return false
        }
      }).length

      setUpcomingCount(upcoming)

      // Active programs heuristic: use orders that are not delivered/cancelled
      const active = orders.filter((o) => {
        return o.status && o.status !== 'delivered' && o.status !== 'cancelled'
      }).length

      setActiveProgramsCount(active)

      // Health score: prefer a server-provided field, otherwise derive from profile records
      const userToUse = currentUser || authUser
      if (userToUse && (userToUse as any).healthScore != null) {
        setHealthScore(String((userToUse as any).healthScore) + '%')
      } else if (userToUse && Array.isArray((userToUse as any).records)) {
        const derived = Math.min(100, 50 + ((userToUse as any).records.length || 0) * 10)
        setHealthScore(`${derived}%`)
      } else {
        setHealthScore('—')
      }

      setLastUpdated(new Date())
    } catch (err: any) {
      console.error('Failed loading dashboard stats', err)
      setError(err?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [authUser])

  useEffect(() => {
    // Wait for auth to finish resolving before fetching data
    if (authLoading) return
    if (!isAuthenticated) {
      setError('Please login to view dashboard data')
      setLoading(false)
      return
    }

    loadStats()
  }, [authLoading, isAuthenticated, loadStats])

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your wellness dashboard</p>
        </div>

        <div className="flex items-center justify-between">
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</div>
            )}
            <button
              className="text-sm px-3 py-1 rounded bg-primary text-primary-foreground"
              onClick={() => loadStats()}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            // Loading placeholders
            [0, 1, 2].map((idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-6 space-y-2 animate-pulse">
                <div className="h-8 w-8 bg-slate-200 rounded" />
                <div className="h-6 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
              </div>
            ))
          ) : (
            [
              { title: 'Upcoming Appointments', value: upcomingCount != null ? String(upcomingCount) : '—', icon: '📅' },
              { title: 'Health Score', value: healthScore ?? '—', icon: '💚' },
              { title: 'Active Programs', value: activeProgramsCount != null ? String(activeProgramsCount) : '—', icon: '📋' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-6 space-y-2">
                <div className="text-3xl">{stat.icon}</div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/dashboard/appointments'}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">View Appointments</h3>
                <p className="text-sm text-muted-foreground">Manage your bookings</p>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/orders'}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">View Orders</h3>
                <p className="text-sm text-muted-foreground">Track your purchases</p>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/dashboard/profile'}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Edit Profile</h3>
                <p className="text-sm text-muted-foreground">Update your details</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

