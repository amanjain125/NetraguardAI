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

# Heatmap definitions matching JET colormap salience
HEATMAP_NORMAL = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>"
    "<radialGradient id='jbg' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='%23001a66'/>"
    "<stop offset='70%' stop-color='%23000044'/><stop offset='100%' stop-color='%23000022'/></radialGradient>"
    "<circle cx='200' cy='200' r='190' fill='url(%23jbg)' stroke='%230f172a' stroke-width='4'/>"
    "<circle cx='200' cy='200' r='90' fill='%230284c7' opacity='0.25'/>"
    "</svg>"
)

HEATMAP_MILD = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>"
    "<radialGradient id='jbg' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='%23001a66'/>"
    "<stop offset='70%' stop-color='%23000044'/><stop offset='100%' stop-color='%23000022'/></radialGradient>"
    "<circle cx='200' cy='200' r='190' fill='url(%23jbg)' stroke='%230f172a' stroke-width='4'/>"
    "<circle cx='230' cy='190' r='40' fill='%2306b6d4' opacity='0.4'/>"
    "<circle cx='230' cy='190' r='25' fill='%23eab308' opacity='0.75'/>"
    "<circle cx='225' cy='185' r='14' fill='%23ef4444' opacity='0.85'/>"
    "</svg>"
)

HEATMAP_MODERATE = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>"
    "<radialGradient id='jbg' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='%23001a66'/>"
    "<stop offset='70%' stop-color='%23000044'/><stop offset='100%' stop-color='%23000022'/></radialGradient>"
    "<circle cx='200' cy='200' r='190' fill='url(%23jbg)' stroke='%230f172a' stroke-width='4'/>"
    "<circle cx='240' cy='200' r='70' fill='%2306b6d4' opacity='0.5'/>"
    "<circle cx='245' cy='205' r='45' fill='%23eab308' opacity='0.75'/>"
    "<circle cx='250' cy='210' r='28' fill='%23dc2626' opacity='0.9'/>"
    "<circle cx='225' cy='180' r='20' fill='%23ef4444' opacity='0.85'/>"
    "</svg>"
)

HEATMAP_SEVERE = (
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>"
    "<radialGradient id='jbg' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='%23001a66'/>"
    "<stop offset='70%' stop-color='%23000044'/><stop offset='100%' stop-color='%23000022'/></radialGradient>"
    "<circle cx='200' cy='200' r='190' fill='url(%23jbg)' stroke='%230f172a' stroke-width='4'/>"
    "<circle cx='200' cy='200' r='120' fill='%230284c7' opacity='0.4'/>"
    "<circle cx='235' cy='210' r='75' fill='%23eab308' opacity='0.85'/>"
    "<circle cx='240' cy='205' r='50' fill='%23dc2626' opacity='0.95'/>"
    "<circle cx='155' cy='190' r='38' fill='%23ef4444' opacity='0.9'/>"
    "</svg>"
)

def create_overlay_svg(base_svg: str, heatmap_svg: str) -> str:
    # Blend overlay containing both base fundus and JET salience map
    inner_base = base_svg.split(">", 1)[1].rsplit("</svg>", 1)[0]
    inner_heat = heatmap_svg.split(">", 1)[1].rsplit("</svg>", 1)[0]
    # Remove dark background circle from heatmap so it's a transparent overlay
    inner_heat_clean = inner_heat.replace("<circle cx='200' cy='200' r='190' fill='url(%23jbg)' stroke='%230f172a' stroke-width='4'/>", "")
    blended = f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>{inner_base}<g opacity='0.75'>{inner_heat_clean}</g></svg>"
    return f"data:image/svg+xml;utf8,{blended}"

OVERLAY_NORMAL = create_overlay_svg(MOCK_NORMAL, HEATMAP_NORMAL)
OVERLAY_MILD = create_overlay_svg(MOCK_MODERATE, HEATMAP_MILD)
OVERLAY_MODERATE = create_overlay_svg(MOCK_MODERATE, HEATMAP_MODERATE)
OVERLAY_SEVERE = create_overlay_svg(MOCK_SEVERE, HEATMAP_SEVERE)
OVERLAY_PROLIFERATIVE = create_overlay_svg(MOCK_SEVERE, HEATMAP_SEVERE)

