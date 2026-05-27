from fastapi import APIRouter, Depends, HTTPException
from database import get_connection
from pydantic import BaseModel
from routes.auth import require_admin, require_patient, decode_token

router = APIRouter()

class DoctorCreate(BaseModel):
    full_name: str
    email: str
    specialization_id: int
    license_number: str
    years_experience: int
    bio: str

class ReviewCreate(BaseModel):
    doctor_id: int
    appointment_id: int
    rating: int
    comment: str

# --- GET ALL DOCTORS ---
@router.get("/")
def get_doctors():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT d.doctor_id, u.full_name AS name, s.name AS specialization,
                   d.years_experience AS experience, d.rating, d.bio,
                   COUNT(r.review_id) AS total_reviews
            FROM doctors d
            JOIN users u ON d.user_id = u.user_id
            JOIN specializations s ON d.specialization_id = s.specialization_id
            LEFT JOIN reviews r ON d.doctor_id = r.doctor_id
            GROUP BY d.doctor_id
        """)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

# --- GET DOCTOR REVIEWS ---
@router.get("/{doctor_id}/reviews")
def get_reviews(doctor_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT r.review_id, u.full_name AS patient_name, r.rating, 
                   r.comment, r.created_at
            FROM reviews r
            JOIN patients p ON r.patient_id = p.patient_id
            JOIN users u ON p.user_id = u.user_id
            WHERE r.doctor_id = %s
            ORDER BY r.created_at DESC
        """, (doctor_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

# --- ADD REVIEW ---
@router.post("/reviews")
def add_review(review: ReviewCreate, payload: dict = Depends(decode_token)):
    if payload.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Patients only")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT patient_id FROM patients WHERE user_id = %s", (payload["user_id"],))
        patient = cursor.fetchone()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        cursor.execute("""
            SELECT * FROM appointments 
            WHERE appointment_id = %s AND patient_id = %s AND status = 'completed'
        """, (review.appointment_id, patient["patient_id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="No completed appointment found")

        cursor.execute("""
            INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, comment)
            VALUES (%s, %s, %s, %s, %s)
        """, (patient["patient_id"], review.doctor_id, review.appointment_id, review.rating, review.comment))

        cursor.execute("""
            UPDATE doctors SET rating = (
                SELECT AVG(rating) FROM reviews WHERE doctor_id = %s
            ) WHERE doctor_id = %s
        """, (review.doctor_id, review.doctor_id))

        conn.commit()
        return {"message": "Review submitted successfully"}
    finally:
        cursor.close()
        conn.close()

# --- BOOK APPOINTMENT ---
@router.post("/book")
def book_appointment(data: dict, payload: dict = Depends(decode_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT patient_id FROM patients WHERE user_id = %s", (payload["user_id"],))
        patient = cursor.fetchone()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")

        doctor_id = data.get("doctor_id")
        date = data.get("date")

        cursor.execute("""
            INSERT INTO time_slots (doctor_id, slot_date, start_time, end_time, is_available)
            VALUES (%s, %s, '09:00:00', '10:00:00', FALSE)
        """, (doctor_id, date))
        slot_id = cursor.lastrowid

        cursor.execute("""
            INSERT INTO appointments (patient_id, doctor_id, slot_id, status)
            VALUES (%s, %s, %s, 'pending')
        """, (patient["patient_id"], doctor_id, slot_id))
        appointment_id = cursor.lastrowid

        conn.commit()
        return {"message": "Appointment booked successfully", "appointment_id": appointment_id}
    finally:
        cursor.close()
        conn.close()

# --- GET MY APPOINTMENTS ---
@router.get("/my-appointments")
def get_my_appointments(payload: dict = Depends(decode_token)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT patient_id FROM patients WHERE user_id = %s", (payload["user_id"],))
        patient = cursor.fetchone()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        cursor.execute("""
            SELECT a.appointment_id, u.full_name AS doctor_name, d.doctor_id,
                   s.name AS specialization, t.slot_date, a.status
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.doctor_id
            JOIN users u ON d.user_id = u.user_id
            JOIN specializations s ON d.specialization_id = s.specialization_id
            JOIN time_slots t ON a.slot_id = t.slot_id
            WHERE a.patient_id = %s
            ORDER BY t.slot_date DESC
        """, (patient["patient_id"],))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

# --- MARK APPOINTMENT AS COMPLETED ---
@router.put("/appointments/{appointment_id}/complete")
def complete_appointment(appointment_id: int, payload: dict = Depends(decode_token)):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE appointments SET status = 'completed' WHERE appointment_id = %s
        """, (appointment_id,))
        conn.commit()
        return {"message": "Appointment marked as completed"}
    finally:
        cursor.close()
        conn.close()