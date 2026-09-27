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

export const DEMO_DOCTORS: DoctorProfile[] = [
  {
    id: 'DOC-KA-4102',
    name: 'Dr. Kalyani Sharma',
    email: 'dr.kalyani@netraguard.ai',
    role: 'Chief Ophthalmologist',
    specialty: 'Vitreoretinal Specialist (MD, FRCS)',
    hospital: 'AIIMS Apex Eye Centre & Diabetic Retinopathy Clinic',
    registrationNumber: 'KMC-89421',
  },
  {
    id: 'DOC-KA-7781',
    name: 'Dr. Aman Jain',
    email: 'dr.aman@netraguard.ai',
    role: 'Senior Retinal Consultant',
    specialty: 'Ophthalmic Surgery & DR Tele-screening (MS)',
    hospital: 'National Rural Eye Care Mission (District KA-04)',
    registrationNumber: 'MMC-65103',
  },
];
