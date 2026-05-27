import { Link, useNavigate } from "react-router-dom";
import '../styles/Navbar.css'

function Navbar() {
    const token = localStorage.getItem('token')
    const fullName = localStorage.getItem('full_name')
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.clear()
        navigate('/login')
    }

    return (
        <nav className="navbar">
            <div className="nav-logo">
                <Link to="/">MediCare</Link>
            </div>
            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/booking">Booking</Link>
                <Link to="/doctors">Doctors</Link>
                <Link to="/about">About</Link>
                <Link to="/my-appointments">My Appointments</Link>
            </div>
            <div className="nav-buttons">
                {token ? (
                    <>
                        <span className="nav-username">👤 {fullName}</span>
                        <button className="btn-signin" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">
                            <button className="btn-signin">Sign in</button>
                        </Link>
                        <Link to="/register">
                            <button className="btn-signup">Sign up</button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar