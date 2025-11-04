import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/auth.service'
import type { User } from '@/types/api.types'

export default function DashboardHealth() {
  const { isLoading: authLoading, isAuthenticated } = useAuth()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadHealth = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const current = await authService.getCurrentUser()
      // eslint-disable-next-line no-console
      console.log('DashboardHealth user:', current)
      setUser(current)
      setLastUpdated(new Date())
    } catch (err: any) {
      console.error('Failed to load user for health page', err)
      setError(err?.message || 'Failed to load health data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setError('Please log in to view health data')
      setLoading(false)
      return
    }

    loadHealth()
  }, [authLoading, isAuthenticated, loadHealth])

  const records = (user as any)?.records || []

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Health Tracker</h1>
          <p className="text-muted-foreground">Track your health metrics and recent records</p>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex items-center justify-between">
          {lastUpdated && (
            <div className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleString()}</div>
          )}
          <div>
            <button
              className="text-sm px-3 py-1 rounded bg-primary text-primary-foreground"
              onClick={() => loadHealth()}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <div className="text-sm text-muted-foreground">Name</div>
            <div className="text-xl font-bold text-foreground">{user?.name ?? '—'}</div>
            <div className="text-xs text-muted-foreground">{user?.email ?? ''}</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <div className="text-sm text-muted-foreground">Health Score</div>
            <div className="text-2xl font-bold text-foreground">{(user as any)?.healthScore != null ? `${(user as any).healthScore}%` : '—'}</div>
            <div className="text-xs text-muted-foreground">Auto-derived or server-provided</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <div className="text-sm text-muted-foreground">Records</div>
            <div className="text-lg font-bold text-foreground">{Array.isArray(records) ? records.length : 0}</div>
            <div className="text-xs text-muted-foreground">Recent health records</div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Recent Records</h2>
          {loading ? (
            <div className="text-muted-foreground">Loading records...</div>
          ) : !records || records.length === 0 ? (
            <div className="text-muted-foreground">No health records available.</div>
          ) : (
            <div className="space-y-3 mt-4">
              {records.slice().reverse().map((r: any, idx: number) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">{new Date(r?.date || r?.createdAt || Date.now()).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{r?.type ?? 'Record'}</div>
                  </div>
                  <div className="mt-2 text-foreground">
                    {r?.notes ? String(r.notes) : JSON.stringify(r)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
