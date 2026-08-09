const cron = require('node-cron');
const { Op } = require('sequelize');
const TrackingLog = require('../models/tracking.model');

const initCronJobs = () => {
  // Schedule log cleanup to run every midnight at 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('🧹 Running automated 30-day TrackingLog cleanup job...');
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const deletedCount = await TrackingLog.destroy({
        where: {
          createdAt: {
            [Op.lt]: thirtyDaysAgo
          }
        }
      });
      console.log(`✅ Cleanup completed: Deleted ${deletedCount} logs older than 30 days`);
    } catch (err) {
      console.error('❌ Error during automated log cleanup:', err);
    }
  });

  console.log('⏱️ Cron Service initialized: Log cleanup scheduled daily at midnight');
};

module.exports = { initCronJobs };
