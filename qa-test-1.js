// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest1() {
  console.log("=== STARTING QA TEST 1: Same Doctor, Different Time Slots ===");
  
  // 1. Setup Patients P1, P2, P3
  const patients = [
    { label: 'P1', name: 'Arun Kumar', email: 'arun.kumar.qa1@smarthospital.com', password: 'password123', targetTime: '10:00' },
    { label: 'P2', name: 'Ravi Kumar', email: 'ravi.kumar.qa1@smarthospital.com', password: 'password123', targetTime: '11:00' },
    { label: 'P3', name: 'Suresh Kumar', email: 'suresh.kumar.qa1@smarthospital.com', password: 'password123', targetTime: '12:00' }
  ];

  for (let p of patients) {
    p.email = `qa1_${p.label.toLowerCase()}_${Date.now()}@smarthospital.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
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
    const regJson = await regRes.json();
    if (!regRes.ok) {
      console.error("Register error:", regJson);
    }
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: p.email, password: p.password })
    });
    const loginJson = await res.json();
    if (!loginJson.success || !loginJson.data) {
      console.error("Login failed for patient", p.email, loginJson);
      continue;
    }
    p.token = loginJson.data.token;
    p.userId = loginJson.data.id || loginJson.data.userId;
  }

  // 2. Doctor selection (Dr. Arjun Mehta or any Cardiology doctor)
  const docsRes = await fetch(`${BASE_URL}/doctors`).then(r => r.json());
  const doctor = (docsRes.data || []).find(d => (d.doctorName || d.name || '').includes('Arjun Mehta')) || docsRes.data[0];

  const doctorName = doctor.doctorName || doctor.name;
  const doctorId = doctor.id;
  const deptName = doctor.departmentName || 'Cardiology';

  // 3. Select Date: 2026-10-05 (Monday)
  const testDate = '2026-10-05';

  const slotsRes = await fetch(`${BASE_URL}/doctors/${doctorId}/slots?date=${testDate}`).then(r => r.json());
  const availableSlots = slotsRes.data || [];

  const results = [];

  for (let p of patients) {
    let chosenSlot = availableSlots.find(s => s.startTime.startsWith(p.targetTime) && (s.isAvailable ?? s.available));
    if (!chosenSlot) {
      chosenSlot = availableSlots.find(s => (s.isAvailable ?? s.available) && !results.some(r => r.slotTime === s.startTime));
    }

    if (!chosenSlot) {
      results.push({ label: p.label, name: p.name, doctor: doctorName, date: testDate, slot: p.targetTime, result: 'FAIL - No Slot', id: 'N/A' });
      continue;
    }

    const bookPayload = {
      doctorId: doctorId,
      appointmentDate: testDate,
      startTime: chosenSlot.startTime,
      reason: `QA Test 1 - ${p.label}`
    };

    const bookRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${p.token}`
      },
      body: JSON.stringify(bookPayload)
    });

    const bookText = await bookRes.text();
    let bookJson;
    try {
      bookJson = JSON.parse(bookText);
    } catch(e) {
      console.error("Non-JSON book response:", bookText);
      results.push({ label: p.label, name: p.name, doctor: doctorName, date: testDate, slotTime: chosenSlot.startTime, result: 'FAIL', error: bookText });
      continue;
    }
    if (bookRes.ok && bookJson.success) {
      const appt = bookJson.data;
      results.push({
        label: p.label,
        name: p.name,
        doctor: doctorName,
        date: testDate,
        slotTime: chosenSlot.startTime,
        formattedSlot: `${chosenSlot.startTime} - ${chosenSlot.endTime}`,
        result: 'SUCCESS',
        appointmentId: appt.id,
        status: appt.status,
        token: p.token
      });
      // mark slot unavailable locally for next iterations if needed
      chosenSlot.available = false;
      chosenSlot.isAvailable = false;
    } else {
      results.push({ label: p.label, name: p.name, doctor: doctorName, date: testDate, slotTime: chosenSlot.startTime, result: 'FAIL', error: bookJson.message });
    }
  }

  // 4. Verify Patient Isolation
  let patientIsolationPass = true;
  for (let r of results) {
    if (r.appointmentId) {
      const pApptsRes = await fetch(`${BASE_URL}/appointments/mine`, {
        headers: { 'Authorization': `Bearer ${r.token}` }
      }).then(res => res.json());
      const pAppts = pApptsRes.data || [];
      const hasSelf = pAppts.some(a => a.id === r.appointmentId);
      const hasOthers = pAppts.some(a => results.some(other => other.label !== r.label && other.appointmentId === a.id));
      if (!hasSelf || hasOthers) patientIsolationPass = false;
    }
  }

  // 5. Verify Doctor View
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

  const foundAllInDocView = results.every(r => docAppts.some(da => da.id === r.appointmentId));

  console.log(JSON.stringify({
    results,
    patientIsolationPass,
    foundAllInDocView,
    docApptsCount: docAppts.length,
    docApptsList: docAppts.map(a => ({ id: a.id, patient: a.patientName, time: a.appointmentTime, date: a.appointmentDate }))
  }, null, 2));
}

runQaTest1();
