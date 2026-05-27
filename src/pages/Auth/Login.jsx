import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/Login.css'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await response.json()
            if (!response.ok) {
                setError(data.detail || 'Login failed')
                return
            }
            // Save to localStorage
            localStorage.setItem('token', data.token)
            localStorage.setItem('user_id', data.user_id)
            localStorage.setItem('role', data.role)
            localStorage.setItem('full_name', data.full_name)

            // Redirect based on role
            if (data.role === 'admin') navigate('/admin')
            else navigate('/')
        } catch (err) {
            setError('Could not connect to server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Login</h2>
                <p className="auth-sub">Login to start your journey to better health</p>
                {error && <p className="auth-error">{error}</p>}
                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Must be more than 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-auth" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="auth-switch">Don't have an account? <a href="/register">Sign Up</a></p>
            </div>
        </div>
    )
}

export default Login