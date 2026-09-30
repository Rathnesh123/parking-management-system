// ================= GLOBAL STATE & API BASE =================
const API = {
  dashboard: '/api/dashboard',
  vehicles: '/api/vehicles',
  slots: '/api/slots',
  parking: '/api/parking'
};

let allVehicles = [];
let allSlots = [];
let activeParkedRecords = [];
let currentSlotFilter = 'all';

// Helper to format ISO date to local readable string
function formatDateTime(isoString) {
  if (!isoString) return 'Active (Inside)';
  const d = new Date(isoString);
  return d.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Helper to get local ISO string for datetime-local input
function getLocalDateTimeString(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Tab Switching
function switchTab(tabId) {
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // Update tab panes
  document.querySelectorAll('.tab-pane').forEach((pane) => {
    pane.classList.toggle('active', pane.id === tabId);
  });

  // Refresh tab-specific data
  if (tabId === 'dashboard') loadDashboard();
  if (tabId === 'vehicles') loadVehicles();
  if (tabId === 'slots') loadSlots();
  if (tabId === 'entry') loadEntryForm();
  if (tabId === 'exit') loadExitForm();
  if (tabId === 'history') loadHistory();
}

// ================= 1. DASHBOARD =================
async function loadDashboard() {
  try {
    // 1. Fetch dashboard stats
    const statsRes = await fetch(`${API.dashboard}/stats`);
    const statsData = await statsRes.json();
    if (statsData.success) {
      const stats = statsData.data;
      document.getElementById('statTotalSlots').textContent = stats.totalSlots;
      document.getElementById('statAvailableSlots').textContent = stats.availableSlots;
      document.getElementById('statOccupiedSlots').textContent = stats.occupiedSlots;
      document.getElementById('statTotalVehicles').textContent = stats.totalVehicles;
    }

    // 2. Fetch all slots for visual floor map
    const slotsRes = await fetch(API.slots);
    const slotsData = await slotsRes.json();
    const slots = slotsData.success ? slotsData.data : [];

    // 3. Fetch active parked vehicles
    const activeRes = await fetch(`${API.parking}/active`);
    const activeData = await activeRes.json();
    activeParkedRecords = activeData.success ? activeData.data : [];

    // Render floor map
    const mapContainer = document.getElementById('dashboardSlotsGrid');
    if (slots.length === 0) {
      mapContainer.innerHTML = '<p class="text-center py-4" style="grid-column: 1/-1;">No parking slots created yet.</p>';
    } else {
      mapContainer.innerHTML = slots.map(slot => {
        const isOccupied = slot.status === 'Occupied';
        const activeRecord = activeParkedRecords.find(r => r.slotNumber === slot.slotNumber);
        return `
          <div class="slot-tile ${isOccupied ? 'occupied' : 'available'}">
            <span class="slot-tile-number">${slot.slotNumber}</span>
            <span class="slot-tile-status">${slot.status}</span>
            ${activeRecord ? `<span class="slot-tile-vehicle">🚗 ${activeRecord.vehicleNumber}</span>` : ''}
          </div>
        `;
      }).join('');
    }

    // Render active parked table
    const tableBody = document.getElementById('activeParkedTableBody');
    const badge = document.getElementById('activeCountBadge');
    badge.textContent = `${activeParkedRecords.length} Parked`;

    if (activeParkedRecords.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-muted">No vehicles currently parked.</td></tr>';
    } else {
      tableBody.innerHTML = activeParkedRecords.map(item => `
        <tr>
          <td><strong class="badge badge-primary">${item.slotNumber}</strong></td>
          <td><strong>${item.vehicleNumber}</strong></td>
          <td>${item.vehicleType}</td>
          <td>${item.ownerName}</td>
          <td>${item.phone}</td>
          <td>${formatDateTime(item.entryTime)}</td>
          <td>${item.currentDurationHours} hr(s)</td>
          <td><strong class="text-green">₹${item.estimatedFee}</strong></td>
          <td>
            <button class="btn btn-sm btn-danger" onclick="quickExit('${item._id}')">
              📤 Exit
            </button>
          </td>
        </tr>
      `).join('');
    }

  } catch (error) {
    console.error('Error loading dashboard:', error);
    showToast('Failed to load dashboard statistics', 'danger');
  }
}

// Quick shortcut from dashboard to exit a specific vehicle
function quickExit(recordId) {
  switchTab('exit');
  setTimeout(() => {
    const select = document.getElementById('exitRecordSelect');
    select.value = recordId;
    select.dispatchEvent(new Event('change'));
  }, 200);
}

// ================= 2. VEHICLE MANAGEMENT =================
async function loadVehicles() {
  try {
    const res = await fetch(API.vehicles);
    const result = await res.json();
    if (result.success) {
      allVehicles = result.data;
      renderVehicleTable(allVehicles);
    }
  } catch (error) {
    console.error('Error loading vehicles:', error);
    showToast('Failed to load vehicles', 'danger');
  }
}

function renderVehicleTable(vehicles) {
  const tbody = document.getElementById('vehicleTableBody');
  if (vehicles.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No vehicles registered yet.</td></tr>';
    return;
  }

  tbody.innerHTML = vehicles.map(v => `
    <tr>
      <td><strong>${v.vehicleNumber}</strong></td>
      <td><span class="badge badge-primary">${v.vehicleType}</span></td>
      <td>${v.ownerName}</td>
      <td>${v.phone}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteVehicle('${v._id}', '${v.vehicleNumber}')">
          🗑️ Delete
        </button>
      </td>
    </tr>
  `).join('');
}

// Search filter for vehicles
document.getElementById('searchVehicleInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  const filtered = allVehicles.filter(v => 
    v.vehicleNumber.toLowerCase().includes(query) || 
    v.ownerName.toLowerCase().includes(query) ||
    v.phone.includes(query)
  );
  renderVehicleTable(filtered);
});

