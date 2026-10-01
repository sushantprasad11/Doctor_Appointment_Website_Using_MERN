# 🏥 DocterApp — Doctor Appointment & Telemedicine Platform

A production-grade MERN stack web application where patients discover verified doctors, view professional profiles, check availability, and book audio or video consultations. Doctors undergo an admin verification process before becoming publicly searchable.

---

## ✨ Features

### For Patients
- Register & login with secure session-based authentication
- Search doctors by name, specialization, disease, body part, location, language
- Filter by consultation type (audio/video), fee range
- View verified doctor profiles with qualifications, experience, and availability
- Book appointments with real-time slot availability
- Choose audio or video consultation
- Join private 1:1 consultations via PeerJS (WebRTC)
- View upcoming appointments and history
- Cancel appointments
- Review doctors after completed consultations

### For Doctors
- Register & create professional profile
- Upload degree/certificate documents for verification
- Define working hours, break periods, and appointment durations
- Manage availability per day of the week
- View and manage appointments
- Join audio/video consultations
- Mark appointments as completed
- Update profile information

### For Admins
- Dashboard with platform statistics
- Doctor verification queue with document viewing
- Approve or reject doctor applications (with reasons)
- Suspend verified doctors
- Monitor all appointments across the platform

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js (Vite), React Router, Vanilla CSS, Axios, PeerJS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose |
| **Auth** | Passport.js (Local Strategy), express-session, connect-mongo |
| **Validation** | Joi |
| **File Upload** | Multer (memory storage) → Cloudinary |
| **Real-time** | PeerJS (WebRTC) for 1:1 audio/video |
| **Security** | Helmet, express-mongo-sanitize, express-rate-limit, bcrypt |

---

## 🏗 Architecture

```
Frontend (React + Vite)
        │
        ▼
Express REST APIs (Port 5000)
        │
        ├── Passport.js (Session Auth)
        ├── Joi Validation
        ├── Multer → Cloudinary
        ├── MVC Controllers / Services
        │
        ▼
MongoDB Atlas
```

### Backend MVC Structure

```
server/
├── app.js                    # Express app + middleware
├── server.js                 # Entry point
├── config/
│   ├── db.js                 # MongoDB connection
│   ├── passport.js           # Passport local strategy
│   └── cloudinary.js         # Cloudinary SDK config
├── models/
│   ├── User.js               # passport-local-mongoose
│   ├── Doctor.js             # Full-text search indexes
│   ├── DoctorVerification.js # Separate from public profile
│   ├── Appointment.js        # Compound unique index
│   ├── Availability.js       # Per-day schedules
│   └── Review.js             # One per appointment
├── controllers/              # 8 controllers
├── routes/                   # 8 route modules
├── middleware/
│   ├── auth.js               # requireAuth
│   ├── role.js               # requireDoctor/Patient/Admin
│   ├── validation.js         # Joi middleware factory
│   ├── upload.js             # Multer config
│   └── errorHandler.js       # Centralized error handler
├── validators/               # 6 Joi schema files
├── services/                 # Business logic layer
├── utils/                    # ExpressError, wrapAsync, constants
└── seeds/
    └── adminSeed.js          # Create initial admin
```

---

## 📊 Database Design

### Models & Relationships

```
User ──→ Doctor (1:1, user reference)
Doctor ──→ DoctorVerification (1:many)
Doctor ──→ Availability (1:many, per day)
Doctor ──→ Appointment (1:many)
User (patient) ──→ Appointment (1:many)
Appointment ──→ Review (1:1)
```

### Key Design Decisions
- **Double-booking prevention**: Compound unique index on `(doctor, appointmentDate, startTime)` with partial filter excluding cancelled/rejected
- **Privacy**: Verification documents stored separately from public Doctor profile; never exposed in public APIs
- **Text search**: MongoDB text index across name, specialization, expertise, diseases, location fields

---

## 🔐 Authentication & Authorization

- **Passport.js Local Strategy** with `passport-local-mongoose`
- **Email** used as the username field
- **Sessions** stored in MongoDB via `connect-mongo` (14-day TTL)
- **Secure cookies**: httpOnly, sameSite, secure in production

### Roles & Middleware

| Middleware | Description |
|-----------|-------------|
| `requireAuth` | User must be logged in |
| `requireDoctor` | Logged-in user must have `role: 'doctor'` |
| `requirePatient` | Logged-in user must have `role: 'patient'` |
| `requireAdmin` | Logged-in user must have `role: 'admin'` |
| `requireVerifiedDoctor` | Doctor + verified status check |

---

## 🩺 Doctor Verification Workflow

