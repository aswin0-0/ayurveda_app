import './App.css';
import './styles/DoshaQuiz.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import DoshaQuiz from './pages/doshiquiz.jsx';

// Navigation Component
function Navigation() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>🕉️ AyurVeda</h2>
        </div>
        <ul className="nav-menu">
          <li><button onClick={() => scrollToSection('ayurveda')} className="nav-link-btn">Learn Ayurveda</button></li>
          <li><button onClick={() => scrollToSection('herbs')} className="nav-link-btn">Explore Herbs</button></li>
          <li><button onClick={() => scrollToSection('consultation')} className="nav-link-btn">Book Consultation</button></li>
          <li><button onClick={() => scrollToSection('dosha')} className="nav-link-btn">Dosha Quiz</button></li>
        </ul>
      </div>
    </nav>
  );
}

// Hero Banner Component
function HeroBanner() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="hero-banner">
      <div className="hero-content">
        <h1 className="hero-title">Ancient Healing for Modern Living</h1>
        <p className="hero-subtitle">
          Discover the timeless wisdom of Ayurveda for holistic wellness and natural healing
        </p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => scrollToSection('ayurveda')}>
            Learn About Ayurveda
          </button>
          <button className="btn-secondary" onClick={() => scrollToSection('consultation')}>
            Book Consultation
          </button>
        </div>
      </div>
      <div className="hero-decoration">
        <div className="mandala"></div>
      </div>
    </section>
  );
}

// Learn About Ayurveda Section
function LearnAyurveda() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section id="ayurveda" className="section learn-ayurveda">
      <div className="container">
        <h2 className="section-title">Learn About Ayurveda</h2>
        <div className="content-grid">
          <div className="content-card">
            <div className="card-icon">🌿</div>
            <h3>Ancient Wisdom</h3>
            <p>Ayurveda is a 5,000-year-old system of natural healing that originated in India. It emphasizes the balance between mind, body, and spirit.</p>
            <button className="learn-more-btn" onClick={() => scrollToSection('consultation')}>
              Consult an Expert
            </button>
          </div>
          <div className="content-card">
            <div className="card-icon">⚖️</div>
            <h3>Three Doshas</h3>
            <p>Understanding your unique constitution through Vata (air), Pitta (fire), and Kapha (earth) helps create personalized wellness plans.</p>
            <button className="learn-more-btn" onClick={() => scrollToSection('dosha')}>
              Take Dosha Quiz
            </button>
          </div>
          <div className="content-card">
            <div className="card-icon">🧘</div>
            <h3>Holistic Approach</h3>
            <p>Ayurveda treats the whole person, not just symptoms, using diet, herbs, yoga, meditation, and lifestyle practices.</p>
            <button className="learn-more-btn" onClick={() => scrollToSection('herbs')}>
              Explore Herbs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Explore Herbs Section
