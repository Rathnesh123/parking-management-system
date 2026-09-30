const express = require('express');
const router = express.Router();
const ParkingRecord = require('../models/ParkingRecord');
const ParkingSlot = require('../models/ParkingSlot');
const Vehicle = require('../models/Vehicle');

// Hourly parking rate in currency units (e.g. ₹20 or $20 / hr)
const HOURLY_RATE = 20;

// GET all active parked vehicles (where exitTime is null)
router.get('/active', async (req, res) => {
  try {
    const activeRecords = await ParkingRecord.find({ exitTime: null }).sort({ entryTime: -1 });

    // Attach vehicle details to each record
    const enriched = await Promise.all(
      activeRecords.map(async (rec) => {
        const vehicle = await Vehicle.findOne({ vehicleNumber: rec.vehicleNumber });
        const now = new Date();
        const diffMs = Math.max(0, now - new Date(rec.entryTime));
        const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
        const currentFee = hours * HOURLY_RATE;

        return {
          _id: rec._id,
          vehicleNumber: rec.vehicleNumber,
          slotNumber: rec.slotNumber,
          entryTime: rec.entryTime,
          ownerName: vehicle ? vehicle.ownerName : 'Unknown',
          vehicleType: vehicle ? vehicle.vehicleType : 'Car',
          phone: vehicle ? vehicle.phone : 'N/A',
          currentDurationHours: hours,
          estimatedFee: currentFee
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET all parking history records (both active and completed)
router.get('/records', async (req, res) => {
  try {
    const records = await ParkingRecord.find().sort({ entryTime: -1 }).limit(100);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST vehicle entry: Record entry time, mark slot Occupied
router.post('/entry', async (req, res) => {
  try {
    const { vehicleNumber, slotNumber, entryTime } = req.body;

    if (!vehicleNumber || !slotNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both Vehicle Number and Parking Slot are required.' 
      });
    }

    const cleanVehicleNumber = vehicleNumber.trim().toUpperCase();
    const cleanSlotNumber = slotNumber.trim().toUpperCase();

    // 1. Check if vehicle is registered
    const vehicle = await Vehicle.findOne({ vehicleNumber: cleanVehicleNumber });
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: `Vehicle "${cleanVehicleNumber}" is not registered. Please add the vehicle first in Vehicle Management.`
      });
    }

    // 2. Check if vehicle is already parked inside
    const alreadyParked = await ParkingRecord.findOne({
      vehicleNumber: cleanVehicleNumber,
      exitTime: null
    });
    if (alreadyParked) {
      return res.status(400).json({
        success: false,
        message: `Vehicle "${cleanVehicleNumber}" is already parked in slot "${alreadyParked.slotNumber}".`
      });
    }

    // 3. Check if slot exists and is Available
    const slot = await ParkingSlot.findOne({ slotNumber: cleanSlotNumber });
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: `Parking slot "${cleanSlotNumber}" not found.`
      });
    }

    if (slot.status === 'Occupied') {
      return res.status(400).json({
        success: false,
        message: `Parking slot "${cleanSlotNumber}" is currently occupied. Please select an available slot.`
      });
    }

    // 4. Create parking record
    const entryDate = entryTime ? new Date(entryTime) : new Date();
    const newRecord = new ParkingRecord({
      vehicleNumber: cleanVehicleNumber,
      slotNumber: cleanSlotNumber,
      entryTime: entryDate,
      exitTime: null,
      fee: 0
    });
    await newRecord.save();

    // 5. Update slot status to Occupied
    slot.status = 'Occupied';
    await slot.save();

    res.status(201).json({
      success: true,
      message: `Vehicle ${cleanVehicleNumber} parked in slot ${cleanSlotNumber} successfully!`,
      data: newRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST vehicle exit: Record exit time, calculate fee, mark slot Available
router.post('/exit', async (req, res) => {
  try {
    const { recordId, vehicleNumber, exitTime } = req.body;

    let query = { exitTime: null };
    if (recordId) {
      query._id = recordId;
    } else if (vehicleNumber) {
      query.vehicleNumber = vehicleNumber.trim().toUpperCase();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a recordId or a vehicleNumber.'
      });
    }

    const record = await ParkingRecord.findOne(query);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'No active parked record found for the specified vehicle.'
      });
    }

    const departureTime = exitTime ? new Date(exitTime) : new Date();
    const entryTime = new Date(record.entryTime);

    // Calculate duration in hours
    const diffMs = Math.max(0, departureTime.getTime() - entryTime.getTime());
    const durationHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60))); // Minimum 1 hr
    const fee = durationHours * HOURLY_RATE;

    // Update parking record
    record.exitTime = departureTime;
    record.fee = fee;
    await record.save();

    // Update slot status back to Available
    await ParkingSlot.findOneAndUpdate(
      { slotNumber: record.slotNumber },
      { status: 'Available' }
    );

    // Fetch vehicle details for the receipt
    const vehicle = await Vehicle.findOne({ vehicleNumber: record.vehicleNumber });

    res.json({
      success: true,
      message: `Vehicle ${record.vehicleNumber} exit completed. Slot ${record.slotNumber} is now Available.`,
      data: {
        recordId: record._id,
        vehicleNumber: record.vehicleNumber,
        slotNumber: record.slotNumber,
        ownerName: vehicle ? vehicle.ownerName : 'N/A',
        vehicleType: vehicle ? vehicle.vehicleType : 'Car',
        entryTime: record.entryTime,
        exitTime: record.exitTime,
        durationHours: durationHours,
        hourlyRate: HOURLY_RATE,
        fee: fee
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
