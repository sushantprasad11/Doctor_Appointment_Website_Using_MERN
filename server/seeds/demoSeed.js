const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const connectDB = require('../config/db');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

/**
 * Seed script: Populate database with fake doctors, patients, appointments & reviews.
 * Run: npm run seed:demo
 */

const DOCTORS_DATA = [
  {
    user: { name: 'Dr. Arjun Mehta', email: 'arjun.mehta@demo.com', phone: '9876543210' },
    profile: {
      fullName: 'Dr. Arjun Mehta',
      qualification: 'MBBS, MD (Cardiology)',
      specialization: ['Cardiologist', 'General Physician'],
      expertise: ['Heart Surgery', 'ECG Interpretation', 'Cardiac Rehabilitation', 'Hypertension Management'],
      diseasesTreated: ['Heart Attack', 'Chest Pain', 'Hypertension', 'Arrhythmia', 'Heart Failure'],
      bodySystems: ['Cardiovascular'],
      experience: 15,
      languages: ['English', 'Hindi'],
      bio: 'Dr. Arjun Mehta is a senior cardiologist with 15 years of experience in treating complex cardiac conditions. He has performed over 5,000 cardiac procedures and is known for his patient-centric approach. He completed his fellowship at AIIMS Delhi.',
      consultationFee: 800,
      consultationTypes: ['audio', 'video'],
      location: { clinicName: 'HeartCare Clinic', address: '12 MG Road', city: 'Mumbai', state: 'Maharashtra', country: 'India', postalCode: '400001' },
      professionalRegNumber: 'MCI-78234',
    },
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', slotDuration: 30 },
      { dayOfWeek: 3, startTime: '14:00', endTime: '18:00', slotDuration: 30 },
      { dayOfWeek: 5, startTime: '10:00', endTime: '16:00', slotDuration: 30 },
    ],
  },
  {
    user: { name: 'Dr. Priya Sharma', email: 'priya.sharma@demo.com', phone: '9876543211' },
    profile: {
      fullName: 'Dr. Priya Sharma',
      qualification: 'MBBS, MD (Dermatology)',
      specialization: ['Dermatologist'],
      expertise: ['Acne Treatment', 'Laser Therapy', 'Cosmetic Dermatology', 'Hair Transplant Consultation'],
      diseasesTreated: ['Acne', 'Eczema', 'Psoriasis', 'Fungal Infections', 'Hair Loss', 'Vitiligo'],
      bodySystems: ['Skin'],
      experience: 10,
      languages: ['English', 'Hindi', 'Marathi'],
      bio: 'Dr. Priya Sharma is a board-certified dermatologist specializing in both medical and cosmetic dermatology. With a decade of experience, she has treated over 20,000 patients. She trained at KEM Hospital, Mumbai.',
      consultationFee: 600,
      consultationTypes: ['video'],
      location: { clinicName: 'SkinGlow Dermatology', address: '45 Linking Road', city: 'Mumbai', state: 'Maharashtra', country: 'India', postalCode: '400050' },
      professionalRegNumber: 'MCI-65821',
    },
    availability: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '14:00', slotDuration: 20 },
      { dayOfWeek: 2, startTime: '15:00', endTime: '19:00', slotDuration: 20 },
      { dayOfWeek: 4, startTime: '10:00', endTime: '14:00', slotDuration: 20 },
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', slotDuration: 20 },
    ],
  },
  {
    user: { name: 'Dr. Vikram Singh', email: 'vikram.singh@demo.com', phone: '9876543212' },
    profile: {
      fullName: 'Dr. Vikram Singh',
      qualification: 'MBBS, MS (Orthopedics)',
      specialization: ['Orthopedic'],
      expertise: ['Joint Replacement', 'Sports Injury', 'Spine Surgery', 'Fracture Management'],
      diseasesTreated: ['Back Pain', 'Knee Pain', 'Arthritis', 'Fractures', 'Ligament Injury', 'Spondylitis'],
      bodySystems: ['Musculoskeletal'],
      experience: 18,
      languages: ['English', 'Hindi', 'Punjabi'],
      bio: 'Dr. Vikram Singh is one of the leading orthopedic surgeons in Delhi NCR. With 18 years of experience and over 3,000 joint replacements performed, he is a pioneer in minimally invasive orthopedic techniques. Trained at Safdarjung Hospital.',
      consultationFee: 1000,
      consultationTypes: ['audio', 'video'],
      location: { clinicName: 'BoneHealth Orthopedics', address: '78 Rajouri Garden', city: 'New Delhi', state: 'Delhi', country: 'India', postalCode: '110027' },
      professionalRegNumber: 'DMC-43219',
    },
    availability: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '14:00', slotDuration: 30 },
      { dayOfWeek: 2, startTime: '09:00', endTime: '13:00', slotDuration: 30 },
      { dayOfWeek: 4, startTime: '14:00', endTime: '18:00', slotDuration: 30 },
    ],
  },
  {
    user: { name: 'Dr. Ananya Reddy', email: 'ananya.reddy@demo.com', phone: '9876543213' },
    profile: {
      fullName: 'Dr. Ananya Reddy',
      qualification: 'MBBS, MD (Psychiatry)',
      specialization: ['Psychiatrist'],
      expertise: ['Cognitive Behavioral Therapy', 'Depression Management', 'Anxiety Disorders', 'PTSD Treatment'],
      diseasesTreated: ['Depression', 'Anxiety', 'OCD', 'Bipolar Disorder', 'Insomnia', 'PTSD', 'ADHD'],
      bodySystems: ['Nervous System'],
      experience: 8,
      languages: ['English', 'Hindi', 'Telugu'],
      bio: 'Dr. Ananya Reddy is a compassionate psychiatrist who believes in holistic mental health care. She combines evidence-based therapy with medication management. She completed her residency at NIMHANS Bangalore and has helped thousands overcome mental health challenges.',
      consultationFee: 700,
      consultationTypes: ['audio', 'video'],
      location: { clinicName: 'MindWell Psychiatry', address: '22 Banjara Hills', city: 'Hyderabad', state: 'Telangana', country: 'India', postalCode: '500034' },
      professionalRegNumber: 'TSMC-19842',
    },
    availability: [
      { dayOfWeek: 1, startTime: '11:00', endTime: '17:00', slotDuration: 45 },
      { dayOfWeek: 3, startTime: '11:00', endTime: '17:00', slotDuration: 45 },
      { dayOfWeek: 5, startTime: '11:00', endTime: '15:00', slotDuration: 45 },
    ],
  },
  {
    user: { name: 'Dr. Rahul Gupta', email: 'rahul.gupta@demo.com', phone: '9876543214' },
    profile: {
      fullName: 'Dr. Rahul Gupta',
      qualification: 'MBBS, MD (Pediatrics)',
      specialization: ['Pediatrician', 'General Physician'],
      expertise: ['Child Nutrition', 'Vaccination', 'Newborn Care', 'Growth Monitoring'],
      diseasesTreated: ['Fever', 'Cold', 'Flu', 'Childhood Asthma', 'Ear Infections', 'Growth Issues'],
      bodySystems: ['General'],
      experience: 12,
      languages: ['English', 'Hindi', 'Bengali'],
      bio: 'Dr. Rahul Gupta is a caring pediatrician dedicated to children\'s health. With 12 years of experience, he specializes in preventive care and managing complex pediatric conditions. He trained at Seth GS Medical College, Mumbai.',
      consultationFee: 500,
      consultationTypes: ['audio', 'video'],
      location: { clinicName: 'KidsCare Pediatrics', address: '56 Salt Lake', city: 'Kolkata', state: 'West Bengal', country: 'India', postalCode: '700091' },
      professionalRegNumber: 'WBMC-33412',
    },
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', slotDuration: 20 },
      { dayOfWeek: 2, startTime: '16:00', endTime: '20:00', slotDuration: 20 },
      { dayOfWeek: 3, startTime: '09:00', endTime: '12:00', slotDuration: 20 },
      { dayOfWeek: 5, startTime: '16:00', endTime: '20:00', slotDuration: 20 },
      { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', slotDuration: 20 },
    ],
  },
  {
    user: { name: 'Dr. Neha Kapoor', email: 'neha.kapoor@demo.com', phone: '9876543215' },
    profile: {
      fullName: 'Dr. Neha Kapoor',
      qualification: 'MBBS, DGO, MD (Gynecology)',
      specialization: ['Gynecologist'],
      expertise: ['Pregnancy Care', 'PCOS Management', 'Fertility Consultation', 'Menstrual Disorders'],
      diseasesTreated: ['PCOS', 'Endometriosis', 'Infertility', 'Menstrual Irregularity', 'Fibroids', 'UTI'],
      bodySystems: ['Reproductive'],
      experience: 14,
      languages: ['English', 'Hindi'],
      bio: 'Dr. Neha Kapoor is an experienced gynecologist and obstetrician with 14 years of practice. She has delivered over 4,000 babies and is passionate about women\'s reproductive health. She trained at Lady Hardinge Medical College, Delhi.',
      consultationFee: 750,
      consultationTypes: ['video'],
      location: { clinicName: 'WomenFirst Clinic', address: '33 Koramangala', city: 'Bangalore', state: 'Karnataka', country: 'India', postalCode: '560034' },
      professionalRegNumber: 'KMC-28901',
    },
    availability: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '14:00', slotDuration: 30 },
      { dayOfWeek: 3, startTime: '10:00', endTime: '14:00', slotDuration: 30 },
      { dayOfWeek: 5, startTime: '15:00', endTime: '19:00', slotDuration: 30 },
    ],
  },
];

