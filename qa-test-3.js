// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest3() {
  console.log("=== STARTING QA TEST 3: Same Doctor, Same Date, Same Slot, Different Patients ===");
  
  // 1. Setup Patients P1 (Arun), P2 (Ravi), P3 (Suresh)
  const patients = [
    { label: 'P1', name: 'Arun Kumar' },
    { label: 'P2', name: 'Ravi Kumar' },
    { label: 'P3', name: 'Suresh Kumar' }
  ];

  for (let p of patients) {
    p.email = `qa3_${p.label.toLowerCase()}_${Date.now()}@smarthospital.com`;
    p.password = 'password123';
    
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: p.name,
        email: p.email,
        password: p.password,
        role: 'PATIENT',
        phone: '9876543210',
        gender: 'MALE',
        age: 30
      })
    });
    
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: p.email, password: p.password })
    });
    const loginJson = await res.json();
    p.token = loginJson.data.token;
    p.userId = loginJson.data.id || loginJson.data.userId;
  }

  // 2. Doctor selection (Dr. Arjun Mehta or active doctor)
  const docsRes = await fetch(`${BASE_URL}/doctors`).then(r => r.json());
  const doctor = (docsRes.data || []).find(d => (d.doctorName || d.name || '').includes('Arjun Mehta')) || docsRes.data[0];

  const doctorName = doctor.doctorName || doctor.name;
  const doctorId = doctor.id;
  const testDate = '2026-10-12'; // Monday, fresh future date

  console.log(`Using Doctor: ${doctorName}, Date: ${testDate}`);

  // Fetch slots for testDate to find available slot around 10:00
  const slotsRes = await fetch(`${BASE_URL}/doctors/${doctorId}/slots?date=${testDate}`).then(r => r.json());
  const availableSlots = slotsRes.data || [];
  const targetSlot = availableSlots.find(s => s.startTime.startsWith('10:00') && (s.isAvailable ?? s.available)) || availableSlots.find(s => s.isAvailable ?? s.available);

  if (!targetSlot) {
    console.error("No available slots on", testDate);
    return;
  }

  const slotTime = targetSlot.startTime;
  console.log(`Targeting slot: ${slotTime}`);

  const results = [];

  // Step 1: Patient 1 (Arun) books
  const bookPayload = {
    doctorId: doctorId,
    appointmentDate: testDate,
    startTime: slotTime,
    reason: 'QA Test 3 - P1 First Booking'
  };

  const p1Res = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${patients[0].token}`
    },
    body: JSON.stringify(bookPayload)
  });
  const p1Json = await p1Res.json();

  if (p1Res.ok && p1Json.success) {
    results.push({
      patient: patients[0].name,
      doctor: doctorName,
      date: testDate,
      time: slotTime,
      result: 'SUCCESS',
      appointmentId: p1Json.data.id,
      statusCode: p1Res.status
    });
  } else {
    results.push({
      patient: patients[0].name,
      doctor: doctorName,
      date: testDate,
      time: slotTime,
      result: 'FAIL - P1 booking failed',
      error: p1Json,
      statusCode: p1Res.status
    });
  }

  // Step 2 & 3: Patients 2 & 3 attempt to book the EXACT SAME Doctor + Date + Time directly via API
  for (let i = 1; i <= 2; i++) {
    const p = patients[i];
    const pRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${p.token}`
      },
      body: JSON.stringify({
        doctorId: doctorId,
        appointmentDate: testDate,
        startTime: slotTime,
        reason: `QA Test 3 - ${p.label} Double Booking Attempt`
      })
    });
    
    const pText = await pRes.text();
    let pJson;
    try { pJson = JSON.parse(pText); } catch(e) { pJson = { raw: pText }; }

    if (pRes.ok && pJson.success) {
      results.push({
        patient: p.name,
        doctor: doctorName,
        date: testDate,
        time: slotTime,
        result: 'CRITICAL FAIL - Double Booked!',
        appointmentId: pJson.data.id,
        statusCode: pRes.status
      });
    } else {
      results.push({
        patient: p.name,
        doctor: doctorName,
        date: testDate,
        time: slotTime,
        result: 'REJECTED (EXPECTED)',
        appointmentId: 'N/A',
        errorMessage: pJson.message || pJson.error || pText,
        statusCode: pRes.status
      });
    }
  }

  // Verification 4: Database / Backend Integrity check
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const adminToken = adminLogin.data.token;

  const docApptsRes = await fetch(`${BASE_URL}/appointments?doctorId=${doctorId}&date=${testDate}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());
  
  const docAppts = docApptsRes.data || [];
  const slotAppts = docAppts.filter(a => a.startTime === slotTime);

  // Patient 2 and 3 visibility checks
  const p2Mine = await fetch(`${BASE_URL}/appointments/mine`, { headers: { 'Authorization': `Bearer ${patients[1].token}` } }).then(r => r.json());
  const p3Mine = await fetch(`${BASE_URL}/appointments/mine`, { headers: { 'Authorization': `Bearer ${patients[2].token}` } }).then(r => r.json());

  console.log(JSON.stringify({
    results,
    backendExactCountForSlot: slotAppts.length,
    backendSlotApptsList: slotAppts.map(a => ({ id: a.id, patient: a.patientName, time: a.startTime })),
    p2AppointmentCount: (p2Mine.data || []).length,
    p3AppointmentCount: (p3Mine.data || []).length
  }, null, 2));
}

runQaTest3();
