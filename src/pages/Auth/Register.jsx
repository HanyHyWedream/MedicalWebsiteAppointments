import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/Register.css'

const countryCodes = [
  { code: '+961', country: 'Lebanon',      flag: 'lb' },
  { code: '+20',  country: 'Egypt',        flag: 'eg' },
  { code: '+1',   country: 'USA',          flag: 'us' },
  { code: '+44',  country: 'UK',           flag: 'gb' },
  { code: '+33',  country: 'France',       flag: 'fr' },
  { code: '+49',  country: 'Germany',      flag: 'de' },
  { code: '+39',  country: 'Italy',        flag: 'it' },
  { code: '+34',  country: 'Spain',        flag: 'es' },
  { code: '+31',  country: 'Netherlands',  flag: 'nl' },
  { code: '+90',  country: 'Turkey',       flag: 'tr' },
  { code: '+966', country: 'Saudi Arabia', flag: 'sa' },
  { code: '+971', country: 'UAE',          flag: 'ae' },
  { code: '+974', country: 'Qatar',        flag: 'qa' },
  { code: '+965', country: 'Kuwait',       flag: 'kw' },
  { code: '+212', country: 'Morocco',      flag: 'ma' },
  { code: '+216', country: 'Tunisia',      flag: 'tn' },
  { code: '+91',  country: 'India',        flag: 'in' },
  { code: '+92',  country: 'Pakistan',     flag: 'pk' },
  { code: '+86',  country: 'China',        flag: 'cn' },
  { code: '+81',  country: 'Japan',        flag: 'jp' },
  { code: '+82',  country: 'South Korea',  flag: 'kr' },
  { code: '+55',  country: 'Brazil',       flag: 'br' },
  { code: '+52',  country: 'Mexico',       flag: 'mx' },
  { code: '+27',  country: 'South Africa', flag: 'za' },
  { code: '+234', country: 'Nigeria',      flag: 'ng' },
]

function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient'
  })
  const [selected, setSelected] = useState(countryCodes[0])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fullPhone = selected.code + formData.phone
      const response = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, phone: fullPhone })
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
            <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>

              {/* Custom Dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--surface)',
                    backgroundColor: 'var(--bg)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'var(--text)',
                    minWidth: '110px',
                    userSelect: 'none'
                  }}
                >
                  <img
                    src={`https://flagcdn.com/w40/${selected.flag}.png`}
                    alt={selected.country}
                    style={{ width: '22px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
                  />
                  <span>{selected.code}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '10px' }}>▼</span>
                </div>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    zIndex: 999,
                    backgroundColor: 'white',
                    border: '1px solid var(--surface)',
                    borderRadius: '8px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    width: '200px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}>
                    {countryCodes.map((c) => (
                      <div
                        key={c.code}
                        onClick={() => { setSelected(c); setDropdownOpen(false) }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: 'var(--text)',
                          backgroundColor: selected.code === c.code ? 'var(--surface)' : 'white'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = selected.code === c.code ? 'var(--surface)' : 'white'}
                      >
                        <img
                          src={`https://flagcdn.com/w40/${c.flag}.png`}
                          alt={c.country}
                          style={{ width: '22px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
                        />
                        <span>{c.country}</span>
                        <span style={{ marginLeft: 'auto', color: 'var(--text-light)' }}>{c.code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="text"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                style={{ flex: 1 }}
              />
            </div>
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