const PATIENTS_DATA = [
  { name: 'Amit Kumar', email: 'amit.kumar@demo.com', phone: '9988776601' },
  { name: 'Sneha Patel', email: 'sneha.patel@demo.com', phone: '9988776602' },
  { name: 'Rajesh Iyer', email: 'rajesh.iyer@demo.com', phone: '9988776603' },
  { name: 'Meera Joshi', email: 'meera.joshi@demo.com', phone: '9988776604' },
  { name: 'Karan Malhotra', email: 'karan.malhotra@demo.com', phone: '9988776605' },
];

const REVIEWS_TEXT = [
  'Excellent doctor! Very knowledgeable and patient. Took time to explain everything clearly.',
  'Great experience. The consultation was thorough and helpful. Highly recommend.',
  'Very professional and caring. Made me feel comfortable throughout the consultation.',
  'Wonderful experience. The doctor was very attentive and gave clear advice.',
  'One of the best doctors I have consulted. Very detailed and empathetic.',
  'Amazing consultation. The doctor really listened and provided a comprehensive treatment plan.',
  'Very satisfied with the consultation. Will definitely book again.',
  'Highly professional. Explained the diagnosis clearly and answered all my questions.',
];

const DEFAULT_PASSWORD = 'Demo@12345';

function getRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

