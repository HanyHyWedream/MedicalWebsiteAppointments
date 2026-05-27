import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Home from './pages/Home'
import Booking from './pages/Booking'
import Doctors from './pages/Doctors'
import About from './pages/About'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MyAppointments from './pages/MyAppointments'

// Protected route - only logged in users can access
function ProtectedRoute({ element }) {
  const token = localStorage.getItem('token')
  return token ? element : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/booking' element={<ProtectedRoute element={<Booking />} />} />
        <Route path='/my-appointments' element={<ProtectedRoute element={<MyAppointments />} />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App