# 🏥 Doctor Appointment Website — Complete Project Documentation

> **Language**: Hinglish (Hindi + English mix)
> **Developer**: Sushant Prasad
> **Tech Stack**: MERN (MongoDB, Express.js, React.js, Node.js) + Google Gemini AI

---

## 📋 Table of Contents

1. [Project Ka Overview](#1-project-ka-overview)
2. [Technology Stack & Packages](#2-technology-stack--packages)
3. [Project Architecture & Folder Structure](#3-project-architecture--folder-structure)
4. [Database Design](#4-database-design)
5. [Project Flow — Kaise Kaam Karta Hai](#5-project-flow--kaise-kaam-karta-hai)
6. [Feature-wise Implementation](#6-feature-wise-implementation)
7. [AI Chatbot Integration](#7-ai-chatbot-integration)
8. [Security Implementation](#8-security-implementation)
9. [Frontend Implementation](#9-frontend-implementation)

---

## 1. Project Ka Overview

### Ye Project Kya Hai?

Ye ek **Doctor Appointment Booking Website** hai jisme:
- **Patients** verified doctors ko search kar sakte hain, unka profile dekh sakte hain, available slots check kar sakte hain, aur clinic appointment book kar sakte hain
- **Doctors** apna professional profile create kar sakte hain, documents upload kar sakte hain verification ke liye, apna schedule set kar sakte hain, aur appointments manage kar sakte hain
- **Admin** doctors ko verify/reject kar sakta hai, platform ki statistics dekh sakta hai, aur saari appointments monitor kar sakta hai
- **AI Chatbot** patients ko symptoms batane par possible diseases suggest karta hai aur sahi doctor recommend karta hai (Google Gemini AI powered)

### 3 User Roles:

| Role | Kya Kar Sakta Hai |
|------|------------------|
| **Patient** | Doctor search, profile dekho, appointment book karo, review do |
| **Doctor** | Profile banao, documents upload karo, schedule set karo, appointments manage karo |
| **Admin** | Doctors ko verify/reject karo, stats dekho, platform monitor karo |

### Important Rule:
> ⚠️ **Koi bhi doctor tab tak publicly visible nahi hoga jab tak admin ne uske documents verify nahi kar diye**

---

## 2. Technology Stack & Packages

### 🖥️ Backend Packages (server/package.json)

| Package | Version | Kyun Use Kiya? |
|---------|---------|---------------|
| **express** | ^5.1.0 | Ye Node.js ka sabse popular **web framework** hai. Isse hum REST APIs banate hain — routes, middleware, request/response handling sab Express se hota hai. Bina Express ke humein raw HTTP module se kaam karna padta jo bahut tedious hai. |
| **mongoose** | ^8.15.1 | Ye **MongoDB ka ODM (Object Document Mapper)** hai. Isse hum MongoDB ke documents ko JavaScript objects ki tarah use kar sakte hain. Models, schemas, validation, indexes — sab Mongoose handle karta hai. Direct MongoDB driver use karna complex hota hai, Mongoose simplify karta hai. |
| **passport** | ^0.7.0 | Ye **authentication middleware** hai Node.js ke liye. Isse login/logout system implement karna easy ho jata hai. Passport multiple strategies support karta hai (Google, Facebook, Local, etc.) |
| **passport-local** | ^1.0.0 | Ye Passport ki **Local Strategy** hai — matlab email + password se login. Hum Google/Facebook login nahi use kar rahe, sirf email-password, isliye ye strategy use ki. |
| **passport-local-mongoose** | ^8.0.0 | Ye Mongoose + Passport ko **automatically connect** karta hai. Password hashing (PBKDF2), salt generation, username field setup — sab automatic ho jata hai. Bina iske humein manually bcrypt se hash karna padta. |
| **express-session** | ^1.18.1 | Ye **session management** handle karta hai. Jab user login karta hai, server ek session create karta hai aur client ko ek cookie deta hai. Har request mein ye cookie jaati hai aur server user ko identify karta hai. |
| **connect-mongo** | ^5.1.0 | By default sessions **server ki memory** mein store hoti hain — agar server restart ho toh sab sessions khatam. Ye package sessions ko **MongoDB mein store** karta hai, toh server restart ke baad bhi users logged in rehte hain. |
| **joi** | ^17.13.3 | Ye **input validation** library hai. User jo bhi data bhejta hai (registration form, appointment booking, etc.) usko validate karta hai — ki email sahi format mein hai, password strong hai, required fields hain ya nahi. Isse invalid data database mein nahi jaata. |
| **multer** | ^2.0.1 | Ye **file upload** handle karta hai. Jab doctor apne degree/certificate ki photo upload karta hai, Multer us file ko parse karta hai aur memory mein rakhta hai (hum memory storage use karte hain, disk mein nahi save karte). |
| **cloudinary** | ^2.6.1 | Ye **cloud-based image/file storage** service hai. Multer se file memory mein aati hai, phir hum Cloudinary SDK se us file ko **cloud mein upload** kar dete hain. Isse files humare server par space nahi leti aur CDN se fast load hoti hain. |
| **cors** | ^2.8.5 | **Cross-Origin Resource Sharing**. Humaara frontend (port 5173) aur backend (port 5000) alag ports par chalte hain. Bina CORS ke browser frontend se backend API call block kar dega. Ye middleware CORS headers set karta hai. |
| **helmet** | ^8.1.0 | Ye **security headers** set karta hai HTTP responses mein. XSS protection, content-type sniffing prevention, clickjacking protection — sab automatically add ho jaate hain. Production mein ye bahut zaroori hai. |
| **express-mongo-sanitize** | ^2.2.0 | Ye **NoSQL injection attacks** se protect karta hai. Agar koi user `{ "$gt": "" }` jaisa malicious data bheje, ye usko sanitize kar deta hai. Bina iske attacker database queries manipulate kar sakta hai. |
| **express-rate-limit** | ^7.5.0 | Ye **brute force attacks** se protect karta hai. Hum login route par rate limiting lagaate hain — ek IP se sirf 20 requests 15 minute mein. Isse koi bot baar baar password try nahi kar sakta. |
| **dotenv** | ^16.5.0 | Ye `.env` file se **environment variables** load karta hai. Database URL, API keys, secrets — ye sab code mein hardcode nahi karte, `.env` file mein rakhte hain aur dotenv se load karte hain. |
| **@google/generative-ai** | ^0.24.0 | Ye **Google Gemini AI** ka official SDK hai. Isse hum Gemini API ko call karte hain symptoms analyze karne ke liye. Patient symptoms bhejta hai, Gemini AI conditions aur specialist suggest karta hai. |
| **nodemon** | ^3.1.14 | Ye **development tool** hai. Jab bhi hum koi server file change karte hain, nodemon automatically server restart kar deta hai. Bina iske manually `node server.js` baar baar run karna padta. |
| **concurrently** | ^9.1.2 | Ye ek saath **multiple commands** run karta hai. `npm run dev` se frontend aur backend dono ek saath start ho jaate hain ek terminal mein. |

### 🎨 Frontend Packages (client/package.json)

| Package | Kyun Use Kiya? |
|---------|---------------|
| **react** | Ye **UI library** hai Facebook ki. Components banate hain (Navbar, DoctorCard, etc.) jo reusable hain aur state change hone par automatically re-render hote hain. |
| **react-dom** | React ko **browser DOM** se connect karta hai. React virtual DOM mein kaam karta hai, react-dom usse actual HTML mein render karta hai. |
| **react-router-dom** | Ye **client-side routing** provide karta hai. `/doctors`, `/login`, `/admin/dashboard` — ye sab pages bina page reload ke switch hote hain (SPA - Single Page Application). |
| **axios** | Ye **HTTP client** hai API calls ke liye. `fetch()` se zyada features hain — interceptors, automatic JSON parsing, error handling, credentials (cookies) support. |
| **react-icons** | Ye **icon library** hai — 1000+ icons available hain (Feather icons, Material icons, etc.). Har jagah icons use kiye hain (search, calendar, phone, etc.). |
| **peerjs** | Ye **WebRTC peer-to-peer** library hai. (Currently not actively used after removing video consultation, but installed as dependency). |
| **vite** | Ye **build tool** hai React ke liye. Create React App se bahut fast hai — Hot Module Replacement instant hota hai, build bhi fast hota hai (~300ms). |

---

## 3. Project Architecture & Folder Structure

### MVC Architecture Kya Hai?

Hum **MVC (Model-View-Controller)** pattern follow karte hain:

```
M — Model      → Database schemas (User, Doctor, Appointment, etc.)
V — View       → React frontend (pages, components)
C — Controller → Business logic (request handle karo, response bhejo)
```

Iske alawa hum **Services** layer bhi use karte hain:
```
Request → Route → Controller → Service → Model → Database
                                  ↓
                              Response
```

### Folder Structure:

```
DOCTER_MERN/
├── .env                          # Environment variables (secrets)
├── .env.example                  # Example env file (guide)
├── package.json                  # Root scripts (dev, seed:admin, seed:demo)
├── README.md                     # English documentation
│
├── server/                       # ═══ BACKEND ═══
│   ├── server.js                 # Entry point — server start hota hai yahan se
│   ├── app.js                    # Express app setup — middleware + routes register
│   │
│   ├── config/
│   │   ├── db.js                 # MongoDB connection (mongoose.connect)
│   │   ├── passport.js           # Passport strategy configuration
│   │   └── cloudinary.js         # Cloudinary SDK setup
│   │
│   ├── models/                   # Database schemas
│   │   ├── User.js               # User model (email, password, role)
│   │   ├── Doctor.js             # Doctor profile (qualification, specialization, fee)
│   │   ├── DoctorVerification.js # Verification documents (separate from profile!)
│   │   ├── Appointment.js        # Appointments (patient, doctor, date, time, status)
│   │   ├── Availability.js       # Doctor ke available time slots
│   │   └── Review.js             # Patient reviews for doctors
│   │
│   ├── controllers/              # Request handlers
│   │   ├── authController.js     # Register, Login, Logout, Me
│   │   ├── doctorController.js   # Doctor CRUD, Search, Filter
│   │   ├── appointmentController.js  # Book, Cancel, Complete appointments
│   │   ├── availabilityController.js # Manage doctor schedules
│   │   ├── verificationController.js # Submit documents for verification
│   │   ├── adminController.js    # Admin dashboard, verify/reject doctors
│   │   ├── reviewController.js   # Submit and view reviews
│   │   ├── consultationController.js # Consultation access check
│   │   └── aiController.js       # AI symptom analysis endpoint
│   │
│   ├── routes/                   # API route definitions
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── doctorRoutes.js       # /api/doctors/*
│   │   ├── appointmentRoutes.js  # /api/appointments/*
│   │   ├── availabilityRoutes.js # /api/availability/*
│   │   ├── verificationRoutes.js # /api/verification/*
│   │   ├── adminRoutes.js        # /api/admin/*
│   │   ├── reviewRoutes.js       # /api/reviews/*
│   │   ├── consultationRoutes.js # /api/consultation/*
│   │   └── aiRoutes.js           # /api/ai/*
│   │
│   ├── middleware/
│   │   ├── auth.js               # requireAuth — login check
│   │   ├── role.js               # requireDoctor, requirePatient, requireAdmin
│   │   ├── validation.js         # Joi validation middleware factory
│   │   ├── upload.js             # Multer file upload config
│   │   └── errorHandler.js       # Centralized error handler
│   │
│   ├── validators/               # Joi validation schemas
│   │   ├── authValidator.js      # Registration & login rules
│   │   ├── doctorValidator.js    # Doctor profile rules
│   │   ├── appointmentValidator.js # Booking rules
│   │   ├── availabilityValidator.js # Schedule rules
│   │   ├── reviewValidator.js    # Review rules
│   │   └── verificationValidator.js # Document upload rules
│   │
│   ├── services/                 # Business logic layer
│   │   ├── cloudinaryService.js  # Upload/delete files from Cloudinary
│   │   ├── appointmentService.js # Slot generation, conflict check
│   │   ├── verificationService.js # Status transition logic
│   │   ├── consultationService.js # Access validation
│   │   └── aiService.js          # Google Gemini AI integration
│   │
│   ├── utils/
│   │   ├── ExpressError.js       # Custom error class (statusCode + message)
│   │   ├── wrapAsync.js          # Async error wrapper for controllers
│   │   └── constants.js          # Enums (roles, statuses, days, etc.)
│   │
│   └── seeds/
│       ├── adminSeed.js          # Initial admin user create karo
│       └── demoSeed.js           # Demo doctors + patients + appointments
│
├── client/                       # ═══ FRONTEND ═══
│   ├── index.html                # HTML entry point
│   ├── vite.config.js            # Vite config (API proxy to port 5000)
│   │
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # Router + Layout (Navbar + Pages + Footer + ChatBot)
│       ├── index.css             # Complete design system (1800+ lines!)
│       │
│       ├── api/                  # Axios API calls
│       │   ├── axiosConfig.js    # Axios instance (baseURL, interceptors)
│       │   ├── authApi.js        # Login, register, logout, me
│       │   ├── doctorApi.js      # Doctor CRUD, search
│       │   ├── appointmentApi.js # Book, cancel, complete
│       │   ├── availabilityApi.js# Schedule management
│       │   ├── adminApi.js       # Admin APIs, verification
│       │   ├── reviewApi.js      # Reviews
│       │   └── aiApi.js          # AI symptom checker
│       │
│       ├── context/
│       │   └── AuthContext.jsx   # Global auth state (user, role, login/logout)
│       │
│       ├── hooks/
│       │   ├── useAuth.js        # Auth context ka shortcut hook
│       │   └── useToast.js       # Toast notification hook
│       │
│       ├── components/
│       │   ├── ChatBot.jsx       # AI Floating chatbot widget
│       │   ├── layout/
│       │   │   ├── Navbar.jsx    # Top navigation bar
│       │   │   └── Footer.jsx    # Footer with credits
│       │   └── common/
│       │       ├── ProtectedRoute.jsx  # Login required wrapper
│       │       ├── RoleRoute.jsx       # Role-based access wrapper
│       │       ├── LoadingSpinner.jsx  # Loading animation
│       │       ├── Toast.jsx           # Notification popup
│       │       └── EmptyState.jsx      # Empty data message
│       │
│       └── pages/
│           ├── Home.jsx              # Landing page
│           ├── Login.jsx             # Login form
│           ├── Register.jsx          # Registration form
│           ├── DoctorDirectory.jsx   # Doctor search & listing
│           ├── DoctorProfilePage.jsx # Individual doctor profile
│           ├── BookAppointment.jsx   # Appointment booking flow
│           ├── PatientDashboardPage.jsx  # Patient's appointments
│           ├── DoctorDashboardPage.jsx   # Doctor's dashboard
│           ├── AdminDashboardPage.jsx    # Admin panel
│           ├── ConsultationRoom.jsx      # (Legacy - not active)
│           └── NotFound.jsx              # 404 page
```

---

## 4. Database Design

### Models Aur Unke Relationships:

```
User (email, password, role)
  │
  ├──→ Doctor Profile (1:1 relationship)
  │       ├──→ DoctorVerification (1:many — multiple documents)
  │       ├──→ Availability (1:many — har din ka schedule)
  │       └──→ Appointments (1:many — doctor ke appointments)
  │
  └──→ Appointments (1:many — patient ke appointments)
          └──→ Review (1:1 — ek appointment pe ek review)
```

### Har Model Ka Purpose:

#### 🧑 User Model
```
{
  email: "patient@email.com",      // Login ke liye (unique)
  name: "Amit Kumar",              // Display name
  phone: "9876543210",             // Contact
  role: "patient/doctor/admin",    // Role decide karta hai kya access milega
  isActive: true                   // Account active hai ya nahi
}
```
**Khaas baat**: `passport-local-mongoose` plugin use kiya hai — ye automatically password hash karta hai (PBKDF2 algorithm se), salt add karta hai, aur `authenticate()`, `register()` methods deta hai.

#### 👨‍⚕️ Doctor Model
```
{
  user: ObjectId → User,           // Kis user ka profile hai
  fullName: "Dr. Arjun Mehta",
  qualification: "MBBS, MD",
  specialization: ["Cardiologist"], // Array — multiple specializations
  expertise: ["Heart Surgery"],     // Kisme expert hai
  diseasesTreated: ["Heart Attack"],// Kaunsi diseases treat karta hai
  experience: 15,                   // Years
  consultationFee: 800,             // Visiting fee (₹)
  verificationStatus: "verified",   // pending → verified (admin decides)
  location: {
    clinicName: "HeartCare Clinic",
    city: "Mumbai",
    state: "Maharashtra"
  }
}
```
**Khaas baat**: 
- **Text Index** lagaya hai `fullName`, `specialization`, `expertise`, `diseasesTreated`, `city` par — isse full-text search kaam karta hai
- **verificationStatus** ka flow: `pending → under_review → verified/rejected → suspended`
- Sirf `verified` status wale doctors publicly dikhte hain

#### 📋 DoctorVerification Model
```
{
  doctor: ObjectId → Doctor,
  documents: [{
    url: "https://cloudinary.com/...",  // Document ki photo
    publicId: "verifications/abc123"    // Cloudinary ID (delete ke liye)
  }],
  status: "pending",
  rejectionReason: ""              // Agar reject ho toh reason
}
```
**Khaas baat**: Ye **separate model** hai Doctor se — kyunki verification documents sensitive hain aur public API se kabhi expose nahi hone chahiye. Sirf admin hi dekh sakta hai.

#### 📅 Appointment Model
```
{
  patient: ObjectId → User,
  doctor: ObjectId → Doctor,
  appointmentDate: "2024-03-15",
  startTime: "09:00",
  endTime: "09:30",
  status: "confirmed",             // pending/confirmed/completed/cancelled
  consultationFee: 800
}
```
**Khaas baat**: **Compound Unique Index** hai `(doctor, appointmentDate, startTime)` par — isse ek hi time slot par do patients book nahi kar sakte. Ye **database level** par double booking prevent karta hai, even if two people click "Book" at the exact same millisecond.

#### 🕐 Availability Model
```
{
  doctor: ObjectId → Doctor,
  dayOfWeek: 1,                    // 0=Sunday, 1=Monday, ...
  startTime: "09:00",
  endTime: "13:00",
  slotDuration: 30,                // Minutes mein
  isActive: true
}
```
**Khaas baat**: Doctor har din ke liye alag schedule set kar sakta hai. `slotDuration` se system automatically time slots generate karta hai (e.g., 09:00, 09:30, 10:00...).

#### ⭐ Review Model
```
{
  appointment: ObjectId → Appointment,  // Kis appointment ke liye review
  patient: ObjectId → User,
  doctor: ObjectId → Doctor,
  rating: 5,                        // 1-5 stars
  review: "Great doctor!"           // Optional text
}
```
**Khaas baat**: Sirf **completed** appointments ke liye review de sakte hain. Ek appointment pe sirf ek review allowed hai.

---

## 5. Project Flow — Kaise Kaam Karta Hai

### 5.1 Authentication Flow (Login/Register)

```
┌─────────────────────────────────────────────────┐
│  Patient clicks "Register"                       │
│         ↓                                        │
│  Frontend bhejta hai POST /api/auth/register     │
│  Body: { name, email, phone, password, role }    │
│         ↓                                        │
│  authValidator.js — Joi validation               │
│  (Email format, password strength check)         │
│         ↓                                        │
│  authController.js — User.register(user, pass)   │
│  (passport-local-mongoose auto-hash karta hai)   │
│         ↓                                        │
│  MongoDB mein User save hota hai                 │
│  Password as hash+salt (readable nahi hai)       │
│         ↓                                        │
│  req.login() — Session create hota hai           │
│  Cookie bhejta hai response mein                 │
│         ↓                                        │
│  Frontend AuthContext update hota hai             │
│  User ko dashboard par redirect karta hai        │
└─────────────────────────────────────────────────┘
```

**Login ke time**:
1. User email + password bhejta hai
2. `passport.authenticate('local')` call hota hai
3. Passport database se user dhundhta hai
4. `user.authenticate(password)` — hash compare karta hai
5. Agar match → session create → cookie set → logged in!
6. Agar wrong → error message

**Session kaise kaam karta hai**:
- Login hone par server MongoDB mein ek session document save karta hai
- Client ko ek `connect.sid` cookie milti hai
- Har API request mein ye cookie automatically jaati hai
- Server cookie se session dhundhta hai → user identify hota hai
- Cookie `httpOnly` hai — JavaScript se access nahi ho sakta (XSS se safe)

### 5.2 Doctor Verification Flow

```
Doctor Register → Create Profile → Upload Documents
    │                                      │
    ↓                                      ↓
Status: PENDING                   DoctorVerification model mein
(Doctor publicly visible NAHI)     documents save hote hain
    │                                      │
    ↓                                      ↓
Admin Login → Admin Dashboard → Verification Queue
    │
    ↓
Admin dekh sakta hai:
- Doctor ka name, qualification
- Uploaded documents (photos)
    │
    ├── APPROVE button → Status: VERIFIED
    │   (Ab doctor publicly search mein aayega)
    │
    └── REJECT button + Reason → Status: REJECTED
        (Doctor ko reason dikhega, woh dubara submit kar sakta hai)
```

### 5.3 Appointment Booking Flow

```
Patient Login → Find Doctors page
    │
    ↓
Search/Filter (name, specialization, city)
    │
    ↓
Doctor ka profile dekho (qualification, reviews, fee, clinic hours)
    │
    ↓
"Book Appointment" click → Booking Page
    │
    ├── Step 1: Date select karo (agle 30 din mein)
    │           ↓
    │   Backend call: GET /api/appointments/slots/:doctorId?date=2024-03-15
    │           ↓
    │   appointmentService.js:
    │   - Us din ka dayOfWeek nikalo (e.g., Friday = 5)
    │   - Availability model se schedule lo (10:00-16:00, 30min slots)
    │   - Generate karo: [10:00, 10:30, 11:00, 11:30, ...]
    │   - Appointment model se already booked slots dhundho
    │   - Booked slots ko "available: false" mark karo
    │   - Return: [{ startTime: "10:00", available: true }, ...]
    │
    ├── Step 2: Available slot select karo
    │
    └── Step 3: Confirm booking
                ↓
        POST /api/appointments
        Body: { doctorId, appointmentDate, startTime }
                ↓
        Controller:
        - Doctor verified hai? ✓
        - Slot available hai? ✓
        - Appointment.create() → MongoDB mein save
        - Agar koi aur same time pe book kare → Compound Unique Index
          error de dega → "Slot already booked"
                ↓
        Patient dashboard mein appointment dikhta hai
        Status: CONFIRMED
```

### 5.4 AI Chatbot Flow

```
Patient clicks 🤖 chat button (bottom-right)
    │
    ↓
Types: "mujhe sir mein dard hai aur bukhar bhi hai"
    │
    ↓
Frontend → POST /api/ai/symptom-check
Body: { message: "mujhe sir mein dard...", history: [...] }
    │
    ↓
aiController.js → aiService.js
    │
    ↓
aiService.js constructs a PROMPT:
"You are a medical triage assistant...
 Patient says: 'mujhe sir mein dard hai aur bukhar bhi hai'
 Return JSON with conditions, specialization, urgency..."
    │
    ↓
Google Gemini API call (gemini-3.6-flash model)
    │
    ↓
Gemini returns JSON:
{
  "message": "Aapke symptoms se lagta hai...",
  "conditions": ["Viral Fever", "Flu", "Dengue"],
  "specialization": "General Physician",
  "urgency": "moderate",
  "advice": "Paani zyada pijiye aur rest kariye..."
}
    │
    ↓
aiController.js → MongoDB query:
Doctor.find({
  verificationStatus: "verified",
  specialization: /General Physician/i
}).limit(3)
    │
    ↓
Response to frontend:
{
  ...AI analysis,
  recommendedDoctors: [
    { fullName: "Dr. Arjun Mehta", ... },
    { fullName: "Dr. Rahul Gupta", ... }
  ]
}
    │
    ↓
ChatBot.jsx renders:
- 💬 AI ka message
- 🏷️ Condition tags (Viral Fever, Flu, Dengue)
- 🔶 Urgency badge (MODERATE)
- 🩺 "Visit a General Physician"
- 💡 Advice
- 👨‍⚕️ Clickable doctor cards (profile pe le jaate hain)
- ⚠️ Disclaimer
```

---

## 6. Feature-wise Implementation

### 6.1 User Registration & Login

**Files involved**:
- `authValidator.js` — Input validation rules
- `authController.js` — Register/Login/Logout logic
- `authRoutes.js` — Route definitions
- `config/passport.js` — Passport strategy config
- `middleware/auth.js` — requireAuth middleware

**Implementation**:
```
Registration:
1. Joi validate karta hai (email format, password 8+ chars, role valid)
2. Check karta hai ki email already registered toh nahi
3. passport-local-mongoose ka User.register() method
   → Internally PBKDF2 hash generate karta hai
   → Salt bhi add karta hai
4. req.login() se automatic login
5. Session MongoDB mein save hota hai (connect-mongo)

Login:
1. passport.authenticate('local') middleware
2. Passport internally email se user dhundhta hai
3. user.authenticate(password) — hash compare
4. Agar match → req.login() → session create → cookie set
5. Frontend ko user object return hota hai
```

### 6.2 Doctor Profile System

**Files involved**:
- `doctorValidator.js` — Profile validation
- `doctorController.js` — CRUD operations + search
- `doctorRoutes.js` — Routes
- `models/Doctor.js` — Schema

**Implementation**:
```
Create Profile:
1. Doctor login ke baad /doctor/dashboard jaata hai
2. Profile form bharta hai (name, qualification, specialization, fee, clinic)
3. POST /api/doctors/profile
4. Validation → Controller → Doctor.create()
5. Default verificationStatus = "pending"

Search (Public):
1. GET /api/doctors?q=heart&city=Mumbai&specialization=Cardiologist
2. Controller mein:
   - Sirf verificationStatus = "verified" wale doctors
   - q parameter → MongoDB $text search (fullName, specialization, etc.)
   - city, specialization → exact match filters
   - Pagination (page, limit) support
3. Response: { doctors: [...], pagination: { page, total, totalPages } }
```

### 6.3 Doctor Verification System

**Files involved**:
- `models/DoctorVerification.js` — Separate model (privacy ke liye)
- `verificationController.js` — Submit documents
- `verificationService.js` — Status transition logic
- `adminController.js` — Approve/Reject
- `middleware/upload.js` — Multer config
- `services/cloudinaryService.js` — Cloud upload

**Implementation**:
```
Document Upload:
1. Doctor dashboard → Verification tab
2. Files select karta hai (PDF, JPEG, PNG — max 5MB each)
3. POST /api/verification/submit (multipart/form-data)
4. Multer middleware file ko memory mein parse karta hai
5. cloudinaryService.js → Cloudinary SDK se upload
   → Folder: "doctor-verification/documents"
   → Returns: { url, publicId }
6. DoctorVerification model mein save

Admin Review:
1. GET /api/admin/verifications → Pending verifications list
2. Admin document URLs dekh sakta hai
3. PATCH /api/admin/verifications/:id/approve
   → verificationService.js → status = "verified"
   → Doctor model mein bhi verificationStatus update
4. PATCH /api/admin/verifications/:id/reject
   → Body: { rejectionReason: "Documents unclear" }
   → Doctor ko reason dikhega
```

### 6.4 Availability & Slot Management

**Files involved**:
- `models/Availability.js` — Day-wise schedule
- `availabilityController.js` — CRUD
- `services/appointmentService.js` — Slot generation logic

**Implementation**:
```
Doctor sets schedule:
- Monday: 09:00 - 13:00, 30 min slots
- Wednesday: 14:00 - 18:00, 30 min slots

Slot Generation Algorithm (appointmentService.js):
1. Input: doctorId, date (e.g., "2024-03-18" = Monday)
2. dayOfWeek nikalo → 1 (Monday)
3. Availability.find({ doctor, dayOfWeek: 1 })
   → Result: { startTime: "09:00", endTime: "13:00", slotDuration: 30 }
4. Loop: currentTime = "09:00"
   While currentTime < "13:00":
     slots.push({ startTime: currentTime, endTime: currentTime + 30min })
     currentTime += 30min
   → Result: ["09:00", "09:30", "10:00", ..., "12:30"]
5. Appointment.find({ doctor, date, status != cancelled })
   → Already booked: ["10:00", "11:30"]
6. Merge: Mark booked slots as available=false
   → Final: [
       { "09:00": available },
       { "09:30": available },
       { "10:00": BOOKED },
       { "10:30": available },
       ...
     ]
```

### 6.5 Appointment Booking & Double-Booking Prevention

**Files involved**:
- `models/Appointment.js` — Compound unique index
- `appointmentController.js` — Book, cancel, complete
- `services/appointmentService.js` — Validation logic

**Implementation**:
```
Double-Booking Prevention:
Appointment model mein ye index hai:

appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, startTime: 1 },
  { unique: true, partialFilterExpression: {
    status: { $nin: ['cancelled', 'rejected'] }
  }}
);

Matlab:
- Same doctor + same date + same time = UNIQUE hona chahiye
- LEKIN cancelled/rejected appointments ko ignore karo
- Ye DATABASE level guard hai

Scenario:
- Patient A clicks "Book 10:00" at 12:00:00.000
- Patient B clicks "Book 10:00" at 12:00:00.001 (1ms baad)
- Patient A ka request MongoDB mein insert hota hai ✅
- Patient B ka request → Duplicate key error → "Slot already booked" ❌
- Ye even race conditions mein bhi kaam karta hai!
```

### 6.6 Review System

**Files involved**:
- `models/Review.js` — Rating + text
- `reviewController.js` — Submit, fetch
- `reviewValidator.js` — Validation

**Implementation**:
```
Rules:
1. Sirf COMPLETED appointments ke liye review de sakte hain
2. Ek appointment pe sirf EK review (duplicate check)
3. Sirf patient (jo appointment mein hai) review de sakta hai
4. Rating: 1-5, Review text: optional

Doctor profile page pe:
- Saare reviews dikhte hain
- Average rating calculate hoti hai
- Star display (★★★★☆)
```

---

## 7. AI Chatbot Integration

### Files:
- `server/services/aiService.js` — Gemini AI SDK integration
- `server/controllers/aiController.js` — API endpoint
- `server/routes/aiRoutes.js` — Route
- `client/src/components/ChatBot.jsx` — Floating chat widget
- `client/src/api/aiApi.js` — Frontend API call

### Kaise Kaam Karta Hai:

**Prompt Engineering** — Ye sabse important part hai. Hum Gemini ko ek detailed **system prompt** bhejte hain:

```
"You are a medical triage assistant...
 Available specializations: General Physician, Cardiologist, ...
 Rules: Suggest 2-4 conditions, recommend ONE specialist,
        rate urgency, give advice, add disclaimer.
 Return ONLY valid JSON."
```

**Kyun JSON format?** — Kyunki hum AI ka response parse karke:
1. Conditions ko **tags** mein dikhate hain
2. Urgency ko **colored badge** mein dikhate hain (green/yellow/red)
3. Specialization se **matching doctors** database se dhundhte hain
4. Doctors ko **clickable cards** mein dikhate hain

**Multi-turn conversation** — Hum previous messages bhi bhejte hain context ke liye:
```
Patient: "mujhe chest mein dard hai"
AI: "Ye cardiac issue ho sakta hai..."
Patient: "haan aur saans lene mein bhi takleef hoti hai"
AI: (ab dono messages ka context hai → better analysis)
```

**Error Handling** — Agar Gemini ka response valid JSON nahi hai (kabhi kabhi markdown mein aata hai), toh hum:
1. ```json fences``` remove karte hain
2. JSON.parse try karte hain
3. Agar parse fail → fallback message return karte hain

---

## 8. Security Implementation

### 8.1 Password Security
```
passport-local-mongoose use karta hai:
- PBKDF2 algorithm (industry standard)
- Random salt har user ke liye
- Password kabhi plain text mein store nahi hota
- Database leak hone par bhi passwords safe hain
```

### 8.2 Session Security
```
express-session + connect-mongo:
- Sessions MongoDB mein stored (server restart safe)
- Cookie settings:
  → httpOnly: true    (JavaScript access nahi — XSS safe)
  → secure: true      (production mein sirf HTTPS)
  → sameSite: 'lax'   (CSRF basic protection)
  → maxAge: 7 days    (auto expire)
```

### 8.3 Input Validation (Joi)
```
Har API endpoint pe Joi validation:
- Email format check
- Password strength (8+ chars)
- Required fields check
- Data type validation
- Max length limits
→ Invalid data database tak pahunchta hi nahi
```

### 8.4 Other Security Measures
```
- helmet: 15+ HTTP security headers automatically set
- express-mongo-sanitize: { "$gt": "" } jaisi NoSQL injection block
- express-rate-limit: Login pe 20 req/15min (brute force prevention)
- CORS: Sirf configured frontend URL se requests allow
- File upload: MIME type + size validation (5MB max)
- Ownership checks: Patient sirf apni appointment cancel kar sakta hai
- Verification documents: Admin-only access, public APIs se hidden
```

---

## 9. Frontend Implementation

### 9.1 Design System (index.css — 1800+ lines!)

Humne ek **complete design system** banaya hai CSS variables se:

```css
:root {
  --color-primary: #2563eb;        /* Main blue */
  --color-secondary: #7c3aed;      /* Purple accent */
  --color-success: #10b981;        /* Green */
  --color-error: #ef4444;          /* Red */
  --font-family: 'Inter', sans-serif;  /* Google Font */
  --radius-md: 8px;                /* Rounded corners */
  --transition-base: 0.2s ease;    /* Smooth animations */
}
```

**Kyun CSS variables?** — Ek jagah change karo, poore app mein apply ho jaaye.

### 9.2 Auth Context (Global State)

```jsx
AuthContext provides:
- user object (naam, email, role)
- loading state
- login() function
- logout() function
- isAuthenticated boolean

Kaise kaam karta hai:
1. App load hone par GET /api/auth/me call hota hai
2. Agar cookie valid hai → user object milta hai → logged in
3. Agar nahi → user = null → logged out
4. Login/Logout par context update hota hai
5. Navbar, ProtectedRoute, RoleRoute — sab AuthContext use karte hain
```

### 9.3 Protected Routes

```jsx
<ProtectedRoute>
  → Agar user logged in nahi → /login par redirect
</ProtectedRoute>

<RoleRoute roles={['doctor']}>
  → Agar user ka role 'doctor' nahi → /login par redirect
</RoleRoute>

Isse patients doctor dashboard nahi dekh sakte,
aur doctors admin dashboard nahi dekh sakte.
```

### 9.4 API Layer (Axios)

```javascript
// axiosConfig.js
const api = axios.create({
  baseURL: '/api',           // Vite proxy /api → localhost:5000
  withCredentials: true,     // Cookies har request mein jaayengi
});

// Error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // Agar 401 (unauthorized) → AuthContext clear karo
    // Error message extract karo aur throw karo
  }
);
```

**Kyun Axios?** — `fetch()` se zyada features:
- `withCredentials: true` automatic cookie handling
- Interceptors (har request/response pe middleware)
- Better error handling
- Automatic JSON parsing

---

## 🎯 Summary

| Feature | Technology | Kyun? |
|---------|-----------|-------|
| Authentication | Passport.js + Sessions | Secure, battle-tested, cookie-based |
| Database | MongoDB + Mongoose | Flexible schema, fast queries, free Atlas |
| Validation | Joi | Powerful validation rules, clear error messages |
| File Upload | Multer + Cloudinary | Memory storage → cloud upload, no server disk |
| Double-Booking | MongoDB Compound Index | Database-level atomic prevention |
| Search | MongoDB Text Index | Full-text search across multiple fields |
| AI Chatbot | Google Gemini API | Free tier, powerful, JSON structured output |
| Frontend | React + Vite | Component-based, fast HMR, modern tooling |
| Security | Helmet + Sanitize + Rate Limit | Multi-layer protection |
| Styling | Vanilla CSS + Design System | Full control, no framework dependency |

---

> **Document by**: Sushant Prasad
> **Project**: Doctor Appointment Website (MERN + GenAI)
> **AI Integration**: Google Gemini 3.6 Flash
