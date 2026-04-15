const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Device = require('./device.model');

const TrackingLog = sequelize.define('TrackingLog', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  deviceId: {
    type: DataTypes.UUID,
    references: {
      model: Device,
      key: 'id',
    },
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
  },
  batteryLevel: {
    type: DataTypes.INTEGER,
  },
  isCharging: {
    type: DataTypes.BOOLEAN,
  },
  logType: {
    type: DataTypes.ENUM('location', 'status', 'alert', 'photo'),
    defaultValue: 'location',
  },
  data: {
    type: DataTypes.JSON, // For extra info like app usage or specific alerts
  },
  fileName: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
  updatedAt: false,
});

Device.hasMany(TrackingLog, { foreignKey: 'deviceId' });
TrackingLog.belongsTo(Device, { foreignKey: 'deviceId' });

module.exports = TrackingLog;
