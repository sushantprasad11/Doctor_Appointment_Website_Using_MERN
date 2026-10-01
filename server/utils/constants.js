/**
 * Application-wide constants, enums, and reference data.
 */

const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
};

const VERIFICATION_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  NO_SHOW: 'no_show',
};

const CONSULTATION_TYPES = {
  AUDIO: 'audio',
  VIDEO: 'video',
};

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Orthopedic',
  'ENT Specialist',
  'Gynecologist',
  'Ophthalmologist',
  'Dentist',
  'Psychiatrist',
  'Pulmonologist',
  'Gastroenterologist',
  'Urologist',
  'Nephrologist',
  'Endocrinologist',
  'Oncologist',
  'Rheumatologist',
  'Pediatrician',
  'Surgeon',
  'Radiologist',
  'Anesthesiologist',
  'Pathologist',
  'Physiotherapist',
  'Dietitian',
  'Other',
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Urdu',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi',
  'Odia',
  'Spanish',
  'French',
  'German',
  'Arabic',
  'Chinese',
  'Japanese',
  'Other',
];

const ALLOWED_DOCUMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Consultation access window (in minutes)
const CONSULTATION_WINDOW = {
  BEFORE_START: 15,  // Can join 15 min early
  AFTER_START: 30,   // Can join up to 30 min late
};

module.exports = {
  ROLES,
  VERIFICATION_STATUS,
  APPOINTMENT_STATUS,
  CONSULTATION_TYPES,
  DAYS_OF_WEEK,
  SPECIALIZATIONS,
  LANGUAGES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_FILE_SIZE,
  CONSULTATION_WINDOW,
};
