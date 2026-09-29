exports.checkHealth = async (req, res) => {
    try {
        // Optional: Add DB check here if desired, keeping it simple for now
        res.status(200).json({
            status: 'success',
            message: 'Server is healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
