import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/Register.css'

function Register() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'patient'
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await response.json()
            if (!response.ok) {
                setError(data.detail || 'Registration failed')
                return
            }
            navigate('/login')
        } catch (err) {
            setError('Could not connect to server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p className="auth-sub">Join thousands of patients on MediCare</p>
                {error && <p className="auth-error">{error}</p>}
                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            placeholder="Enter your full name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Must be more than 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-auth" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>
                <p className="auth-switch">Already have an account? <a href="/login">Login</a></p>
            </div>
        </div>
    )
}

export default Register