// Add Vehicle form submit
document.getElementById('addVehicleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const payload = {
    vehicleNumber: form.vehicleNumber.value.trim().toUpperCase(),
    ownerName: form.ownerName.value.trim(),
    vehicleType: form.vehicleType.value,
    phone: form.phone.value.trim()
  };

  try {
    const res = await fetch(API.vehicles, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast(data.message || 'Vehicle added successfully!');
      form.reset();
      loadVehicles();
    } else {
      showToast(data.message || 'Failed to add vehicle', 'danger');
    }
  } catch (error) {
    showToast('Server error while adding vehicle', 'danger');
  }
});

// Delete vehicle
async function deleteVehicle(id, vehicleNumber) {
  if (!confirm(`Are you sure you want to delete vehicle ${vehicleNumber}?`)) return;

  try {
    const res = await fetch(`${API.vehicles}/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (data.success) {
      showToast(data.message);
      loadVehicles();
    } else {
      showToast(data.message, 'danger');
    }
  } catch (error) {
    showToast('Failed to delete vehicle', 'danger');
  }
}

// ================= 3. PARKING SLOTS MANAGEMENT =================
async function loadSlots() {
  try {
    const res = await fetch(API.slots);
    const result = await res.json();
    if (result.success) {
      allSlots = result.data;
      renderSlotsGrid();
    }
  } catch (error) {
    showToast('Failed to load slots', 'danger');
  }
}

function renderSlotsGrid() {
  const container = document.getElementById('slotsGridContainer');
  let filtered = allSlots;

  if (currentSlotFilter !== 'all') {
    filtered = allSlots.filter(s => s.status === currentSlotFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-center py-4" style="grid-column: 1/-1;">No parking slots found.</p>';
    return;
  }

  container.innerHTML = filtered.map(slot => {
    const isOccupied = slot.status === 'Occupied';
    return `
      <div class="slot-tile ${isOccupied ? 'occupied' : 'available'}">
        ${!isOccupied ? `
          <button class="slot-tile-delete" title="Delete slot" onclick="deleteSlot('${slot._id}', '${slot.slotNumber}')">✖</button>
        ` : ''}
        <span class="slot-tile-number">${slot.slotNumber}</span>
        <span class="slot-tile-status">${slot.status}</span>
      </div>
    `;
  }).join('');
}

// Slot filter tabs
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSlotFilter = btn.dataset.filter;
    renderSlotsGrid();
  });
});

// Add Slot form submit
document.getElementById('addSlotForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('slotNumber');
  const slotNumber = input.value.trim().toUpperCase();

  try {
    const res = await fetch(API.slots, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotNumber })
    });
    const data = await res.json();

    if (data.success) {
      showToast(data.message || 'Parking slot created!');
      input.value = '';
      loadSlots();
    } else {
      showToast(data.message, 'danger');
    }
  } catch (error) {
    showToast('Failed to create parking slot', 'danger');
  }
});

// Delete slot
async function deleteSlot(id, slotNumber) {
  if (!confirm(`Delete parking slot ${slotNumber}?`)) return;

  try {
    const res = await fetch(`${API.slots}/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (data.success) {
      showToast(data.message);
      loadSlots();
    } else {
      showToast(data.message, 'danger');
    }
  } catch (error) {
    showToast('Failed to delete parking slot', 'danger');
  }
}

// ================= 4. VEHICLE ENTRY (CHECK-IN) =================
async function loadEntryForm() {
  const vehicleSelect = document.getElementById('entryVehicleSelect');
  const slotSelect = document.getElementById('entrySlotSelect');
  const timeInput = document.getElementById('entryTimeInput');
  const previewBox = document.getElementById('entryVehiclePreview');

  timeInput.value = getLocalDateTimeString(new Date());
  previewBox.classList.add('hidden');

  try {
    // 1. Fetch all vehicles and active parked
    const [vRes, aRes, sRes] = await Promise.all([
      fetch(API.vehicles),
      fetch(`${API.parking}/active`),
      fetch(`${API.slots}?status=Available`)
    ]);

    const vData = await vRes.json();
    const aData = await aRes.json();
    const sData = await sRes.json();

    allVehicles = vData.success ? vData.data : [];
    const activeVehicles = (aData.success ? aData.data : []).map(r => r.vehicleNumber);
    const availableSlots = sData.success ? sData.data : [];

    // Populate vehicle select (disable vehicles already parked)
    vehicleSelect.innerHTML = '<option value="">-- Choose Registered Vehicle --</option>' +
      allVehicles.map(v => {
        const isParked = activeVehicles.includes(v.vehicleNumber);
        return `<option value="${v.vehicleNumber}" ${isParked ? 'disabled' : ''}>
          ${v.vehicleNumber} - ${v.ownerName} (${v.vehicleType})${isParked ? ' [ALREADY PARKED]' : ''}
        </option>`;
      }).join('');

    // Populate available slots select
    slotSelect.innerHTML = '<option value="">-- Choose Available Slot --</option>' +
      availableSlots.map(s => `<option value="${s.slotNumber}">Slot ${s.slotNumber} (Available)</option>`).join('');

    if (availableSlots.length === 0) {
      slotSelect.innerHTML = '<option value="">⚠️ No Available Slots Right Now</option>';
    }

  } catch (error) {
    showToast('Failed to load entry form dropdowns', 'danger');
  }
}

// Vehicle select change preview
document.getElementById('entryVehicleSelect').addEventListener('change', (e) => {
  const selectedNum = e.target.value;
  const preview = document.getElementById('entryVehiclePreview');

  if (!selectedNum) {
    preview.classList.add('hidden');
    return;
  }

  const v = allVehicles.find(item => item.vehicleNumber === selectedNum);
  if (v) {
    document.getElementById('previewOwner').textContent = v.ownerName;
    document.getElementById('previewType').textContent = v.vehicleType;
    document.getElementById('previewPhone').textContent = v.phone;
    preview.classList.remove('hidden');
  }
});

// Vehicle Entry submit
document.getElementById('vehicleEntryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const vehicleNumber = document.getElementById('entryVehicleSelect').value;
  const slotNumber = document.getElementById('entrySlotSelect').value;
  const entryTimeVal = document.getElementById('entryTimeInput').value;

  if (!vehicleNumber || !slotNumber) {
    showToast('Please select both a vehicle and an available slot', 'danger');
    return;
  }

  try {
    const res = await fetch(`${API.parking}/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleNumber,
        slotNumber,
        entryTime: entryTimeVal ? new Date(entryTimeVal).toISOString() : new Date().toISOString()
      })
    });
    const data = await res.json();

    if (data.success) {
      showToast(data.message);
      document.getElementById('vehicleEntryForm').reset();
      document.getElementById('entryVehiclePreview').classList.add('hidden');
      switchTab('dashboard');
    } else {
      showToast(data.message, 'danger');
    }
  } catch (error) {
    showToast('Error processing vehicle entry', 'danger');
  }
});

// ================= 5. VEHICLE EXIT (CHECK-OUT) =================
async function loadExitForm() {
  const exitSelect = document.getElementById('exitRecordSelect');
  const timeInput = document.getElementById('exitTimeInput');
  const calcBox = document.getElementById('exitCalculationBox');

  timeInput.value = getLocalDateTimeString(new Date());
  calcBox.classList.add('hidden');

  try {
    const res = await fetch(`${API.parking}/active`);
    const result = await res.json();
    activeParkedRecords = result.success ? result.data : [];

    if (activeParkedRecords.length === 0) {
      exitSelect.innerHTML = '<option value="">⚠️ No vehicles currently parked</option>';
      return;
    }

    exitSelect.innerHTML = '<option value="">-- Select Active Parked Vehicle --</option>' +
      activeParkedRecords.map(r => `
        <option value="${r._id}">
          Slot ${r.slotNumber} - ${r.vehicleNumber} (${r.ownerName})
        </option>
      `).join('');

  } catch (error) {
    showToast('Failed to load active parked vehicles', 'danger');
  }
}

// Live calculation update when choosing parked record or exit time
function updateExitCalculation() {
  const recordId = document.getElementById('exitRecordSelect').value;
  const calcBox = document.getElementById('exitCalculationBox');
  const exitTimeVal = document.getElementById('exitTimeInput').value;

  if (!recordId) {
    calcBox.classList.add('hidden');
    return;
  }

  const record = activeParkedRecords.find(r => r._id === recordId);
  if (!record) return;

  const entryDate = new Date(record.entryTime);
  const exitDate = exitTimeVal ? new Date(exitTimeVal) : new Date();

  const diffMs = Math.max(0, exitDate - entryDate);
  const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  const fee = hours * 20;

  document.getElementById('calcSlot').textContent = record.slotNumber;
  document.getElementById('calcVehicle').textContent = record.vehicleNumber;
  document.getElementById('calcOwner').textContent = `${record.ownerName} (${record.vehicleType})`;
  document.getElementById('calcEntryTime').textContent = formatDateTime(record.entryTime);
  document.getElementById('calcDuration').textContent = `${hours} hour(s)`;
  document.getElementById('calcFee').textContent = `₹${fee}`;

  calcBox.classList.remove('hidden');
}

document.getElementById('exitRecordSelect').addEventListener('change', updateExitCalculation);
document.getElementById('exitTimeInput').addEventListener('input', updateExitCalculation);

// Process Exit submit
document.getElementById('vehicleExitForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const recordId = document.getElementById('exitRecordSelect').value;
  const exitTimeVal = document.getElementById('exitTimeInput').value;

  if (!recordId) {
    showToast('Please select a parked vehicle to exit', 'danger');
    return;
  }

  try {
    const res = await fetch(`${API.parking}/exit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recordId,
        exitTime: exitTimeVal ? new Date(exitTimeVal).toISOString() : new Date().toISOString()
      })
    });
    const result = await res.json();

    if (result.success) {
      showToast(result.message);
      document.getElementById('vehicleExitForm').reset();
      document.getElementById('exitCalculationBox').classList.add('hidden');
      showReceiptModal(result.data);
    } else {
      showToast(result.message, 'danger');
    }
  } catch (error) {
    showToast('Error processing vehicle exit', 'danger');
  }
});

