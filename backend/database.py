import sqlite3
import hashlib
import json
import logging
import os
from pathlib import Path
from typing import Optional, List, Dict, Any

logger = logging.getLogger("netraguard-db")

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "netraguard.db"
UPLOADS_DIR = BASE_DIR / "saved_uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


def get_db_connection():
    """Create a database connection with dictionary-like row access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password: str) -> str:
    """Simple SHA-256 password hashing."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def init_db():
    """Initialize SQLite database tables for users, uploads, and reports."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table (Doctor Login Details)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            license_number TEXT,
            hospital TEXT,
            role TEXT DEFAULT 'doctor',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 2. Uploads Table (Uploaded Images Details)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS uploads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER,
            uploaded_by_user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(uploaded_by_user_id) REFERENCES users(id)
        )
    """)

    # 3. Reports Table (Screening Reports & Diagnosis Results)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT NOT NULL,
            patient_name TEXT,
            patient_age INTEGER,
            doctor_id INTEGER,
            upload_id INTEGER,
            image_url TEXT,
            predicted_class INTEGER NOT NULL,
            predicted_class_name TEXT NOT NULL,
            confidence REAL NOT NULL,
            screening_status TEXT NOT NULL,
            referral_message TEXT NOT NULL,
            gradcam_heatmap TEXT,
            gradcam_overlay TEXT,
            doctor_notes TEXT,
            report_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(doctor_id) REFERENCES users(id),
            FOREIGN KEY(upload_id) REFERENCES uploads(id)
        )
    """)

    conn.commit()

    # Insert default demo doctor if table is empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        default_pass = hash_password("doctor123")
        cursor.execute(
            """
            INSERT INTO users (email, password_hash, full_name, license_number, hospital, role)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                "doctor@netraguard.ai",
                default_pass,
                "Dr. Sarah Jenkins, MD",
                "OPHTH-884920",
                "St. Jude Eye Care Center",
                "doctor"
            )
        )
        conn.commit()
        logger.info("Default doctor account created in SQLite: doctor@netraguard.ai")

    conn.close()
    logger.info(f"SQLite Database initialized successfully at {DB_PATH}")


# --- User / Doctor Auth CRUD Functions ---

def register_user(email: str, password: str, full_name: str, license_number: str = "", hospital: str = "", role: str = "doctor") -> Dict[str, Any]:
    """Register a new doctor account in SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    pass_hash = hash_password(password)

    try:
        cursor.execute(
            """
            INSERT INTO users (email, password_hash, full_name, license_number, hospital, role)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (email.strip().lower(), pass_hash, full_name.strip(), license_number.strip(), hospital.strip(), role)
        )
        conn.commit()
        user_id = cursor.lastrowid
        cursor.execute("SELECT id, email, full_name, license_number, hospital, role, created_at FROM users WHERE id = ?", (user_id,))
        user = dict(cursor.fetchone())
        return user
    except sqlite3.IntegrityError:
        raise ValueError("An account with this email address already exists.")
    finally:
        conn.close()


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate doctor login credentials against SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    pass_hash = hash_password(password)

    cursor.execute(
        """
        SELECT id, email, full_name, license_number, hospital, role, created_at 
        FROM users 
        WHERE email = ? AND password_hash = ?
        """,
        (email.strip().lower(), pass_hash)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get doctor profile by email."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, full_name, license_number, hospital, role, created_at FROM users WHERE email = ?", (email.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


# --- Uploads CRUD Functions ---

def save_upload_record(filename: str, file_path: str, file_size: int, uploaded_by_user_id: Optional[int] = None) -> int:
    """Save record of an uploaded image file into SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO uploads (filename, file_path, file_size, uploaded_by_user_id)
        VALUES (?, ?, ?, ?)
        """,
        (filename, file_path, file_size, uploaded_by_user_id)
    )
    conn.commit()
    upload_id = cursor.lastrowid
    conn.close()
    return upload_id


# --- Reports CRUD Functions ---

def save_screening_report(
    patient_id: str,
    patient_name: str,
    patient_age: Optional[int],
    doctor_id: Optional[int],
    upload_id: Optional[int],
    image_url: str,
    predicted_class: int,
    predicted_class_name: str,
    confidence: float,
    screening_status: str,
    referral_message: str,
    gradcam_heatmap: Optional[str] = None,
    gradcam_overlay: Optional[str] = None,
    doctor_notes: Optional[str] = None,
    report_json: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Save a full screening report to SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    json_str = json.dumps(report_json) if report_json else None

    cursor.execute(
        """
        INSERT INTO reports (
            patient_id, patient_name, patient_age, doctor_id, upload_id,
            image_url, predicted_class, predicted_class_name, confidence,
            screening_status, referral_message, gradcam_heatmap, gradcam_overlay,
            doctor_notes, report_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            patient_id, patient_name, patient_age, doctor_id, upload_id,
            image_url, predicted_class, predicted_class_name, confidence,
            screening_status, referral_message, gradcam_heatmap, gradcam_overlay,
            doctor_notes, json_str
        )
    )
    conn.commit()
    report_id = cursor.lastrowid
    cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    row = dict(cursor.fetchone())
    conn.close()
    return row


def get_all_reports(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve all saved screening reports from SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT r.*, u.full_name as doctor_name 
        FROM reports r
        LEFT JOIN users u ON r.doctor_id = u.id
        ORDER BY r.created_at DESC
        LIMIT ?
        """,
        (limit,)
    )
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


def get_report_by_id(report_id: int) -> Optional[Dict[str, Any]]:
    """Retrieve single screening report by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT r.*, u.full_name as doctor_name 
        FROM reports r
        LEFT JOIN users u ON r.doctor_id = u.id
        WHERE r.id = ?
        """,
        (report_id,)
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def update_report_notes(report_id: int, notes: str) -> bool:
    """Update doctor notes for a screening report."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE reports SET doctor_notes = ? WHERE id = ?", (notes, report_id))
    conn.commit()
    affected = cursor.rowcount > 0
    conn.close()
    return affected


def delete_report(report_id: int) -> bool:
    """Delete a report record from SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reports WHERE id = ?", (report_id,))
    conn.commit()
    affected = cursor.rowcount > 0
    conn.close()
    return affected
