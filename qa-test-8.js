// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest8() {
  console.log("=== STARTING QA TEST 8: Receptionist Check-In and Queue Creation ===");

  // 1. Setup Tokens
  const recepLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'receptionist@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const recepToken = recepLogin.data.token;

  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const adminToken = adminLogin.data.token;

  const doctorId = '6abab82f336aed31d4c3732e'; // Dr. Arjun Mehta

  // 2. Setup Patient (Ravi Kumar)
  const patientEmail = `qa8_ravi_${Date.now()}@smarthospital.com`;
  await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ravi Kumar',
      email: patientEmail,
      password: 'password123',
      role: 'PATIENT',
      phone: '9876543211',
      gender: 'MALE',
      age: 32
    })
  });

  const pLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: patientEmail, password: 'password123' })
  }).then(r => r.json());
  const patientToken = pLogin.data.token;

  const pProfile = await fetch(`${BASE_URL}/patients/me`, {
    headers: { 'Authorization': `Bearer ${patientToken}` }
  }).then(r => r.json());
  const patientProfileId = pProfile.data.id;

  // 3. Create appointment for today (2026-09-30)
  const todayStr = new Date().toISOString().split('T')[0];
  const slotsRes = await fetch(`${BASE_URL}/doctors/${doctorId}/slots?date=${todayStr}`).then(r => r.json());
  const availableSlot = (slotsRes.data || []).find(s => s.isAvailable ?? s.available);

  const bookRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientToken}` },
    body: JSON.stringify({
      doctorId: doctorId,
      appointmentDate: todayStr,
      startTime: availableSlot.startTime,
      reason: 'QA Test 8 - Check-In Test'
    })
  }).then(r => r.json());

  const apptId = bookRes.data.id;
  console.log(`Appointment Created: ID=${apptId}, Status=${bookRes.data.status}`);

  // Step 2: Receptionist Check-In
  const checkInRes = await fetch(`${BASE_URL}/queues/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${recepToken}` },
    body: JSON.stringify({ appointmentId: apptId })
  }).then(r => r.json());

  const queueEntry = checkInRes.data;
  console.log(`Check-In Result: Token=${queueEntry.tokenNumber}, Status=${queueEntry.status}, QueueID=${queueEntry.id}`);

  // Step 7: Duplicate Check-In Attempt
  const dupCheckInRes = await fetch(`${BASE_URL}/queues/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${recepToken}` },
    body: JSON.stringify({ appointmentId: apptId })
  });
  const dupCheckInText = await dupCheckInRes.text();
  let dupJson;
  try { dupJson = JSON.parse(dupCheckInText); } catch(e) { dupJson = { raw: dupCheckInText }; }

  console.log(`Duplicate Check-In Response Status: ${dupCheckInRes.status}, Message: ${dupJson.message || dupJson.raw}`);

  // Step 3-6: Cross-Module Queue Verification
  const recepQueue = await fetch(`${BASE_URL}/queues/${doctorId}`, {
    headers: { 'Authorization': `Bearer ${recepToken}` }
  }).then(r => r.json());

  const patientQueue = await fetch(`${BASE_URL}/queues/patient/me`, {
    headers: { 'Authorization': `Bearer ${patientToken}` }
  }).then(r => r.json());

  const docLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'doctor@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const docToken = docLogin.data.token;

  const docQueue = await fetch(`${BASE_URL}/queues/doctor/me`, {
    headers: { 'Authorization': `Bearer ${docToken}` }
  }).then(r => r.json());

  const adminQueue = await fetch(`${BASE_URL}/queues/today`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());

  const apptRecord = await fetch(`${BASE_URL}/appointments/${apptId}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());

  const matchingQueueEntries = (adminQueue.data || []).filter(q => q.appointmentId === apptId);

  console.log("\n=== CROSS-MODULE QUEUE VERIFICATION RESULTS ===");
  console.log(JSON.stringify({
    appointmentId: apptId,
    appointmentStatus: apptRecord.data.status,
    tokenNumber: queueEntry.tokenNumber,
    queueStatus: queueEntry.status,
    duplicateCheckInPrevented: !dupCheckInRes.ok || !dupJson.success,
    duplicateCheckInMessage: dupJson.message,
    matchingQueueEntriesInDatabase: matchingQueueEntries.length,
    recepQueueViewToken: (recepQueue.data || []).find(q => q.id === queueEntry.id)?.tokenNumber,
    patientQueueViewToken: patientQueue.data?.tokenNumber,
    doctorQueueViewToken: (docQueue.data || []).find(q => q.id === queueEntry.id)?.tokenNumber,
    adminQueueViewToken: (adminQueue.data || []).find(q => q.id === queueEntry.id)?.tokenNumber
  }, null, 2));
}

runQaTest8();
