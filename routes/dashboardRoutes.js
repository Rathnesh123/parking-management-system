const express = require('express');
const router = express.Router();
const ParkingSlot = require('../models/ParkingSlot');
const Vehicle = require('../models/Vehicle');
const ParkingRecord = require('../models/ParkingRecord');

// GET dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments();
    const availableSlots = await ParkingSlot.countDocuments({ status: 'Available' });
    const occupiedSlots = await ParkingSlot.countDocuments({ status: 'Occupied' });
    const totalVehicles = await Vehicle.countDocuments();

    // Calculate total revenue collected from completed parking records
    const revenueAgg = await ParkingRecord.aggregate([
      { $match: { exitTime: { $ne: null } } },
      { $group: { _id: null, total: { $sum: '$fee' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Recent 5 activities
    const recentActivity = await ParkingRecord.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalSlots,
        availableSlots,
        occupiedSlots,
        totalVehicles,
        totalRevenue,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
