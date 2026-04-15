const getHealthStatus = (req, res) => {
    try {
        res.status(200).json({
            status: 'success',
            message: 'Server is healthy and running',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

module.exports = {
    getHealthStatus
};
