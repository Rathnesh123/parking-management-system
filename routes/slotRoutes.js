const express = require('express');
const router = express.Router();
const ParkingSlot = require('../models/ParkingSlot');
const ParkingRecord = require('../models/ParkingRecord');

// GET all parking slots (supports optional query ?status=Available or ?status=Occupied)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const slots = await ParkingSlot.find(filter).sort({ slotNumber: 1 });
    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST add a new parking slot
router.post('/', async (req, res) => {
  try {
    const { slotNumber } = req.body;

    if (!slotNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slot number is required (e.g. A-101, B-201).' 
      });
    }

    const formattedSlot = slotNumber.trim().toUpperCase();

    // Check if slot number already exists
    const existing = await ParkingSlot.findOne({ slotNumber: formattedSlot });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `Parking slot "${formattedSlot}" already exists.` 
      });
    }

    const newSlot = new ParkingSlot({
      slotNumber: formattedSlot,
      status: 'Available'
    });

    const savedSlot = await newSlot.save();
    res.status(201).json({ success: true, data: savedSlot, message: 'Parking slot added successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE a parking slot by ID
router.delete('/:id', async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found.' });
    }

    if (slot.status === 'Occupied') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete slot "${slot.slotNumber}" because it is currently Occupied. Process vehicle exit first.`
      });
    }

    await ParkingSlot.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `Parking slot "${slot.slotNumber}" deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
