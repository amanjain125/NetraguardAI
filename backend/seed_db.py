import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "netraguard.db"

MOCK_NORMAL = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>"
    "<radialGradient id='bg' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='%23b93815'/>"
    "<stop offset='70%' stop-color='%237f1d1d'/><stop offset='100%' stop-color='%23240401'/></radialGradient>"
    "<circle cx='200' cy='200' r='190' fill='url(%23bg)' stroke='%230f172a' stroke-width='4'/>"
    "<ellipse cx='130' cy='200' rx='28' ry='34' fill='%23fef08a' opacity='0.9'/>"
    "<circle cx='250' cy='210' r='22' fill='%23450a0a' opacity='0.8'/>"
    "<path d='M 130 180 C 150 130, 200 100, 260 100' stroke='%23580b06' stroke-width='4' fill='none'/>"
    "<path d='M 130 220 C 150 270, 200 300, 260 300' stroke='%23580b06' stroke-width='4' fill='none'/>"
    "</svg>"
)

MOCK_MODERATE = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>"
    "<radialGradient id='bg' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='%23b93815'/>"
    "<stop offset='70%' stop-color='%237f1d1d'/><stop offset='100%' stop-color='%23240401'/></radialGradient>"
    "<circle cx='200' cy='200' r='190' fill='url(%23bg)' stroke='%230f172a' stroke-width='4'/>"
    "<ellipse cx='130' cy='200' rx='28' ry='34' fill='%23fef08a' opacity='0.9'/>"
    "<circle cx='250' cy='210' r='22' fill='%23450a0a' opacity='0.8'/>"
    "<path d='M 130 180 C 150 130, 200 100, 260 100' stroke='%23580b06' stroke-width='4' fill='none'/>"
    "<path d='M 130 220 C 150 270, 200 300, 260 300' stroke='%23580b06' stroke-width='4' fill='none'/>"
    "<circle cx='220' cy='180' r='3.5' fill='%23dc2626'/>"
    "<circle cx='235' cy='230' r='4' fill='%23b91c1c'/>"
    "<circle cx='270' cy='190' r='3' fill='%23fef08a'/>"
    "<circle cx='280' cy='220' r='4' fill='%23dc2626'/>"
    "</svg>"
)

MOCK_SEVERE = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>"
    "<radialGradient id='bg' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='%23b93815'/>"
    "<stop offset='70%' stop-color='%237f1d1d'/><stop offset='100%' stop-color='%23240401'/></radialGradient>"
    "<circle cx='200' cy='200' r='190' fill='url(%23bg)' stroke='%230f172a' stroke-width='4'/>"
    "<ellipse cx='130' cy='200' rx='28' ry='34' fill='%23fef08a' opacity='0.9'/>"
    "<circle cx='250' cy='210' r='22' fill='%23450a0a' opacity='0.8'/>"
    "<path d='M 130 180 C 150 130, 200 100, 260 100' stroke='%23580b06' stroke-width='4' fill='none'/>"
    "<path d='M 130 220 C 150 270, 200 300, 260 300' stroke='%23580b06' stroke-width='4' fill='none'/>"
    "<circle cx='220' cy='180' r='4' fill='%23dc2626'/>"
    "<circle cx='235' cy='230' r='5' fill='%23991b1b'/>"
    "<circle cx='270' cy='190' r='4' fill='%23fef08a'/>"
    "<ellipse cx='230' cy='160' rx='12' ry='8' fill='%23fef3c7' opacity='0.75'/>"
    "<ellipse cx='290' cy='240' rx='14' ry='9' fill='%23fef3c7' opacity='0.75'/>"
    "</svg>"
)

RECORDS = [
    ("NG-2048", "Ramesh Kumar", 54, 1, MOCK_NORMAL, 0, "No DR", 0.9645, "No referable DR", "Routine screening follow-up in 12 months.", "Normal macula and optic disc. No microvascular lesions detected."),
    ("NG-2047", "Sunita Sharma", 48, 1, MOCK_MODERATE, 2, "Moderate DR", 0.9182, "Referable DR", "Microaneurysms, hemorrhages and hard exudates detected. Specialist evaluation advised.", "Clustered hard exudates near temporal arcade. Referred to Vitreoretinal OPD."),
    ("NG-2046", "Abdul Rahim", 61, 1, MOCK_MODERATE, 1, "Mild DR", 0.8840, "Mild DR", "Isolated microaneurysms detected. Repeat screening in 6 months.", "Few microaneurysms noted in lower quadrant."),
    ("NG-2045", "Lakshmi Devi", 59, 1, MOCK_SEVERE, 3, "Severe DR", 0.9475, "Referable DR", "Multiple hemorrhages and cotton wool spots detected. Immediate tertiary referral advised.", "Cotton wool spots in superior nasal region. High risk of maculopathy."),
    ("NG-2044", "Vijay Patel", 42, 1, MOCK_SEVERE, 4, "Proliferative DR", 0.9730, "Referable DR", "Neovascularization at optic disc (NVD) detected. Urgent laser photocoagulation assessment required.", "Fragile new vessel formation. Sent urgent alert to retinal surgeon."),
    ("NG-2043", "Anita Roy", 50, 1, MOCK_NORMAL, 0, "No DR", 0.9810, "No referable DR", "Routine screening follow-up in 12 months.", "Clear fundus background. Good image focus."),
    ("NG-2042", "George D'Souza", 66, 1, MOCK_MODERATE, 2, "Moderate DR", 0.8950, "Referable DR", "Hemorrhages in >2 quadrants. Specialist evaluation recommended.", "Multiple blot hemorrhages in nasal retina."),
    ("NG-2041", "Meena Gowda", 45, 1, MOCK_MODERATE, 1, "Mild DR", 0.8670, "Mild DR", "Few microaneurysms. Monitor blood sugar & blood pressure.", "Mild microvascular changes."),
    ("NG-2040", "Rajesh Verma", 53, 1, MOCK_NORMAL, 0, "No DR", 0.9560, "No referable DR", "Routine screening follow-up.", "Normal examination.")
]

def seed_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Clear old records
    cursor.execute("DELETE FROM reports")
    
    # Insert rich diverse clinical records
    for r in RECORDS:
        cursor.execute("""
            INSERT INTO reports (
                patient_id, patient_name, patient_age, doctor_id, image_url,
                predicted_class, predicted_class_name, confidence, screening_status,
                referral_message, doctor_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, r)

    conn.commit()
    conn.close()
    print(f"Successfully seeded {len(RECORDS)} diverse clinical screening records into {DB_PATH}!")

if __name__ == "__main__":
    seed_database()
