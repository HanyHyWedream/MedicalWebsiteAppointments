import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routes.auth import router as auth_router
from routes.doctors import router as doctors_router
from database import get_connection
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(doctors_router, prefix="/api/doctors")

if getattr(sys, 'frozen', False):
    DIST_DIR = os.path.join(sys._MEIPASS, "dist")
else:
    DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist")

@app.get("/api/health")
def home():
    return {"message": "Medicare API is running"}

@app.post("/api/ai-triage")
async def ai_triage(data: dict):
    user_symptoms = data.get("symptoms", "")
    patient_id = data.get("patient_id")
    prompt = f"""
    You are a medical triage assistant. 
    Analyze these symptoms: "{user_symptoms}"
    Task: Respond with ONLY ONE WORD from this exact list: 
    Cardiology, Neurology, Orthopedics, Ophthalmology, Dermatology, Nutrition.
    Constraint: Do not include any other text, punctuation, or formatting.
    """
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=10,
            temperature=0,
        )
        ai_word = response.choices[0].message.content.strip()
        clean_word = ai_word.split()[-1].replace('.', '').capitalize()
        if patient_id:
            conn = get_connection()
            cursor = conn.cursor(dictionary=True)
            try:
                cursor.execute("SELECT patient_id FROM patients WHERE user_id = %s", (patient_id,))
                patient = cursor.fetchone()
                if patient:
                    cursor.execute("SELECT specialization_id FROM specializations WHERE name = %s", (clean_word,))
                    spec = cursor.fetchone()
                    if spec:
                        cursor.execute("""
                            INSERT INTO ai_recommendations (patient_id, specialization_id, symptoms_input, confidence_score)
                            VALUES (%s, %s, %s, %s)
                        """, (patient["patient_id"], spec["specialization_id"], user_symptoms, 95.00))
                        conn.commit()
            finally:
                cursor.close()
                conn.close()
        return {"ai_response": clean_word}
    except Exception as e:
        return {"error": "AI Service unavailable", "details": str(e)}

# Serve static assets (JS, CSS, images)
app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

# Catch-all for React Router — must be last
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    return FileResponse(os.path.join(DIST_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)