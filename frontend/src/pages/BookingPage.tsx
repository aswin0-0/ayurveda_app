import { useParams, useNavigate } from "react-router-dom"
import { PageLayout } from "@/components/layout/page-layout"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { doctorService } from "@/services/doctor.service"
import { appointmentService } from "@/services/appointment.service"
import { paymentService } from "@/services/payment.service"
import { initializeRazorpay, createAppointmentPaymentOptions } from "../lib/razorpay"
import type { RazorpayResponse } from "../lib/razorpay"
import { useAuth } from "@/contexts/AuthContext"

interface Doctor {
  _id: string
  name: string
  speciality?: string
  fee?: number
  clinicAddress?: string
  phone?: string
}

export default function BookingPage() {
  const { doctorId } = useParams<{ doctorId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)
  
  // Form fields
  const [date, setDate] = useState("")
  const [mode, setMode] = useState<"online" | "offline">("online")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return
      
      try {
        const doctors = await doctorService.getAllDoctors()
        const foundDoctor = doctors.find((d: Doctor) => d._id === doctorId)
        if (foundDoctor) {
          setDoctor(foundDoctor)
        } else {
          setError("Doctor not found")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load doctor details")
      } finally {
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [doctorId])

  const handleBooking = async () => {
    if (!doctorId || !date) {
      setError("Please select a date")
      return
    }

    setBooking(true)
    setError(null)

    try {
      // Step 1: Create appointment request
      const appointment = await appointmentService.createAppointment({
        doctorId,
        date: new Date(date).toISOString(),
        mode,
        notes,
      })

      // Step 2: Create Razorpay order for the appointment
      const razorpayOrder = await paymentService.createAppointmentOrder(appointment._id)

      // Step 3: Initialize Razorpay checkout
      const paymentOptions = createAppointmentPaymentOptions(
        appointment._id,
        {
          razorpayOrderId: razorpayOrder.order.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: razorpayOrder.key_id,
        },
        {
          name: user?.name,
          email: user?.email,
          phone: user?.phone || "1234567890",
        },
        doctor?.name || "Doctor",
        async (response: RazorpayResponse) => {
          // Step 4: Verify payment on backend
          try {
            await paymentService.verifyAppointmentPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId: appointment._id,
            })

            alert("Appointment booked successfully!")
            navigate("/dashboard/appointments")
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed")
          } finally {
            setBooking(false)
          }
        },
        () => {
          // Payment cancelled
          setBooking(false)
          setError("Payment cancelled. Your appointment has been created but not confirmed.")
        }
      )

      await initializeRazorpay(paymentOptions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed")
      setBooking(false)
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
              Schedule your consultation with {loading ? "..." : doctor?.name || "Doctor"}
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading doctor details...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!loading && doctor && (
            <div className="space-y-6">
              {/* Doctor Info Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Doctor Details</h2>
                <div className="space-y-2">
                  <p><strong>Name:</strong> Dr. {doctor.name}</p>
                  {doctor.speciality && <p><strong>Speciality:</strong> {doctor.speciality}</p>}
                  {doctor.fee && (
                    <p className="text-2xl font-bold text-primary mt-4">
                      Consultation Fee: ₹{doctor.fee}
                    </p>
                  )}
                  {doctor.clinicAddress && <p><strong>Address:</strong> {doctor.clinicAddress}</p>}
                  {doctor.phone && <p><strong>Phone:</strong> {doctor.phone}</p>}
                </div>
              </div>

              {/* Booking Form */}
              <div className="bg-card border border-border rounded-lg p-8 space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Appointment Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Select Date *</label>
                    <input
                      type="date"
                      min={today}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Consultation Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as "online" | "offline")}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="online">Online</option>
                      <option value="offline">In-Person</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Reason for Visit</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      rows={4}
                      placeholder="Describe your health concerns or reason for consultation..."
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBooking}
                  disabled={booking || !date}
                >
                  {booking ? "Processing..." : `Pay ₹${doctor.fee || 0} & Book Appointment`}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Secure payment powered by Razorpay
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
