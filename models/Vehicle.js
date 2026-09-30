const mongoose = require('mongoose');

// Schema for registered vehicles
const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['Car', 'Bike', 'SUV', 'Truck', 'Other'],
    default: 'Car'
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  }
}, { 
  timestamps: true 
});

// Explicitly name the collection 'vehicles' as requested
module.exports = mongoose.model('Vehicle', vehicleSchema, 'vehicles');
