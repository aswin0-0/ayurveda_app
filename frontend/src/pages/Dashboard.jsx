import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Dashboard.css';

// Navigation Component for Dashboard
function DashboardNavigation({ user, onLogout }) {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2>🕉️ AyurVeda</h2>
          </Link>
        </div>
        <ul className="nav-menu">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/dosha-quiz" className="nav-link">Dosha Quiz</Link></li>
          <li><Link to="/quick-remedies" className="nav-link">Quick Remedies</Link></li>
          <li><span className="user-greeting">Hello, {user?.name}!</span></li>
          <li><button onClick={onLogout} className="logout-btn">Logout</button></li>
        </ul>
      </div>
    </nav>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
      // verify token with server and refresh user data if possible
      const API = process.env.REACT_APP_API_URL || '';
      fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          // ignore — keep local user
        });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner">🔄</div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <DashboardNavigation user={user} onLogout={handleLogout} />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>🙏 Welcome to Your Ayurvedic Journey, {user.name}!</h1>
          <p>Your personalized wellness dashboard</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">🔮</div>
            <h3>Dosha Assessment</h3>
            <p>Discover your unique Ayurvedic constitution</p>
            <Link to="/dosha-quiz" className="card-btn">Take Quiz</Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🌿</div>
            <h3>Quick Remedies</h3>
            <p>Natural solutions for common health issues</p>
            <Link to="/quick-remedies" className="card-btn">Explore Remedies</Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📅</div>
            <h3>Book Consultation</h3>
            <p>Connect with Ayurvedic practitioners</p>
            <Link to="/#consultation" className="card-btn">Schedule Now</Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📚</div>
            <h3>Learn Ayurveda</h3>
            <p>Deepen your understanding of ancient wisdom</p>
            <Link to="/#ayurveda" className="card-btn">Start Learning</Link>
          </div>
        </div>

        <div className="wellness-stats">
          <h2>Your Wellness Journey</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">0</div>
              <div className="stat-label">Quizzes Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">0</div>
              <div className="stat-label">Consultations Booked</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">0</div>
              <div className="stat-label">Remedies Tried</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}