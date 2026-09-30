const mongoose = require('mongoose');

// Schema for parking slots
const parkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: [true, 'Slot number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied'],
    default: 'Available'
  }
}, { 
  timestamps: true 
});

// Explicitly name the collection 'parkingSlots' as requested
module.exports = mongoose.model('ParkingSlot', parkingSlotSchema, 'parkingSlots');
