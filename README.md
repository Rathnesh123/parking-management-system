# 🅿️ SmartPark - Parking Management System (College Mini Project)

A clean, beginner-friendly **Parking Management System** built with **HTML/CSS/JavaScript**, **Node.js + Express.js**, and **MongoDB**. Designed specifically for college mini-projects, lab examinations, and technical presentations.

---

## 📌 Project Overview

This application helps manage vehicle parking operations in real time. It allows parking operators to:
1. **Monitor live parking lot capacity** (Total, Available, Occupied slots, and Total Vehicles).
2. **Register and manage customer vehicles** (Number, Owner Name, Vehicle Type, Phone).
3. **Manage parking slots** (Add slots, view status, delete vacant slots).
4. **Process Vehicle Entry (Check-In)**: Assign an available slot and record entry timestamp.
5. **Process Vehicle Exit (Check-Out)**: Automatically compute duration-based parking fees and release the slot.
6. **View live parking floor layout & audit history** with printable receipts.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | HTML5, CSS3, Modern JavaScript (ES6+) | Responsive tabbed UI, real-time status updates, receipt modal |
| **Backend** | Node.js, Express.js | RESTful API endpoints for CRUD operations |
| **Database** | MongoDB | Document-based NoSQL database |
| **ODM** | Mongoose | Schema modeling and database validation |
| **GUI Tool** | MongoDB Compass | Visual exploration of collections and documents |

---

## 🗂️ Project Folder Structure

```text
494/ (Project Root)
├── models/
│   ├── Vehicle.js            # Mongoose schema for 'vehicles' collection
│   ├── ParkingSlot.js        # Mongoose schema for 'parkingSlots' collection
│   └── ParkingRecord.js      # Mongoose schema for 'parkingRecords' collection
├── routes/
│   ├── dashboardRoutes.js    # Statistics & overview API
│   ├── vehicleRoutes.js      # Vehicle CRUD APIs
│   ├── slotRoutes.js         # Slot CRUD APIs
│   └── parkingRoutes.js      # Vehicle Check-In & Check-Out APIs
├── public/
│   ├── index.html            # Single Page Application HTML structure
│   ├── css/
│   │   └── style.css         # Modern, responsive styling & print layout
│   └── js/
│       └── app.js            # Client-side state, API calls, and DOM updates
├── .env                      # Environment variables (PORT, MONGODB_URI)
├── .gitignore                # Git ignore for node_modules and .env
├── package.json              # Project dependencies and npm scripts
├── seed.js                   # Automatic seed & demo data script
├── server.js                 # Express server & MongoDB connection
└── README.md                 # Complete documentation & viva guide
```

---

## 🗄️ MongoDB Database & Schema Design

The project uses a database named **`parking_db`** containing three collections:

### 1. `vehicles` Collection
Stores registered vehicle and driver details.
```json
{
  "_id": "ObjectId('...')",
  "vehicleNumber": "KA-01-AB-1234",
  "ownerName": "Rahul Sharma",
  "vehicleType": "Car",
  "phone": "9876543210",
  "createdAt": "2026-09-30T14:30:00.000Z",
  "updatedAt": "2026-09-30T14:30:00.000Z"
}
```

### 2. `parkingSlots` Collection
Tracks physical parking spaces and their live status.
```json
{
  "_id": "ObjectId('...')",
  "slotNumber": "A-101",
  "status": "Occupied", // "Available" or "Occupied"
  "createdAt": "2026-09-30T14:30:00.000Z",
  "updatedAt": "2026-09-30T14:30:00.000Z"
}
```

### 3. `parkingRecords` Collection
Maintains an audit log of every parking session (entry, exit, and fee).
```json
{
  "_id": "ObjectId('...')",
  "vehicleNumber": "KA-01-AB-1234",
  "slotNumber": "A-101",
  "entryTime": "2026-09-30T12:00:00.000Z",
  "exitTime": null,     // Populated upon exit
  "fee": 0,             // Calculated upon exit (₹20/hr, min 1 hr)
  "createdAt": "2026-09-30T14:30:00.000Z",
  "updatedAt": "2026-09-30T14:30:00.000Z"
}
```

---

## 🚀 How to Run the Project Locally

### Prerequisites
1. **Node.js** (v16 or higher) installed on your system.
2. **MongoDB Community Server** installed and running locally.
3. **MongoDB Compass** installed (optional, for viewing the database).

---

### Step 1: Open Terminal in the Project Folder
Open PowerShell, CMD, or VS Code integrated terminal in the project directory:
```powershell
cd c:\Users\ASUS\Desktop\494
```

### Step 2: Install Dependencies
```powershell
npm install
```
*(Dependencies installed: `express`, `mongoose`, `cors`, `dotenv`)*

### Step 3: Start MongoDB (If Not Already Running)
In Windows, MongoDB runs as a background service by default. You can verify or start it by running:
```powershell
net start MongoDB
```

### Step 4: Run the Application
```powershell
npm start
```

