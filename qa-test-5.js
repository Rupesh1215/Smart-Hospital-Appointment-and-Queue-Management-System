// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest5Full() {
  console.log("=== STARTING QA TEST 5 (REFINED): Doctor Check-In and Queue Status Transition ===");

  // 1. Setup Admin Token
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const adminToken = adminLogin.data.token;

  // 2. Setup Doctor Token (Dr. Arjun Mehta)
  const docsRes = await fetch(`${BASE_URL}/doctors`).then(r => r.json());
  const doctor = (docsRes.data || []).find(d => (d.doctorName || d.name || '').includes('Arjun Mehta')) || docsRes.data[0];
  const doctorId = doctor.id;

  const docLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'doctor@gmail.com', password: '12345678' })
  }).then(r => r.json());
  let docToken = docLogin.data.token;

  // 3. Setup Patient (Arun Kumar) & Book Appointment for today
  const todayStr = new Date().toISOString().split('T')[0];
  const patientEmail = `qa5_arun_${Date.now()}@smarthospital.com`;
  
  await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Arun Kumar',
      email: patientEmail,
      password: 'password123',
      role: 'PATIENT',
      phone: '9876543210',
      gender: 'MALE',
      age: 30
    })
  });

  const pLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: patientEmail, password: 'password123' })
  }).then(r => r.json());
  const patientToken = pLogin.data.token;
  const patientId = pLogin.data.id || pLogin.data.userId;

  const slotsRes = await fetch(`${BASE_URL}/doctors/${doctorId}/slots?date=${todayStr}`).then(r => r.json());
  const availableSlot = (slotsRes.data || []).find(s => s.isAvailable ?? s.available);
  if (!availableSlot) {
    console.error("No available slots today for doctor");
    return;
  }

  // Book an appointment for today
  const bookRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${patientToken}`
    },
    body: JSON.stringify({
      doctorId: doctorId,
      appointmentDate: todayStr,
      startTime: availableSlot.startTime,
      reason: 'QA Test 5 - Full Queue Transition'
    })
  }).then(r => r.json());

  if (!bookRes.success || !bookRes.data) {
    console.error("Booking failed:", bookRes);
    return;
  }
  const apptId = bookRes.data.id;
  console.log(`Appointment Created: ID=${apptId}, Status=${bookRes.data.status}, Date=${todayStr}`);

  // Step 1: Receptionist Check-In via /api/queues/check-in
  const checkInRes = await fetch(`${BASE_URL}/queues/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ appointmentId: apptId })
  }).then(r => r.json());
  const queueEntry = checkInRes.data;
  console.log(`Receptionist Check-In Result: Token=${queueEntry.tokenNumber}, Status=${queueEntry.status}, QueueID=${queueEntry.id}`);

  // Step 2: Doctor Call Next via /api/queues/call-next
  const callNextRes = await fetch(`${BASE_URL}/queues/call-next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
    body: JSON.stringify({ doctorId: doctorId })
  }).then(r => r.json());
  console.log("Doctor Called Patient Result:", callNextRes.data ? `Status: ${callNextRes.data.status}, ID: ${callNextRes.data.id}` : callNextRes.message);

  // Step 3: Doctor Start Consultation via /api/queues/start (CALLED -> IN_CONSULTATION)
  const activeQueueId = callNextRes.data ? callNextRes.data.id : queueEntry.id;
  const startRes = await fetch(`${BASE_URL}/queues/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
    body: JSON.stringify({ queueId: activeQueueId })
  }).then(r => r.json());
  console.log("Doctor Started Consultation Result:", startRes.data ? startRes.data.status : startRes.message);

  // Step 4: Doctor Complete Consultation via /api/queues/complete (IN_CONSULTATION -> COMPLETED)
  const completeRes = await fetch(`${BASE_URL}/queues/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
    body: JSON.stringify({ queueId: activeQueueId })
  }).then(r => r.json());
  console.log("Doctor Completed Consultation Result:", completeRes.data ? completeRes.data.status : completeRes.message);

  // Step 5: Verify Synchronized State Across All Views
  const pStatus = await fetch(`${BASE_URL}/queues/patient/me`, { headers: { 'Authorization': `Bearer ${patientToken}` } }).then(r => r.json());
  const docQueue = await fetch(`${BASE_URL}/queues/doctor/me`, { headers: { 'Authorization': `Bearer ${docToken}` } }).then(r => r.json());
  const adminToday = await fetch(`${BASE_URL}/queues/today`, { headers: { 'Authorization': `Bearer ${adminToken}` } }).then(r => r.json());
  const apptRecord = await fetch(`${BASE_URL}/appointments/${apptId}`, { headers: { 'Authorization': `Bearer ${adminToken}` } }).then(r => r.json());

  console.log("\n=== CROSS-MODULE STATE VERIFICATION ===");
  console.log(JSON.stringify({
    appointmentStatus: apptRecord.data.status,
    patientQueueViewStatus: pStatus.data?.status,
    doctorQueueViewStatus: (docQueue.data || []).find(q => q.id === activeQueueId)?.status,
    adminQueueMonitorTotalCount: (adminToday.data || []).length,
    adminQueueMonitorStatus: (adminToday.data || []).find(q => q.id === activeQueueId)?.status
  }, null, 2));
}

runQaTest5Full();
