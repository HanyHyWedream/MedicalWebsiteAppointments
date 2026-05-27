import '../styles/Home.css'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="home">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Your Health, <span>Our Priority</span></h1>
          <p>Book appointments with top doctors, get AI-powered health insights, and take control of your wellbeing.</p>
          <div className="hero-buttons">
            <Link to="/booking" className="btn-primary">Book Appointment</Link>
            <Link to="/about" className="btn-secondary">Learn More</Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <h2>Our Specializations</h2>
        <p className="section-sub">Find the right doctor for your needs</p>
        <div className="services-grid">
          <div className="service-card">🫀 Cardiology</div>
          <div className="service-card">🧠 Neurology</div>
          <div className="service-card">🦴 Orthopedics</div>
          <div className="service-card">👁️ Ophthalmology</div>
          <div className="service-card">🧬 Dermatology</div>
          <div className="service-card">🥗 Nutrition</div>
        </div>
      </section>

      {/* AI Teaser */}
      <section className="ai-teaser">
        <h2>Not Sure Which Doctor to See?</h2>
        <p>Describe your symptoms and our AI will guide you to the right specialization instantly.</p>
        <Link to="/booking" className="btn-primary">Try AI Symptom Checker</Link>
      </section>

    </div>
  )
}

export default Home
