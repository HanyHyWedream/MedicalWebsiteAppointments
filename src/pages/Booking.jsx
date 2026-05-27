import { useState, useEffect } from 'react'
import '../styles/Booking.css'

const specializations = [
  { id: 1, name: 'Cardiology', icon: '🫀' },
  { id: 2, name: 'Neurology', icon: '🧠' },
  { id: 3, name: 'Orthopedics', icon: '🦴' },
  { id: 4, name: 'Ophthalmology', icon: '👁️' },
  { id: 5, name: 'Dermatology', icon: '🧬' },
  { id: 6, name: 'Nutrition', icon: '🥗' },
]

function Booking() {
  const [step, setStep] = useState(1)
  const [doctors, setDoctors] = useState([])
  const [selectedSpec, setSelectedSpec] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [confirmed, setConfirmed] = useState(false)
  const [takenDates, setTakenDates] = useState([])
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [userSymptoms, setUserSymptoms] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/doctors/')
      .then(res => res.json())
      .then(data => setDoctors(data))
      .catch(err => console.error("Error fetching doctors:", err))
  }, [])

  const handleAiConsult = async () => {
    if (!userSymptoms) return alert("Please describe how you feel.")
    setAiLoading(true)
    try {
      const patient_id = localStorage.getItem('user_id')
      const response = await fetch('http://127.0.0.1:8000/api/ai-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: userSymptoms, patient_id: parseInt(patient_id) })
      })
      const data = await response.json()
      if (data.ai_response) {
        const cleanAiResponse = data.ai_response.toUpperCase().trim()
        const recommended = specializations.find(spec =>
          cleanAiResponse.includes(spec.name.toUpperCase())
        )
        if (recommended) {
          setSelectedSpec(recommended)
          setIsAiModalOpen(false)
          setStep(2)
        } else {
          alert(`AI suggested ${data.ai_response}, but we don't have a matching category. Please select manually.`)
        }
      } else if (data.error) {
        alert("AI Error: " + data.error)
      }
    } catch (err) {
      alert("Could not connect to the AI service.")
    } finally {
      setAiLoading(false)
    }
  }

  const filteredDoctors = doctors.filter(d => d.specialization === selectedSpec?.name)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const formatDate = (year, month, day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const getDayStatus = (year, month, day) => {
    const date = new Date(year, month, day)
    const dateStr = formatDate(year, month, day)
    const dayOfWeek = date.getDay()
    if (date < today) return 'past'
    if (takenDates.includes(dateStr)) return 'taken'
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'weekend'
    return 'available'
  }

  const handleDateClick = (year, month, day) => {
    const status = getDayStatus(year, month, day)
    if (status === 'past') return alert("You can't book a date that has already passed.")
    if (status === 'taken') return alert("This date is already taken. Please choose another.")
    if (status === 'weekend') return alert("Weekends are not available for booking.")
    setSelectedDate(formatDate(year, month, day))
  }

  const handleConfirmBooking = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://127.0.0.1:8000/api/doctors/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor_id: selectedDoctor.doctor_id,
          date: selectedDate
        })
      })
      const data = await res.json()
      if (res.ok) {
        setConfirmed(true)
      } else {
        alert(data.detail || 'Booking failed')
      }
    } catch (err) {
      alert('Could not connect to server')
    }
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const cells = []

    dayNames.forEach(name => {
      cells.push(<div key={`name-${name}`} className="calendar-day-name">{name}</div>)
    })
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-day blocked" />)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day)
      const status = getDayStatus(year, month, day)
      const isSelected = selectedDate === dateStr
      let className = 'calendar-day '
      if (isSelected) className += 'selected-day'
      else if (status === 'past') className += 'blocked'
      else if (status === 'taken') className += 'taken'
      else if (status === 'weekend') className += 'weekend'
      else className += 'available'

      cells.push(
        <div key={day} className={className} onClick={() => handleDateClick(year, month, day)}>
          {day}
        </div>
      )
    }
    return cells
  }

  if (confirmed) {
    return (
      <div className="booking-confirmed">
        <div className="confirmed-card">
          <span className="confirmed-icon">✅</span>
          <h2>Appointment Confirmed!</h2>
          <p>Your visit with <strong>{selectedDoctor?.name}</strong> is set for <strong>{selectedDate}</strong>.</p>
          <p style={{ fontSize: '14px', color: 'gray' }}>You can rate your doctor after the appointment from <a href="/my-appointments">My Appointments</a>.</p>
          <button className="btn-primary" onClick={() => {
            setStep(1); setConfirmed(false)
            setSelectedSpec(null); setSelectedDoctor(null); setSelectedDate(null)
          }}>Book Another</button>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-page">
      <div className="progress-bar">
        {['Specialty', 'Doctor', 'Date', 'Confirm'].map((label, i) => (
          <div key={i} className={`progress-step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
            <div className="progress-circle">{step > i + 1 ? '✓' : i + 1}</div>
            {label}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="booking-step">
          <h2>What type of doctor do you need?</h2>
          <p className="step-sub">Select a specialization or let AI guide you</p>
          <div className="spec-grid">
            {specializations.map(spec => (
              <div
                key={spec.id}
                className={`spec-card ${selectedSpec?.id === spec.id ? 'selected' : ''}`}
                onClick={() => setSelectedSpec(spec)}
              >
                <span className="spec-icon">{spec.icon}</span>
                <span>{spec.name}</span>
              </div>
            ))}
          </div>
          <div className="ai-hint">
            <p>Not sure which specialist you need?</p>
            <button className="btn-ai" onClick={() => setIsAiModalOpen(true)}>🤖 Use AI Symptom Checker</button>
          </div>
          <div className="step-buttons">
            <button className="btn-primary" disabled={!selectedSpec} onClick={() => setStep(2)}>Next →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="booking-step">
          <h2>Choose your doctor</h2>
          <p className="step-sub">{selectedSpec?.icon} {selectedSpec?.name} specialists</p>
          <div className="doctors-list">
            {filteredDoctors.length === 0 && (
              <p style={{ color: 'gray' }}>No doctors available for this specialization.</p>
            )}
            {filteredDoctors.map(doc => (
              <div
                key={doc.doctor_id}
                className={`doctor-option ${selectedDoctor?.doctor_id === doc.doctor_id ? 'selected' : ''}`}
                onClick={() => setSelectedDoctor(doc)}
              >
                <div className="doc-avatar">{doc.name.charAt(3)}</div>
                <div>
                  <h4>{doc.name}</h4>
                  <p>⭐ {doc.rating} · {doc.experience} years experience · {doc.total_reviews} reviews</p>
                  <p style={{ fontSize: '13px', color: 'gray' }}>{doc.bio}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="step-buttons">
            <button onClick={() => setStep(1)}>← Back</button>
            <button className="btn-primary" disabled={!selectedDoctor} onClick={() => setStep(3)}>Next →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="booking-step">
          <h2>Pick a date</h2>
          <p className="step-sub">Select an available date for your appointment</p>
          <div className="calendar">
            <div className="calendar-header">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>‹</button>
              <h3>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>›</button>
            </div>
            <div className="calendar-grid">{renderCalendar()}</div>
          </div>
          <div className="calendar-legend">
            <span className="legend-available">● Available</span>
            <span className="legend-taken">● Taken</span>
            <span className="legend-weekend">● Weekend</span>
            <span className="legend-blocked">● Past</span>
          </div>
          {selectedDate && <p>Selected: <strong>{selectedDate}</strong></p>}
          <div className="step-buttons">
            <button onClick={() => setStep(2)}>← Back</button>
            <button className="btn-primary" disabled={!selectedDate} onClick={() => setStep(4)}>Next →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="booking-step">
          <h2>Confirm your appointment</h2>
          <div className="confirm-card">
            <div className="confirm-row"><span>Specialization</span><strong>{selectedSpec?.name}</strong></div>
            <div className="confirm-row"><span>Doctor</span><strong>{selectedDoctor?.name}</strong></div>
            <div className="confirm-row"><span>Date</span><strong>{selectedDate}</strong></div>
            <div className="confirm-row"><span>Rating</span><strong>⭐ {selectedDoctor?.rating}</strong></div>
          </div>
          <div className="no-show-warning">
            ⚠️ Please make sure to attend your appointment. No-shows affect doctor availability for other patients.
          </div>
          <div className="step-buttons">
            <button onClick={() => setStep(3)}>← Back</button>
            <button className="btn-primary" onClick={handleConfirmBooking}>Confirm Booking ✓</button>
          </div>
        </div>
      )}

      {isAiModalOpen && (
        <div className="ai-modal-overlay">
          <div className="ai-modal">
            <h3>🤖 AI Symptom Checker</h3>
            <p style={{ color: 'gray', fontSize: '14px' }}>Describe your symptoms and we'll recommend the right specialist.</p>
            <textarea
              value={userSymptoms}
              onChange={(e) => setUserSymptoms(e.target.value)}
              placeholder="e.g. I have chest pain and shortness of breath..."
            />
            <div className="modal-buttons">
              <button onClick={() => setIsAiModalOpen(false)}>Close</button>
              <button className="btn-primary" onClick={handleAiConsult} disabled={aiLoading}>
                {aiLoading ? "Analyzing..." : "Get Recommendation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Booking