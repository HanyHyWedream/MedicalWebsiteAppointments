import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function MyAppointments() {
    const [appointments, setAppointments] = useState([])
    const [reviewModal, setReviewModal] = useState(null)
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        const res = await fetch('http://127.0.0.1:8000/api/doctors/my-appointments', {
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setAppointments(data)
    }

    const markAsCompleted = async (appointment_id) => {
        const res = await fetch(`http://127.0.0.1:8000/api/doctors/appointments/${appointment_id}/complete`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) fetchAppointments()
        else alert('Failed to update status')
    }

    const handleReview = async () => {
        setLoading(true)
        try {
            const res = await fetch('http://127.0.0.1:8000/api/doctors/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    doctor_id: reviewModal.doctor_id,
                    appointment_id: reviewModal.appointment_id,
                    rating: parseInt(rating),
                    comment
                })
            })
            const data = await res.json()
            if (res.ok) {
                alert('Review submitted successfully!')
                setReviewModal(null)
                setRating(5)
                setComment('')
                fetchAppointments()
            } else {
                alert(data.detail || 'Failed to submit review')
            }
        } catch (err) {
            alert('Server error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }}>
            <h1 style={{ marginBottom: '8px' }}>My Appointments</h1>
            <p style={{ color: 'gray', marginBottom: '32px' }}>
                View your bookings and rate doctors after completed appointments.
            </p>

            {appointments.length === 0 && (
                <p style={{ color: 'gray' }}>No appointments found. <a href="/booking">Book one now!</a></p>
            )}

            {appointments.map(app => (
                <div key={app.appointment_id} style={{
                    background: 'white', border: '1px solid #e5e7eb',
                    borderRadius: '12px', padding: '20px 24px',
                    marginBottom: '16px', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ marginBottom: '4px' }}>{app.doctor_name}</h3>
                        <p style={{ color: 'gray', fontSize: '14px' }}>{app.specialization} · {app.slot_date}</p>
                        <span style={{
                            display: 'inline-block', marginTop: '8px',
                            padding: '3px 10px', borderRadius: '999px', fontSize: '13px',
                            background: app.status === 'completed' ? '#d1fae5' : app.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                            color: app.status === 'completed' ? '#065f46' : app.status === 'cancelled' ? '#991b1b' : '#92400e'
                        }}>
                            {app.status}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {app.status === 'pending' && (
                            <button
                                onClick={() => markAsCompleted(app.appointment_id)}
                                style={{
                                    background: '#10b981', color: 'white',
                                    border: 'none', padding: '8px 16px',
                                    borderRadius: '8px', cursor: 'pointer'
                                }}>
                                Mark Completed
                            </button>
                        )}
                        {app.status === 'completed' && (
                            <button
                                onClick={() => setReviewModal(app)}
                                style={{
                                    background: '#2563eb', color: 'white',
                                    border: 'none', padding: '8px 16px',
                                    borderRadius: '8px', cursor: 'pointer'
                                }}>
                                ⭐ Rate Doctor
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {reviewModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px',
                        padding: '32px', width: '90%', maxWidth: '480px'
                    }}>
                        <h2 style={{ marginBottom: '8px' }}>Rate {reviewModal.doctor_name}</h2>
                        <p style={{ color: 'gray', marginBottom: '24px', fontSize: '14px' }}>
                            Your honest feedback helps other patients!
                        </p>

                        <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Rating</label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    onClick={() => setRating(star)}
                                    style={{ fontSize: '32px', cursor: 'pointer', opacity: star <= rating ? 1 : 0.3 }}
                                >⭐</span>
                            ))}
                        </div>

                        <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            style={{
                                width: '100%', height: '100px', padding: '10px',
                                borderRadius: '8px', border: '1px solid #d1d5db',
                                fontFamily: 'inherit', marginBottom: '20px',
                                resize: 'none', boxSizing: 'border-box'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setReviewModal(null)}
                                style={{
                                    padding: '8px 16px', borderRadius: '8px',
                                    border: '1px solid #d1d5db', cursor: 'pointer', background: 'white'
                                }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleReview}
                                disabled={loading}
                                style={{
                                    padding: '8px 20px', borderRadius: '8px',
                                    background: '#2563eb', color: 'white',
                                    border: 'none', cursor: 'pointer'
                                }}>
                                {loading ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyAppointments