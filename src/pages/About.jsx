import '../styles/About.css'
import { Link } from 'react-router-dom'


// linking to the booking page . divided into seperate blocks

function About() {
  return (
    <div className="about">

      <section className="about-hook">
        <h1>We built MediCare because finding the right doctor shouldn't be complicated.</h1>
      </section>

      <section className="about-who">


        <div className="about-block">
          <h2>Who We Are</h2>
          <p> I'm driven by one belief — technology should make healthcare more human, not less. After seeing how many people struggle to find the right specialist at the right time, we decided to build something that actually helps. MediCare exists to bridge the gap between patients and the care they deserve.</p>
        </div>

        <div className="about-block">
          <h2>What We Do</h2>
          <p>From booking appointments with top-rated doctors to AI-powered symptom guidance, everything on MediCare is designed to put you in the right hands faster.</p>
        </div>

        <div className="about-block">
          <h2>Where It Started</h2>
          <p>This started as a passion project — one person, a laptop, and a genuine desire to use technology to help people live healthier lives. A belief that this field, when done right, can make a real difference.</p>
        </div>
      </section>
    

      <section className="about-cta">
        <h2>Ready to take the first step toward better health?</h2>
        <Link to="/booking" className="btn-primary">Book Appointment Now</Link>
      </section> 

    </div>
  )
}

export default About