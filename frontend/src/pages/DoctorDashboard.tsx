import { useState, useEffect } from 'react'
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { appointmentService } from '@/services/appointment.service'
import type { Appointment } from '@/types/api.types'

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        const data = await appointmentService.getDoctorAppointments()
        setAppointments(data)
        setError(null)
      } catch (err: any) {
        setError('Failed to load appointments')
        console.error('Error fetching doctor appointments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const handleConfirm = async (appointmentId: string) => {
    try {
      await appointmentService.confirmAppointment(appointmentId)
      // Refresh appointments
      const data = await appointmentService.getDoctorAppointments()
      setAppointments(data)
      alert('Appointment confirmed successfully!')
    } catch (err: any) {
      alert('Failed to confirm appointment: ' + err.message)
    }
  }

  const todaysAppointments = appointments.filter(apt => {
    const today = new Date()
    const aptDate = new Date(apt.date)
    return aptDate.toDateString() === today.toDateString()
  })

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending')
  const totalPatients = new Set(appointments.map(apt => apt.patient)).size

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading appointments...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Manage your practice and patients</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <div className="text-3xl">📅</div>
            <div className="text-2xl font-bold text-foreground">{todaysAppointments.length}</div>
            <div className="text-sm text-muted-foreground">Today's Appointments</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <div className="text-3xl">👥</div>
            <div className="text-2xl font-bold text-foreground">{totalPatients}</div>
            <div className="text-sm text-muted-foreground">Total Patients</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <div className="text-3xl">📝</div>
            <div className="text-2xl font-bold text-foreground">{pendingAppointments.length}</div>
            <div className="text-sm text-muted-foreground">Pending Appointments</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">All Appointments</h2>
          {appointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No appointments yet. Patients will be able to book appointments with you.
            </p>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt._id} className="border border-border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {typeof apt.patient === 'object' && apt.patient !== null 
                          ? apt.patient.name 
                          : 'Patient'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {typeof apt.patient === 'object' && apt.patient !== null 
                          ? apt.patient.email 
                          : ''}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : apt.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date: </span>
                      {new Date(apt.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time: </span>
                      {new Date(apt.date).toLocaleTimeString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mode: </span>
                      {apt.mode}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fee: </span>
                      ₹{apt.fee}
                    </div>
                  </div>
                  {apt.notes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Notes: </span>
                      {apt.notes}
                    </div>
                  )}
                  {apt.status === 'pending' && (
                    <button
                      onClick={() => handleConfirm(apt._id)}
                      className="mt-2 w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90"
                    >
                      Confirm Appointment
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