```
Doctor Registration → Profile Creation → Upload Documents
    → Status: PENDING
    → Admin Reviews Documents
    ├── APPROVE → Status: VERIFIED → Public listing
    └── REJECT → Status: REJECTED (with reason) → Re-submit
```

Verification statuses: `pending`, `under_review`, `verified`, `rejected`, `suspended`

---

## 📅 Appointment Workflow

```
Patient selects doctor → Choose date → Pick available slot
    → Select audio/video → Confirm booking
    → Status: CONFIRMED → Join consultation at scheduled time
    → Doctor marks COMPLETED → Patient can review
```

Statuses: `pending`, `confirmed`, `cancelled`, `completed`, `rejected`, `no_show`

---

## 📡 API Overview

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/api/auth/register` | Public | Register patient/doctor |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/logout` | Auth | Logout |
| GET | `/api/auth/me` | Public | Current user |
| GET | `/api/doctors` | Public | Search verified doctors |
| GET | `/api/doctors/:id` | Public | Doctor profile |
| POST | `/api/doctors/profile` | Doctor | Create profile |
| PUT | `/api/doctors/profile` | Doctor | Update profile |
| GET | `/api/doctors/profile/me` | Doctor | Own profile |
| POST | `/api/verification/submit` | Doctor | Upload documents |
| GET | `/api/verification/status` | Doctor | Check status |
| GET | `/api/availability/doctor/:id` | Public | Doctor schedule |
| POST | `/api/availability` | Doctor | Add schedule |
| PUT | `/api/availability/:id` | Doctor | Update schedule |
| DELETE | `/api/availability/:id` | Doctor | Remove schedule |
| POST | `/api/appointments` | Patient | Book appointment |
| GET | `/api/appointments` | Auth | My appointments |
| GET | `/api/appointments/:id` | Auth | Appointment detail |
| PATCH | `/api/appointments/:id/cancel` | Auth | Cancel |
| PATCH | `/api/appointments/:id/complete` | Doctor | Mark complete |
| GET | `/api/appointments/slots/:doctorId` | Public | Available slots |
| GET | `/api/consultation/:id/access` | Auth | Consultation access |
| POST | `/api/reviews` | Patient | Submit review |
| GET | `/api/reviews/doctor/:id` | Public | Doctor reviews |
| GET | `/api/admin/dashboard` | Admin | Platform stats |
| GET | `/api/admin/verifications` | Admin | Verification queue |
| PATCH | `/api/admin/verifications/:id/approve` | Admin | Approve doctor |
| PATCH | `/api/admin/verifications/:id/reject` | Admin | Reject doctor |
| PATCH | `/api/admin/doctors/:id/suspend` | Admin | Suspend doctor |
| GET | `/api/admin/appointments` | Admin | All appointments |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone & Install

```bash
git clone https://github.com/your-username/docter-mern.git
cd docter-mern
npm run install:all
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `SESSION_SECRET` | Random string for session signing |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### 3. Create Admin User

```bash
npm run seed:admin
```

### 4. Run Development

```bash
npm run dev
```

This starts both:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

---

## 🔒 Security Considerations

- Passwords hashed via `passport-local-mongoose` (PBKDF2)
- Sessions stored in MongoDB (not memory)
- HTTP security headers via `helmet`
- NoSQL injection prevention via `express-mongo-sanitize`
- Rate limiting on authentication endpoints
- Server-side Joi validation on all inputs
- File upload validation (MIME type, size limits)
- Ownership checks on all sensitive operations
- Verification documents never exposed in public APIs
- Client cannot manipulate verification status or roles
- CORS restricted to configured client URL

---

## 🌐 Deployment (Render)

### Backend (Web Service)
1. Create a new Web Service on Render
2. Set build command: `cd server && npm install`
3. Set start command: `cd server && node server.js`
4. Add all environment variables
5. Set `NODE_ENV=production`

### Frontend (Static Site)
1. Create a Static Site on Render
2. Set build command: `cd client && npm install && npm run build`
3. Set publish directory: `client/dist`

### Database
- Use MongoDB Atlas free tier (M0)

### Media
- Cloudinary free tier (25 credits/month)

---

## 🔮 Future Improvements

- [ ] Payment integration (Razorpay/Stripe)
- [ ] Email notifications (appointment confirmations, verification updates)
- [ ] SMS notifications
- [ ] Self-hosted PeerServer for production WebRTC signaling
- [ ] TURN server for enterprise firewall traversal
- [ ] Doctor availability calendar view
- [ ] Prescription management
- [ ] Medical records (patient)
- [ ] Chat/messaging between patient and doctor
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (i18n)
- [ ] PWA support

---

## 📄 License

This project is for educational and portfolio purposes.
