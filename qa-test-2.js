// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest2() {
  console.log("=== STARTING QA TEST 2: Same Doctor, Same Time Slot, Different Dates ===");
  
  // 1. Setup Patients P1, P2, P3
  const patients = [
    { label: 'P1', name: 'Arun Kumar', date: '2026-10-05', targetTime: '10:00' },
    { label: 'P2', name: 'Ravi Kumar', date: '2026-10-06', targetTime: '10:00' },
    { label: 'P3', name: 'Suresh Kumar', date: '2026-10-07', targetTime: '10:00' }
  ];

  for (let p of patients) {
    p.email = `qa2_${p.label.toLowerCase()}_${Date.now()}@smarthospital.com`;
    p.password = 'password123';
    
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
    
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: p.email, password: p.password })
    });
    const loginJson = await res.json();
    p.token = loginJson.data.token;
    p.userId = loginJson.data.id || loginJson.data.userId;
  }

  // 2. Doctor selection (Dr. Arjun Mehta or any active doctor)
  const docsRes = await fetch(`${BASE_URL}/doctors`).then(r => r.json());
  const doctor = (docsRes.data || []).find(d => (d.doctorName || d.name || '').includes('Arjun Mehta')) || docsRes.data[0];

  const doctorName = doctor.doctorName || doctor.name;
  const doctorId = doctor.id;

  const results = [];

  // 3. Book 10:00 AM on 3 different dates
  for (let p of patients) {
    const slotsRes = await fetch(`${BASE_URL}/doctors/${doctorId}/slots?date=${p.date}`).then(r => r.json());
    const availableSlots = slotsRes.data || [];
    
    let chosenSlot = availableSlots.find(s => s.startTime.startsWith(p.targetTime) && (s.isAvailable ?? s.available));

    if (!chosenSlot) {
      results.push({ label: p.label, name: p.name, doctor: doctorName, date: p.date, slotTime: p.targetTime, result: 'FAIL - Slot Unavailable', error: 'Slot not found or unavailable' });
      continue;
    }

    const bookPayload = {
      doctorId: doctorId,
      appointmentDate: p.date,
      startTime: chosenSlot.startTime,
      reason: `QA Test 2 - ${p.label}`
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
      results.push({ label: p.label, name: p.name, doctor: doctorName, date: p.date, slotTime: chosenSlot.startTime, result: 'FAIL', error: bookText });
      continue;
    }

    if (bookRes.ok && bookJson.success) {
      const appt = bookJson.data;
      results.push({
        label: p.label,
        name: p.name,
        doctor: doctorName,
        date: p.date,
        slotTime: chosenSlot.startTime,
        formattedSlot: `${chosenSlot.startTime} - ${chosenSlot.endTime}`,
        result: 'SUCCESS',
        appointmentId: appt.id,
        status: appt.status,
        token: p.token
      });
    } else {
      results.push({ label: p.label, name: p.name, doctor: doctorName, date: p.date, slotTime: chosenSlot.startTime, result: 'FAIL', error: bookJson.message });
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

  // 5. Verify Doctor / Admin View for all dates
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const adminToken = adminLogin.data.token;

  let allFoundInDocView = true;
  const docViewByDate = {};

  for (let p of patients) {
    const docApptsRes = await fetch(`${BASE_URL}/appointments?doctorId=${doctorId}&date=${p.date}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).then(r => r.json());
    const docAppts = docApptsRes.data || [];
    docViewByDate[p.date] = docAppts.map(a => ({ id: a.id, patient: a.patientName, time: a.startTime, date: a.appointmentDate }));
    
    const targetResult = results.find(r => r.label === p.label);
    if (targetResult && targetResult.appointmentId) {
      const found = docAppts.some(da => da.id === targetResult.appointmentId);
      if (!found) allFoundInDocView = false;
    }
  }

  console.log(JSON.stringify({
    results,
    patientIsolationPass,
    allFoundInDocView,
    docViewByDate
  }, null, 2));
}

runQaTest2();
