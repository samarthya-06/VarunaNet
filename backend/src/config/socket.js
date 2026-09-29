/**
 * Socket.io Configuration
 * Real-time WebSocket server for notifications
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./index');
const logger = require('./logger');

let io = null;

/**
 * Initialize Socket.io with HTTP server
 */
const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: config.corsOrigins,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
            logger.warn('Socket connection without token');
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            socket.userId = decoded.id;
            socket.userEmail = decoded.email;
            next();
        } catch (error) {
            logger.warn({ error: error.message }, 'Socket authentication failed');
            return next(new Error('Invalid token'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        const userId = socket.userId;
        logger.info({ userId, socketId: socket.id }, 'User connected to socket');

        // Join user-specific room for targeted notifications
        socket.join(`user_${userId}`);

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            logger.info({ userId, socketId: socket.id, reason }, 'User disconnected from socket');
        });

        // Handle errors
        socket.on('error', (error) => {
            logger.error({ userId, error: error.message }, 'Socket error');
        });
    });

    logger.info('Socket.io initialized');
    return io;
};

/**
 * Get Socket.io instance
 */
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIO
};