// ================= RECEIPT MODAL =================
function showReceiptModal(data) {
  document.getElementById('rcptVehicle').textContent = data.vehicleNumber;
  document.getElementById('rcptType').textContent = data.vehicleType;
  document.getElementById('rcptOwner').textContent = data.ownerName;
  document.getElementById('rcptSlot').textContent = data.slotNumber;
  document.getElementById('rcptEntry').textContent = formatDateTime(data.entryTime);
  document.getElementById('rcptExit').textContent = formatDateTime(data.exitTime);
  document.getElementById('rcptHours').textContent = `${data.durationHours} hr(s) @ ₹${data.hourlyRate}/hr`;
  document.getElementById('rcptFee').textContent = `₹${data.fee}`;

  document.getElementById('receiptModal').classList.remove('hidden');
}

function closeReceiptModal() {
  document.getElementById('receiptModal').classList.add('hidden');
  switchTab('dashboard');
}

// ================= 6. PARKING HISTORY =================
async function loadHistory() {
  try {
    const [histRes, statsRes] = await Promise.all([
      fetch(`${API.parking}/records`),
      fetch(`${API.dashboard}/stats`)
    ]);

    const histData = await histRes.json();
    const statsData = await statsRes.json();

    if (statsData.success) {
      document.getElementById('totalRevenuePill').textContent = `₹${statsData.data.totalRevenue}`;
    }

    const tbody = document.getElementById('historyTableBody');
    if (!histData.success || histData.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No parking records recorded yet.</td></tr>';
      return;
    }

    tbody.innerHTML = histData.data.map(rec => {
      const isParked = !rec.exitTime;
      return `
        <tr>
          <td><strong>${rec.vehicleNumber}</strong></td>
          <td><span class="badge badge-primary">${rec.slotNumber}</span></td>
          <td>${formatDateTime(rec.entryTime)}</td>
          <td>${formatDateTime(rec.exitTime)}</td>
          <td><strong class="text-green">₹${rec.fee || 0}</strong></td>
          <td>
            <span class="badge ${isParked ? 'badge-danger' : 'badge-success'}">
              ${isParked ? 'Active (Parked)' : 'Exited (Paid)'}
            </span>
          </td>
        </tr>
      `;
    }).join('');

  } catch (error) {
    showToast('Failed to load parking history', 'danger');
  }
}

// Navigation click listener
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
  });
});

// Initial boot
window.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
});