function getFutureDate(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
}

async function seedDemo() {
  try {
    await connectDB();

    // Check if demo data already exists
    const existing = await User.findOne({ email: 'arjun.mehta@demo.com' });
    if (existing) {
      console.log(' Demo data already exists. To re-seed, first clear the database.');
      process.exit(0);
    }

    console.log(' Seeding demo data...\n');

    // ─── Create Patients ───
    const patients = [];
    for (const p of PATIENTS_DATA) {
      const user = new User({ name: p.name, email: p.email, phone: p.phone, role: 'patient', isActive: true });
      await User.register(user, DEFAULT_PASSWORD);
      patients.push(user);
      console.log(`   Patient: ${p.name} (${p.email})`);
    }

    // ─── Create Doctors ───
    const doctors = [];
    for (const d of DOCTORS_DATA) {
      // Create user
      const user = new User({ name: d.user.name, email: d.user.email, phone: d.user.phone, role: 'doctor', isActive: true });
      await User.register(user, DEFAULT_PASSWORD);

      // Create doctor profile (already verified)
      const doctor = await Doctor.create({
        user: user._id,
        ...d.profile,
        verificationStatus: 'verified',
      });

      // Create availability
      for (const avail of d.availability) {
        await Availability.create({
          doctor: doctor._id,
          ...avail,
          isActive: true,
        });
      }

      doctors.push({ user, doctor });
      console.log(`  Doctor: ${d.profile.fullName} — ${d.profile.specialization.join(', ')}`);
    }

    console.log('');

    // ─── Create Completed Appointments + Reviews ───
    console.log('   Creating past appointments & reviews...');

    const completedAppointments = [];
    const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

    for (let i = 0; i < doctors.length; i++) {
      const doc = doctors[i];
      // Each doctor gets 2-3 completed appointments from random patients
      const numAppointments = 2 + Math.floor(Math.random() * 2);

      for (let j = 0; j < numAppointments; j++) {
        const patient = patients[(i + j) % patients.length];
        const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const slotEnd = `${String(parseInt(slot.split(':')[0]) + (parseInt(slot.split(':')[1]) >= 30 ? 1 : 0)).padStart(2, '0')}:${parseInt(slot.split(':')[1]) >= 30 ? '00' : '30'}`;
        const pastDate = getRandomDate(30);
        const consultationType = doc.doctor.consultationTypes[Math.floor(Math.random() * doc.doctor.consultationTypes.length)];

        try {
          const appt = await Appointment.create({
            patient: patient._id,
            doctor: doc.doctor._id,
            appointmentDate: pastDate,
            startTime: slot,
            endTime: slotEnd,
            consultationType,
            status: 'completed',
            consultationFee: doc.doctor.consultationFee,
          });
          completedAppointments.push({ appointment: appt, doctor: doc, patient });
        } catch (err) {
          // Skip duplicate slot conflicts
        }
      }
    }

    console.log(`  ${completedAppointments.length} completed appointments`);

    // ─── Create Reviews ───
    console.log('   Creating reviews...');
    let reviewCount = 0;

    for (const { appointment, doctor, patient } of completedAppointments) {
      if (Math.random() > 0.2) { // 80% leave reviews
        const rating = 4 + Math.floor(Math.random() * 2); // 4 or 5 stars
        const reviewText = REVIEWS_TEXT[Math.floor(Math.random() * REVIEWS_TEXT.length)];

        try {
          await Review.create({
            appointment: appointment._id,
            patient: patient._id,
            doctor: doctor.doctor._id,
            rating,
            review: reviewText,
          });
          reviewCount++;
        } catch (err) {
          // Skip if duplicate
        }
      }
    }

    console.log(`  ${reviewCount} reviews`);

    // ─── Create Upcoming Appointments ───
    console.log('  Creating upcoming appointments...');
    let upcomingCount = 0;

    for (let i = 0; i < 3; i++) {
      const doc = doctors[i];
      const patient = patients[i];
      const futureDate = getFutureDate(2 + i);
      const slot = timeSlots[i + 2];
      const slotEnd = `${String(parseInt(slot.split(':')[0]) + (parseInt(slot.split(':')[1]) >= 30 ? 1 : 0)).padStart(2, '0')}:${parseInt(slot.split(':')[1]) >= 30 ? '00' : '30'}`;
      const consultationType = doc.doctor.consultationTypes[0];

      try {
        await Appointment.create({
          patient: patient._id,
          doctor: doc.doctor._id,
          appointmentDate: futureDate,
          startTime: slot,
          endTime: slotEnd,
          consultationType,
          status: 'confirmed',
          consultationFee: doc.doctor.consultationFee,
        });
        upcomingCount++;
      } catch (err) {
        // Skip conflicts
      }
    }

    console.log(`  ${upcomingCount} upcoming appointments`);

    // ─── Summary ───
    console.log('\n══════════════════════════════════════════════');
    console.log('   Demo data seeded successfully!');
    console.log('══════════════════════════════════════════════');
    console.log(`  ${doctors.length} Verified Doctors`);
    console.log(`   ${patients.length} Patients`);
    console.log(`   ${completedAppointments.length + upcomingCount} Appointments`);
    console.log(`  ${reviewCount} Reviews`);
    console.log('');
    console.log('   Login Credentials (all users):');
    console.log(`     Password: ${DEFAULT_PASSWORD}`);
    console.log('');
    console.log('   Doctor Accounts:');
    DOCTORS_DATA.forEach(d => console.log(`     ${d.user.email}`));
    console.log('');
    console.log('   Patient Accounts:');
    PATIENTS_DATA.forEach(p => console.log(`     ${p.email}`));
    console.log('══════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error(' Error seeding demo data:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedDemo();
