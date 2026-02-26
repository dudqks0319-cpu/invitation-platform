const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const path = require('path');

// Config
require('./config/passport');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const invitationRoutes = require('./routes/invitation.routes');
const rsvpRoutes = require('./routes/rsvp.routes');
const uploadRoutes = require('./routes/upload.routes');
const paymentRoutes = require('./routes/payment.routes');
const notificationRoutes = require('./routes/notification.routes');
const publicRoutes = require('./routes/public.routes');
const adminRoutes = require('./routes/admin.routes');

// Middlewares
const { errorHandler } = require('./middlewares/error.middleware');
const { notFound } = require('./middlewares/notFound.middleware');
const logger = require('./utils/logger');

const app = express();

// ===== SECURITY =====
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ===== RATE LIMITING =====
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 300,
  message: { success: false, message: '너무 많은 요청입니다. 잠시 후 다시 시도해 주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: '로그인 시도 횟수를 초과했습니다.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

// ===== BODY PARSING =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// ===== LOGGING =====
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ===== PASSPORT =====
app.use(passport.initialize());

// ===== STATIC FILES =====
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
  });
});

// ===== API ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/rsvp', rsvpRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 공개 URL (/i/:slug) - 토큰 불필요
app.use('/i', publicRoutes);

// ===== ERROR HANDLERS =====
app.use(notFound);
app.use(errorHandler);

module.exports = app;
