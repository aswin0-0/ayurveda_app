import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const questions = [
  {
    id: 1,
    question: "How would you describe your body type?",
    options: [
      { text: "Slim, light, often cold", dosha: "Vata" },
      { text: "Medium build, muscular, warm", dosha: "Pitta" },
      { text: "Sturdy, heavy, gains weight easily", dosha: "Kapha" },
    ],
  },
  {
    id: 2,
    question: "How is your appetite and digestion?",
    options: [
      { text: "Irregular, sometimes skips meals", dosha: "Vata" },
      { text: "Strong appetite, gets angry when hungry", dosha: "Pitta" },
      { text: "Slow digestion, prefers light food", dosha: "Kapha" },
    ],
  },
  {
    id: 3,
    question: "What best describes your sleep pattern?",
    options: [
      { text: "Light, easily disturbed", dosha: "Vata" },
      { text: "Moderate, 6–8 hours", dosha: "Pitta" },
      { text: "Heavy, long sleep, hard to wake up", dosha: "Kapha" },
    ],
  },
  {
    id: 4,
    question: "How would you describe your temperament?",
    options: [
      { text: "Worry-prone, creative, easily distracted", dosha: "Vata" },
      { text: "Focused, perfectionist, can get irritated", dosha: "Pitta" },
      { text: "Calm, patient, laid-back", dosha: "Kapha" },
    ],
  },
  {
    id: 5,
    question: "How do you react to stress?",
    options: [
      { text: "Anxious or nervous", dosha: "Vata" },
      { text: "Irritated or angry", dosha: "Pitta" },
      { text: "Withdrawn or tired", dosha: "Kapha" },
    ],
  },
];

const doshaDescriptions = {
  Vata: "Vata types are energetic, creative, and quick-thinking but may experience anxiety and irregular routines. Balancing routines, warmth, and grounding foods help.",
  Pitta: "Pitta types are driven, intelligent, and ambitious but prone to anger and overheating. Cooling foods, calmness, and moderation bring balance.",
  Kapha: "Kapha types are calm, strong, and compassionate but can become sluggish or complacent. Stimulation, variety, and light foods help balance them.",
};

const doshaIcons = {
  Vata: "🌪️",
  Pitta: "🔥", 
  Kapha: "🌍"
};

// Navigation Component for Quiz Page
function QuizNavigation() {
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
          <li><Link to="/#ayurveda" className="nav-link">Learn Ayurveda</Link></li>
          <li><Link to="/#herbs" className="nav-link">Explore Herbs</Link></li>
          <li><Link to="/#consultation" className="nav-link">Book Consultation</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default function DoshaQuiz() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSelect = (questionId, dosha) => {
    setAnswers((prev) => ({ ...prev, [questionId]: dosha }));
  };

  const calculateDosha = () => {
    const counts = { Vata: 0, Pitta: 0, Kapha: 0 };
    Object.values(answers).forEach((d) => counts[d]++);
    const dominant = Object.keys(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b
    );
    setResult(dominant);
    
    // Scroll to result smoothly
    setTimeout(() => {
      const resultElement = document.querySelector('.result-container');
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setResult(null);
    // Scroll to top when retaking quiz
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dosha-quiz-page">
      <QuizNavigation />
      
      <div className="quiz-container">
        <div className="quiz-header">
          <h1 className="quiz-title">🧘 Ayurvedic Dosha Quiz</h1>
          <p className="quiz-subtitle">Discover your unique Ayurvedic constitution</p>
        </div>

        {!result ? (
          <div className="quiz-content">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
              ></div>
            </div>
            <p className="progress-text">
              Question {Object.keys(answers).length} of {questions.length}
            </p>

            {questions.map((q) => (
              <div key={q.id} className="question-card">
                <h3 className="question-title">{q.question}</h3>
                <div className="options-container">
                  {q.options.map((opt, idx) => (
                    <label
                      key={idx}
                      className={`option-label ${
                        answers[q.id] === opt.dosha ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt.dosha}
                        className="option-radio"
                        onChange={() => handleSelect(q.id, opt.dosha)}
                      />
                      <span className="option-text">{opt.text}</span>
                      <span className="dosha-indicator">{doshaIcons[opt.dosha]}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              className="submit-button"
              onClick={calculateDosha}
              disabled={Object.keys(answers).length < questions.length}
            >
              {Object.keys(answers).length < questions.length 
                ? `Answer ${questions.length - Object.keys(answers).length} more questions`
                : "🔮 Discover My Dosha"
              }
            </button>
          </div>
        ) : (
          <div className="result-container">
            <div className="result-card">
              <div className="result-icon">{doshaIcons[result]}</div>
              <h2 className="result-title">Your Dominant Dosha: {result}</h2>
              <p className="result-description">{doshaDescriptions[result]}</p>
              
              <div className="result-actions">
                <button
                  onClick={handleRetakeQuiz}
                  className="retake-button"
                >
                  🔄 Retake Quiz
                </button>
                <Link to="/" className="home-button">
                  🏠 Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}