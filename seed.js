const mongoose = require('mongoose');
require('dotenv').config();

const Vehicle = require('./models/Vehicle');
const ParkingSlot = require('./models/ParkingSlot');
const ParkingRecord = require('./models/ParkingRecord');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parking_db';

async function seedDatabase(forceReset = false) {
  try {
    if (forceReset) {
      console.log('🧹 Clearing existing collections for reset...');
      await Vehicle.deleteMany({});
      await ParkingSlot.deleteMany({});
      await ParkingRecord.deleteMany({});
    }

    const slotCount = await ParkingSlot.countDocuments();
    const vehicleCount = await Vehicle.countDocuments();

    // Only seed if database is empty or force reset requested
    if (slotCount === 0 && vehicleCount === 0) {
      console.log('🌱 Seeding sample data for demonstration...');

      // 1. Seed Vehicles
      const vehicles = [
        { vehicleNumber: 'KA-01-AB-1234', ownerName: 'Rahul Sharma', vehicleType: 'Car', phone: '9876543210' },
        { vehicleNumber: 'MH-12-CD-5678', ownerName: 'Priya Patel', vehicleType: 'Bike', phone: '9812345678' },
        { vehicleNumber: 'DL-04-EF-9012', ownerName: 'Amit Verma', vehicleType: 'SUV', phone: '9988776655' },
        { vehicleNumber: 'KA-05-GH-3456', ownerName: 'Sneha Reddy', vehicleType: 'Car', phone: '9123456780' },
        { vehicleNumber: 'TN-09-JK-7890', ownerName: 'Vikram Singh', vehicleType: 'Truck', phone: '9845123456' }
      ];
      await Vehicle.insertMany(vehicles);
      console.log(`✅ Seeded ${vehicles.length} sample vehicles.`);

      // 2. Seed Parking Slots
      const slots = [
        { slotNumber: 'A-101', status: 'Occupied' },
        { slotNumber: 'A-102', status: 'Occupied' },
        { slotNumber: 'A-103', status: 'Available' },
        { slotNumber: 'A-104', status: 'Available' },
        { slotNumber: 'B-201', status: 'Available' },
        { slotNumber: 'B-202', status: 'Available' },
        { slotNumber: 'B-203', status: 'Available' },
        { slotNumber: 'B-204', status: 'Available' }
      ];
      await ParkingSlot.insertMany(slots);
      console.log(`✅ Seeded ${slots.length} sample parking slots.`);

      // 3. Seed Parking Records
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2.5 * 60 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
      const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

      const records = [
        // Currently parked
        {
          vehicleNumber: 'KA-01-AB-1234',
          slotNumber: 'A-101',
          entryTime: twoHoursAgo,
          exitTime: null,
          fee: 0
        },
        {
          vehicleNumber: 'MH-12-CD-5678',
          slotNumber: 'A-102',
          entryTime: oneHourAgo,
          exitTime: null,
          fee: 0
        },
        // Past completed record
        {
          vehicleNumber: 'DL-04-EF-9012',
          slotNumber: 'B-201',
          entryTime: fiveHoursAgo,
          exitTime: threeHoursAgo,
          fee: 40 // 2 hours * ₹20
        }
      ];
      await ParkingRecord.insertMany(records);
      console.log(`✅ Seeded ${records.length} sample parking records.`);
      console.log('🎉 Sample data loaded successfully! You can demonstrate the app immediately.');
    } else {
      console.log('ℹ️  Existing data found in database. Skipping sample seed.');
    }
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  }
}

// Allow running standalone: node seed.js or node seed.js --reset
if (require.main === module) {
  const isReset = process.argv.includes('--reset');
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB for seeding.');
      await seedDatabase(isReset);
      await mongoose.disconnect();
      console.log('👋 Seeding process finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ MongoDB Connection Error:', err.message);
      process.exit(1);
    });
}

module.exports = seedDatabase;
