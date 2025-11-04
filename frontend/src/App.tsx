import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import FindDoctors from './pages/FindDoctors'
import Doctors from './pages/Doctors'
import BookingPage from './pages/BookingPage'
import Products from './pages/Products'
import LearnAyurveda from './pages/LearnAyurveda'
import QuickRemedies from './pages/QuickRemedies'
import Quiz from './pages/Quiz'
import QuizStart from './pages/QuizStart'

// Dashboard Pages
import Dashboard from './pages/Dashboard'
import DashboardAppointments from './pages/DashboardAppointments'
import DashboardProfile from './pages/DashboardProfile'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorLogin from './pages/DoctorLogin'
import DoctorSignup from './pages/DoctorSignup'
import { ProtectedRoute } from './components/ProtectedRoute'

// Admin Pages
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminContent from './pages/AdminContent'
import AdminProducts from './pages/AdminProducts'
import AdminProductAdd from './pages/AdminProductAdd'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/find-doctors" element={<FindDoctors />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/booking/:doctorId" element={<BookingPage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/learn-ayurveda" element={<LearnAyurveda />} />
          <Route path="/quick-remedies" element={<QuickRemedies />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/start" element={<QuizStart />} />
          
          {/* Dashboard Routes - Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/appointments" element={<ProtectedRoute><DashboardAppointments /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardProfile /></ProtectedRoute>} />
          
          {/* Doctor Routes */}
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/signup" element={<DoctorSignup />} />
          <Route path="/doctor/dashboard" element={<ProtectedRoute requiredUserType="doctor"><DoctorDashboard /></ProtectedRoute>} />
          
          {/* Admin Routes - Protected */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredUserType="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredUserType="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/content" element={<ProtectedRoute requiredUserType="admin"><AdminContent /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute requiredUserType="admin"><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/products/add" element={<ProtectedRoute requiredUserType="admin"><AdminProductAdd /></ProtectedRoute>} />
        </Routes>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
