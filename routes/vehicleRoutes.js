const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const ParkingRecord = require('../models/ParkingRecord');

// GET all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST add a new vehicle
router.post('/', async (req, res) => {
  try {
    const { vehicleNumber, ownerName, vehicleType, phone } = req.body;

    if (!vehicleNumber || !ownerName || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vehicle number, owner name, and phone number are required.' 
      });
    }

    // Check if vehicle number already exists
    const existing = await Vehicle.findOne({ 
      vehicleNumber: vehicleNumber.trim().toUpperCase() 
    });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `Vehicle with number "${vehicleNumber.toUpperCase()}" already exists.` 
      });
    }

    const newVehicle = new Vehicle({
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      ownerName: ownerName.trim(),
      vehicleType: vehicleType || 'Car',
      phone: phone.trim()
    });

    const savedVehicle = await newVehicle.save();
    res.status(201).json({ success: true, data: savedVehicle, message: 'Vehicle added successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE a vehicle by ID
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    // Check if vehicle is currently parked inside
    const isParked = await ParkingRecord.findOne({
      vehicleNumber: vehicle.vehicleNumber,
      exitTime: null
    });

    if (isParked) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete vehicle "${vehicle.vehicleNumber}" because it is currently parked in slot ${isParked.slotNumber}. Please process vehicle exit first.`
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `Vehicle "${vehicle.vehicleNumber}" deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
