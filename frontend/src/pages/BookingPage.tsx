import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { PageLayout } from "@/components/layout/page-layout"
import { Button } from "@/components/ui/button"
import { appointmentService } from "@/services/appointment.service"
import { doctorService } from "@/services/doctor.service"
import type { Doctor } from "@/types/api.types"

export default function BookingPage() {
  const { doctorId } = useParams<{ doctorId: string }>()
  const navigate = useNavigate()
  
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    date: '',
    time: '10:00',
    mode: 'online' as 'online' | 'offline',
    notes: ''
  })

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return
      try {
        const doctors = await doctorService.getAllDoctors()
        const foundDoctor = doctors.find(d => d._id === doctorId)
        if (foundDoctor) {
          setDoctor(foundDoctor)
        }
      } catch (err) {
        console.error("Error fetching doctor:", err)
      }
    }
    fetchDoctor()
  }, [doctorId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!doctorId) {
      setError("Doctor ID is required")
      return
    }
    
    if (!formData.date || !formData.time) {
      setError("Please select both date and time")
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Combine date and time into a single Date object
      const dateTime = new Date(`${formData.date}T${formData.time}:00`)
      
      await appointmentService.createAppointment({
        doctorId,
        date: dateTime.toISOString(),
        mode: formData.mode,
        notes: formData.notes
      })
      
      setSuccess(true)
      
      // Redirect to appointments page after 2 seconds
      setTimeout(() => {
        navigate('/dashboard/appointments')
      }, 2000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to book appointment")
      console.error("Booking error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <PageLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Book Appointment</h1>
            <p className="text-lg text-muted-foreground">
              Schedule your consultation with {doctor?.name || 'Doctor'}
            </p>
            {doctor?.speciality && (
              <p className="text-sm text-muted-foreground">
                Speciality: {doctor.speciality}
              </p>
            )}
            {doctor?.fee && (
              <p className="text-sm font-medium text-foreground">
                Consultation Fee: ₹{doctor.fee}
              </p>
            )}
          </div>
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-center">
              Appointment booked successfully! Redirecting to appointments...
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="date" className="text-sm font-medium">Select Date</label>
                <input 
                  type="date" 
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={today}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md" 
                  required
                />
              </div>
              
              <div>
                <label htmlFor="time" className="text-sm font-medium">Select Time</label>
                <select 
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                  required
                >
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="mode" className="text-sm font-medium">Consultation Mode</label>
                <select 
                  id="mode"
                  name="mode"
                  value={formData.mode}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                  required
                >
                  <option value="online">Online</option>
                  <option value="offline">In-Person</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="notes" className="text-sm font-medium">Reason for Visit (Optional)</label>
                <textarea 
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md" 
                  rows={4}
                  placeholder="Describe your health concerns..."
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={loading || success}
            >
              {loading ? "Booking..." : success ? "Booked!" : "Confirm Booking"}
            </Button>
          </form>
        </div>
      </div>
    </PageLayout>
  )
}
