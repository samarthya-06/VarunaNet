const http = require('http');
const config = require('./config');
const logger = require('./config/logger');
const app = require('./app');
const sequelize = require('./config/db');
const { initializeSocket } = require('./config/socket');
const notificationService = require('./services/notification.service');

// Import models to ensure they sync
require('./models/report.model');
require('./models/user.model');
require('./models/notification.model');

const PORT = config.port;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully');

        // Sync models (using safe sync without alter to avoid index issues)
        await sequelize.sync({ force: false });
        logger.info('Database models synced');

        // Create HTTP server and attach Socket.io
        const httpServer = http.createServer(app);
        const io = initializeSocket(httpServer);

        // Set Socket.io instance in notification service for real-time push
        notificationService.setSocketIO(io);

        httpServer.listen(PORT, () => {
            logger.info({ port: PORT }, `Server is running on port ${PORT}`);
            logger.info('Socket.io ready for real-time notifications');
        });
    } catch (error) {
        logger.fatal({ err: error }, 'Unable to connect to the database');
        process.exit(1);
    }
};

startServer();