function ExploreHerbs() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const herbs = [
    { name: "Turmeric", benefit: "Anti-inflammatory & Immunity", icon: "🌾" },
    { name: "Ashwagandha", benefit: "Stress Relief & Energy", icon: "🌱" },
    { name: "Tulsi", benefit: "Respiratory Health", icon: "🍃" },
    { name: "Triphala", benefit: "Digestive Health", icon: "🌿" }
  ];

  return (
    <section id="herbs" className="section explore-herbs">
      <div className="container">
        <h2 className="section-title">Explore Ayurvedic Herbs</h2>
        <p className="section-subtitle">Discover nature's pharmacy with traditional healing herbs</p>
        <div className="herbs-grid">
          {herbs.map((herb, index) => (
            <div key={index} className="herb-card">
              <div className="herb-icon">{herb.icon}</div>
              <h3>{herb.name}</h3>
              <p>{herb.benefit}</p>
              <button className="herb-btn" onClick={() => scrollToSection('consultation')}>
                Get Consultation
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Book Consultation Section
function BookConsultation() {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here
    alert('Thank you! We will contact you soon to schedule your consultation.');
  };

  return (
    <section id="consultation" className="section book-consultation">
      <div className="container">
        <h2 className="section-title">Book a Consultation</h2>
        <div className="consultation-content">
          <div className="consultation-info">
            <h3>Personalized Ayurvedic Guidance</h3>
            <p>Connect with experienced Ayurvedic practitioners who will assess your unique constitution and create a personalized wellness plan.</p>
            <ul className="consultation-benefits">
              <li>✓ Dosha assessment and analysis</li>
              <li>✓ Personalized diet recommendations</li>
              <li>✓ Herbal remedy suggestions</li>
              <li>✓ Lifestyle guidance</li>
              <li>✓ Follow-up support</li>
            </ul>
          </div>
          <div className="consultation-form">
            <h4>Schedule Your Session</h4>
            <form className="booking-form" onSubmit={handleFormSubmit}>
              <input type="text" placeholder="Full Name" required />
              <input type="email" placeholder="Email Address" required />
              <input type="tel" placeholder="Phone Number" required />
              <select required>
                <option value="">Select Consultation Type</option>
                <option value="initial">Initial Consultation (90 min)</option>
                <option value="followup">Follow-up Session (60 min)</option>
                <option value="wellness">Wellness Check (30 min)</option>
              </select>
              <textarea placeholder="Tell us about your health concerns..."></textarea>
              <button type="submit" className="btn-primary">Book Consultation</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// Custom Link component that scrolls to top when navigating to quiz
function ScrollToTopLink({ to, children, ...props }) {
  const handleClick = () => {
    // Small delay to ensure navigation happens first
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

// Dosha Quiz Section with navigation using ScrollToTopLink
function DoshaQuizSection() {
  return (
    <section id="dosha" className="section dosha-quiz">
      <div className="container">
        <h2 className="section-title">Discover Your Dosha</h2>
        <div className="quiz-content">
          <div className="quiz-intro">
            <p>Take our comprehensive quiz to discover your unique Ayurvedic constitution and receive personalized recommendations.</p>
            <div className="dosha-types">
              <div className="dosha-type">
                <h4>🌪️ Vata</h4>
                <p>Air & Space - Creative, energetic, quick-thinking</p>
              </div>
              <div className="dosha-type">
                <h4>🔥 Pitta</h4>
                <p>Fire & Water - Focused, ambitious, organized</p>
              </div>
              <div className="dosha-type">
                <h4>🌍 Kapha</h4>
                <p>Earth & Water - Calm, steady, nurturing</p>
              </div>
            </div>
          </div>
          <div className="quiz-action">
            <ScrollToTopLink to="/dosha-quiz" className="btn-primary quiz-btn">
              Start Dosha Quiz
            </ScrollToTopLink>
            <p className="quiz-time">⏱️ Takes about 10 minutes</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🕉️ AyurVeda</h3>
            <p>Ancient healing wisdom for modern wellness</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><button onClick={() => scrollToSection('ayurveda')} className="footer-link-btn">Learn Ayurveda</button></li>
              <li><button onClick={() => scrollToSection('herbs')} className="footer-link-btn">Explore Herbs</button></li>
              <li><button onClick={() => scrollToSection('consultation')} className="footer-link-btn">Book Consultation</button></li>
              <li><button onClick={() => scrollToSection('dosha')} className="footer-link-btn">Dosha Quiz</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>📧 info@ayurveda.com</p>
            <p>📞 +1 (555) 123-4567</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 AyurVeda. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Homepage Component
function Homepage() {
  return (
    <div className="App">
      <Navigation />
      <HeroBanner />
      <LearnAyurveda />
      <ExploreHerbs />
      <BookConsultation />
      <DoshaQuizSection />
      <Footer />
    </div>
  );
}

// Main App Component with Routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/dosha-quiz" element={<DoshaQuiz />} />
      </Routes>
    </Router>
  );
}

export default App;