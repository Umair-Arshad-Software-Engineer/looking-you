const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // Set to true if you want to see SQL queries in console
  }
);

const connectDB = async () => {
  try {
    // Ensure Database Exists in MySQL
    const sysSequelize = new Sequelize('', process.env.DB_USER, process.env.DB_PASS, {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      logging: false,
    });
    await sysSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await sysSequelize.close();

    await sequelize.authenticate();
    console.log('✅ MySQL Database Connected Successfully');
    
    // Sync models (Safe for development/production)
    await sequelize.sync();
    
    // Manually add 'file' and 'activity' enum if it doesn't exist (Safe way to bypass sync issues)
    try {
      await sequelize.query("ALTER TABLE TrackingLogs MODIFY COLUMN logType ENUM('location', 'status', 'alert', 'photo', 'camera', 'audio', 'file', 'activity', 'screenshot') DEFAULT 'location';");
      console.log('✅ Database Schema (logType) updated successfully');
    } catch (e) {
      // Ignore if column is already updated or other minor issues
    }

    console.log('✅ Database Models Synchronized');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
