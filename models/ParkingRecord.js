const mongoose = require('mongoose');

// Schema for vehicle parking records (entry/exit history)
const parkingRecordSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    trim: true,
    uppercase: true
  },
  slotNumber: {
    type: String,
    required: [true, 'Slot number is required'],
    trim: true,
    uppercase: true
  },
  entryTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  exitTime: {
    type: Date,
    default: null
  },
  fee: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Explicitly name the collection 'parkingRecords' as requested
module.exports = mongoose.model('ParkingRecord', parkingRecordSchema, 'parkingRecords');
