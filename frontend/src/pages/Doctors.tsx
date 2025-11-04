import { PageLayout } from "@/components/layout/page-layout"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { doctorService } from "@/services/doctor.service"
import type { Doctor } from "@/types/api.types"

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await doctorService.getAllDoctors()
        setDoctors(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load doctors")
        console.error("Error fetching doctors:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // Filter doctors based on search query
  const filteredDoctors = doctors.filter((doctor) => {
    const query = searchQuery.toLowerCase()
    return (
      doctor.name.toLowerCase().includes(query) ||
      (doctor.speciality && doctor.speciality.toLowerCase().includes(query)) ||
      (doctor.clinicAddress && doctor.clinicAddress.toLowerCase().includes(query))
    )
  })

  return (
    <PageLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Our Expert Doctors</h1>
            <p className="text-lg text-muted-foreground">
              Certified Ayurvedic practitioners ready to guide your wellness journey
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, speciality, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                🔍
              </span>
            </div>
            {!loading && doctors.length > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            )}
          </div>

          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading doctors...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {!loading && !error && doctors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No doctors available at the moment.</p>
            </div>
          )}

          {!loading && !error && filteredDoctors.length === 0 && doctors.length > 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No doctors found matching your search.</p>
            </div>
          )}

          {!loading && !error && filteredDoctors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor._id} className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto flex items-center justify-center text-3xl">
                    👨‍⚕️
                  </div>
                  <h3 className="text-xl font-semibold text-foreground text-center">{doctor.name}</h3>
                  <p className="text-sm text-muted-foreground text-center">{doctor.speciality || "General Ayurveda"}</p>
                  <p className="text-xs text-muted-foreground text-center">
                    {doctor.clinicAddress && `${doctor.clinicAddress} • `}
                    ₹{doctor.fee || 0}
                  </p>
                  <Link to={`/booking/${doctor._id}`}>
                    <Button className="w-full">Book Appointment</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