You will see output in the terminal:
```text
====================================================
✅ Connected to MongoDB successfully!
📦 Database: parking_db
🧭 View in MongoDB Compass: mongodb://127.0.0.1:27017/parking_db
====================================================
🌱 Seeding sample data for demonstration...
✅ Seeded 5 sample vehicles.
✅ Seeded 8 sample parking slots.
✅ Seeded 3 sample parking records.
🎉 Sample data loaded successfully! You can demonstrate the app immediately.
🚀 Parking Management Server running at: http://localhost:3000
🌐 Open http://localhost:3000 in your browser
====================================================
```

### Step 5: Open in Your Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🧭 How to View the Database in MongoDB Compass

1. Open **MongoDB Compass** application on your computer.
2. In the connection string field, paste:
   ```
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.
4. In the left sidebar, click on the **`parking_db`** database.
5. You will see three collections:
   - **`vehicles`**
   - **`parkingSlots`**
   - **`parkingRecords`**
6. Click into any collection to view, inspect, or modify documents in real time.

---

## 💡 How to Demonstrate the Project in a College Presentation

1. **Dashboard Walkthrough**:
   - Show the 4 counter cards: Total Slots, Available Slots, Occupied Slots, and Total Registered Vehicles.
   - Show the **Visual Parking Lot Floor Map** with Green (Available) and Red (Occupied) slots.
   - Show the **Currently Parked Vehicles** table displaying elapsed hours and accrued fees.

2. **Demonstrate Vehicle Management**:
   - Click the **Vehicles** tab.
   - Add a new vehicle (e.g. `DL-01-XY-5555`, Name: `Ananya Roy`, Type: `Car`, Phone: `9876501234`).
   - Notice the vehicle appears immediately in the table.
   - Show the live search filter.

3. **Demonstrate Vehicle Entry (Check-In)**:
   - Click the **Vehicle Entry** tab.
   - Select the newly added vehicle from the dropdown. Notice the owner details preview appears automatically.
   - Select an available slot (e.g. `A-103`).
   - Click **Confirm Vehicle Entry**.
   - Notice how Slot `A-103` immediately changes to **Occupied** (Red) on the Dashboard!

4. **Demonstrate Vehicle Exit (Check-Out) & Fee Calculation**:
   - Click the **Vehicle Exit** tab.
   - Select one of the parked vehicles (e.g. `KA-01-AB-1234`).
   - Notice the live summary: parked duration and calculated fee (₹20 per hour).
   - Click **Process Exit & Mark Slot Available**.
   - A clean, professional **Parking Receipt Modal** appears showing billed hours and total fee!
   - Close the receipt: slot is instantly released back to **Available** (Green) and the completed transaction is logged in the **History** tab!

5. **Resetting Demo Data Anytime**:
   - If you want to reset everything back to the initial sample data for another demo, simply run:
     ```powershell
     npm run reset-db
     ```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Returns total slots, available, occupied, vehicles, revenue |
| `GET` | `/api/vehicles` | Returns all registered vehicles |
| `POST` | `/api/vehicles` | Add a new vehicle (`vehicleNumber`, `ownerName`, `vehicleType`, `phone`) |
| `DELETE`| `/api/vehicles/:id` | Delete a vehicle (blocked if vehicle is currently parked) |
| `GET` | `/api/slots` | Returns all parking slots (supports `?status=Available`) |
| `POST` | `/api/slots` | Add a new parking slot (`slotNumber`) |
| `DELETE`| `/api/slots/:id` | Delete a slot (blocked if slot is Occupied) |
| `GET` | `/api/parking/active` | Returns all currently parked vehicles with elapsed time |
| `POST` | `/api/parking/entry` | Check-in vehicle (`vehicleNumber`, `slotNumber`, `entryTime`) |
| `POST` | `/api/parking/exit` | Check-out vehicle, calculate fee, release slot |
| `GET` | `/api/parking/records`| Returns full history log of entries and exits |

---

## 🎓 College Viva / Presentation Q&A

### Q1: Why did you choose MongoDB instead of a relational database like MySQL?
**Answer**: MongoDB is a NoSQL, document-based database. It stores data in JSON-like documents (BSON). It offers flexible schemas, fast read/write performance, and integrates seamlessly with JavaScript-based Node.js backends without needing complex SQL joins.

### Q2: What is the role of Mongoose?
**Answer**: Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, and translates between objects in code and the representation of those objects in MongoDB.

### Q3: How is the parking fee calculated?
**Answer**: The fee is calculated when the vehicle exits:
$$\text{Duration (hours)} = \max\left(1, \lceil \frac{\text{ExitTime} - \text{EntryTime}}{3,600,000} \rceil\right)$$
$$\text{Fee} = \text{Duration (hours)} \times \text{Hourly Rate (₹20)}$$
Even if parked for under 1 hour, a minimum 1-hour charge is billed.

### Q4: How is data consistency maintained when parking a vehicle?
**Answer**: When a vehicle enters, the server performs validations:
1. Verifies that the vehicle exists in `vehicles`.
2. Verifies that the vehicle is not already parked in another slot.
3. Verifies that the chosen slot is currently `Available`.
4. Updates `parkingSlots` status to `Occupied` and writes an entry in `parkingRecords`.

---

## 📄 License
This mini project is open-source and intended for educational and academic submission purposes.
