const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load env in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}

// Import passport configuration
const configurePassport = require('./config/passport');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Import error handler
const errorHandler = require('./middleware/errorHandler');
const ExpressError = require('./utils/ExpressError');

const app = express();

// ------------------------------------
// Security Middleware
// ------------------------------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Relaxed for development; tighten in production
}));

app.use(mongoSanitize());

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: { success: false, message: 'Too many requests, please try again later.', errorCode: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ------------------------------------
// Core Middleware
// ------------------------------------
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ------------------------------------
// Session Configuration
// ------------------------------------
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60, // 14 days
    autoRemove: 'native',
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
};

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(session(sessionConfig));

// ------------------------------------
// Passport Initialization
// ------------------------------------
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// ------------------------------------
// API Routes
// ------------------------------------
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy', timestamp: new Date().toISOString() });
});

// ------------------------------------
// Serve React frontend in production
// ------------------------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

// ------------------------------------
// 404 Handler
// ------------------------------------
app.all('*', (req, res, next) => {
  next(new ExpressError('Route not found', 404));
});

// ------------------------------------
// Centralized Error Handler
// ------------------------------------
app.use(errorHandler);

module.exports = app;
