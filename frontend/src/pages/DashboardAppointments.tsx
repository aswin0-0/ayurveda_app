import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useState, useEffect } from "react"
import { appointmentService } from "@/services/appointment.service"
import type { Appointment, Doctor } from "@/types/api.types"

export default function DashboardAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getMyAppointments()
        setAppointments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load appointments")
        console.error("Error fetching appointments:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
          <p className="text-muted-foreground">Manage your scheduled consultations</p>
        </div>
        
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading appointments...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No appointments found.</p>
          </div>
        )}

        {!loading && !error && appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map((apt) => {
              const doctor = typeof apt.doctor === 'object' ? apt.doctor : null
              const doctorName = doctor?.name || 'Doctor'
              
              return (
                <div key={apt._id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">{doctorName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(apt.date)} at {formatTime(apt.date)}
                      </p>
                      {apt.mode && (
                        <p className="text-xs text-muted-foreground">Mode: {apt.mode}</p>
                      )}
                      {apt.notes && (
                        <p className="text-xs text-muted-foreground">Notes: {apt.notes}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {apt.status || 'Pending'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
