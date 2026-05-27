import { useState, useEffect } from 'react'
import '../styles/Doctors.css'

const specializationIcons = {
  Cardiology: '🫀',
  Neurology: '🧠',
  Orthopedics: '🦴',
  Ophthalmology: '👁️',
  Dermatology: '🧬',
  Nutrition: '🥗',
}

function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/doctors/')
      .then(res => res.json())
      .then(data => { setDoctors(data); setLoading(false) })
      .catch(err => { console.error("Error fetching doctors:", err); setLoading(false) })
  }, [])

  return (
    <div className="doctors-page">

      <section className="doctors-header">
        <h1>Our Doctors</h1>
        <p>Meet our top rated specialists. Trusted by thousands of patients every month.</p>
      </section>

      <section className="doctors-grid-section">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'gray' }}>Loading doctors...</p>
        ) : (
          <div className="doctors-grid">
            {doctors.map(doctor => (
              <div className="doctor-card" key={doctor.doctor_id}>
                {doctor.rating >= 4.9 && (
                  <span className="trending-badge">🔥 Doctor of the month</span>
                )}
                <div className="doctor-avatar">
                  {doctor.name.charAt(4)}
                </div>
                <h3>{doctor.name}</h3>
                <p className="doctor-spec">
                  {specializationIcons[doctor.specialization] || '🏥'} {doctor.specialization}
                </p>
                <div className="doctor-stats">
                  <span>⭐ {doctor.rating}</span>
                  <span>🕐 {doctor.experience} yrs</span>
                  <span>📝 {doctor.total_reviews} reviews</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

export default Doctors