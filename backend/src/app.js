const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const path = require('path');

const config = require('./config');
const logger = require('./config/logger');

// Initialize Passport for Google OAuth
const { passport } = require('./config/passport');

// Initialize Sentry if DSN provided
let Sentry = null;
if (config.sentryDsn) {
    Sentry = require('@sentry/node');
    Sentry.init({
        dsn: config.sentryDsn,
        environment: config.nodeEnv
    });
}

// Routes
const healthRoutes = require('./routes/health.routes');
const reportRoutes = require('./routes/report.routes');
const hotspotRoutes = require('./routes/hotspot.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

// ============ Security Middleware ============

// Helmet - Security headers (with cross-origin resource policy disabled for static assets)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS - Configured origins
app.use(cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - General API
const generalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        status: 'error',
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting - Stricter for auth routes
const authLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.authMax,
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Apply rate limiting to all API routes
app.use('/api/', generalLimiter);

// ============ Request Parsing ============
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ============ Request Logging ============
app.use(pinoHttp({ logger }));

// ============ Passport OAuth ============
app.use(passport.initialize());

// ============ Static Files ============
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============ Routes ============
app.use('/health', healthRoutes);
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api/reports', reportRoutes);
app.use('/api/hotspots', hotspotRoutes);
app.use('/api/social', require('./routes/social.routes'));
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', require('./routes/notification.routes'));

// ============ Error Handling ============

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    // Log error
    logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');

    // Report to Sentry if configured
    if (Sentry) {
        Sentry.captureException(err);
    }

    res.status(err.status || 500).json({
        status: 'error',
        message: config.nodeEnv === 'production'
            ? 'Internal server error'
            : err.message
    });
});

module.exports = app;
