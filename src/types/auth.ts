export interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty: string;
  hospital: string;
  registrationNumber: string;
  avatarUrl?: string;
}

const REGISTERED_DOCTORS_KEY = 'netraguard_registered_doctors';

export function getRegisteredDoctors(): DoctorProfile[] {
  try {
    const data = localStorage.getItem(REGISTERED_DOCTORS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRegisteredDoctor(doctor: DoctorProfile): void {
  try {
    const list = getRegisteredDoctors();
    const filtered = list.filter(d => d.email.toLowerCase() !== doctor.email.toLowerCase());
    filtered.push(doctor);
    localStorage.setItem(REGISTERED_DOCTORS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save doctor', e);
  }
}
