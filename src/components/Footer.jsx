import '../styles/Footer.css'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h3>MediCare</h3>
          <p>Your health, our priority. Book appointments with top doctors and get AI-powered health insights.</p>
        </div>
        <div className="footer-links">
          <h4>Pages</h4>
          <Link to="/">Home</Link>
          <Link to="/doctors">Doctors</Link>
          <Link to="/booking">Book Appointment</Link>
          <Link to="/about">About</Link>
        </div>
        <div className="footer-links">
          <h4>Contact</h4>
          <p>support@medicare.com</p>
          <p>+961 123 4567</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p> &copy; 2025 MediCare. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