RECORDS = [
    ("NG-2048", "Ramesh Kumar", 54, 1, MOCK_NORMAL, 0, "No DR", 0.9645, "No referable DR", "Routine screening follow-up in 12 months.", "Normal macula and optic disc. No microvascular lesions detected.", HEATMAP_NORMAL, OVERLAY_NORMAL),
    ("NG-2047", "Sunita Sharma", 48, 1, MOCK_MODERATE, 2, "Moderate DR", 0.9182, "Referable DR", "Microaneurysms, hemorrhages and hard exudates detected. Specialist evaluation advised.", "Clustered hard exudates near temporal arcade. Referred to Vitreoretinal OPD.", HEATMAP_MODERATE, OVERLAY_MODERATE),
    ("NG-2046", "Abdul Rahim", 61, 1, MOCK_MODERATE, 1, "Mild DR", 0.8840, "Mild DR", "Isolated microaneurysms detected. Repeat screening in 6 months.", "Few microaneurysms noted in lower quadrant.", HEATMAP_MILD, OVERLAY_MILD),
    ("NG-2045", "Lakshmi Devi", 59, 1, MOCK_SEVERE, 3, "Severe DR", 0.9475, "Referable DR", "Multiple hemorrhages and cotton wool spots detected. Immediate tertiary referral advised.", "Cotton wool spots in superior nasal region. High risk of maculopathy.", HEATMAP_SEVERE, OVERLAY_SEVERE),
    ("NG-2044", "Vijay Patel", 42, 1, MOCK_SEVERE, 4, "Proliferative DR", 0.9730, "Referable DR", "Neovascularization at optic disc (NVD) detected. Urgent laser photocoagulation assessment required.", "Fragile new vessel formation. Sent urgent alert to retinal surgeon.", HEATMAP_SEVERE, OVERLAY_PROLIFERATIVE),
    ("NG-2043", "Anita Roy", 50, 1, MOCK_NORMAL, 0, "No DR", 0.9810, "No referable DR", "Routine screening follow-up in 12 months.", "Clear fundus background. Good image focus.", HEATMAP_NORMAL, OVERLAY_NORMAL),
    ("NG-2042", "George D'Souza", 66, 1, MOCK_MODERATE, 2, "Moderate DR", 0.8950, "Referable DR", "Hemorrhages in >2 quadrants. Specialist evaluation recommended.", "Multiple blot hemorrhages in nasal retina.", HEATMAP_MODERATE, OVERLAY_MODERATE),
    ("NG-2041", "Meena Gowda", 45, 1, MOCK_MODERATE, 1, "Mild DR", 0.8670, "Mild DR", "Few microaneurysms. Monitor blood sugar & blood pressure.", "Mild microvascular changes.", HEATMAP_MILD, OVERLAY_MILD),
    ("NG-2040", "Rajesh Verma", 53, 1, MOCK_NORMAL, 0, "No DR", 0.9560, "No referable DR", "Routine screening follow-up.", "Normal examination.", HEATMAP_NORMAL, OVERLAY_NORMAL)
]

def seed_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Clear old records
    cursor.execute("DELETE FROM reports")
    
    # Insert rich diverse clinical records with full Grad-CAM heatmaps and overlays
    for r in RECORDS:
        cursor.execute("""
            INSERT INTO reports (
                patient_id, patient_name, patient_age, doctor_id, image_url,
                predicted_class, predicted_class_name, confidence, screening_status,
                referral_message, doctor_notes, gradcam_heatmap, gradcam_overlay
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, r)

    conn.commit()
    conn.close()
    print(f"Successfully seeded {len(RECORDS)} diverse clinical screening records into {DB_PATH}!")

if __name__ == "__main__":
    seed_database()
