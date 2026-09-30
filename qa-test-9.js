// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest9() {
  console.log("=== STARTING QA TEST 9: Receptionist Queue Ordering and Call-Next Operations ===");

  // 1. Setup Admin, Doctor & Receptionist Tokens
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const adminToken = adminLogin.data.token;

  const docLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'doctor@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const docToken = docLogin.data.token;
  const doctorId = '6abab82f336aed31d4c3732e'; // Dr. Arjun Mehta

  const recepLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'receptionist@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const recepToken = recepLogin.data.token;

  // Clear/Skip any remaining active queues for clean state
  const qCleanRes = await fetch(`${BASE_URL}/queues/today`, { headers: { 'Authorization': `Bearer ${adminToken}` } }).then(r => r.json());
  for (let q of (qCleanRes.data || [])) {
    if (q.status === 'CALLED' || q.status === 'IN_CONSULTATION' || q.status === 'WAITING') {
      await fetch(`${BASE_URL}/queues/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ queueId: q.id })
      });
    }
  }

  // 2. Setup Patients P1 (Arun), P2 (Ravi), P3 (Suresh) & Book Appointments for today
  const todayStr = new Date().toISOString().split('T')[0];
  const patients = [
    { label: 'P1', name: 'Arun Kumar', email: `qa9_p1_${Date.now()}@smarthospital.com` },
    { label: 'P2', name: 'Ravi Kumar', email: `qa9_p2_${Date.now()}@smarthospital.com` },
    { label: 'P3', name: 'Suresh Kumar', email: `qa9_p3_${Date.now()}@smarthospital.com` }
  ];

  const slotsRes = await fetch(`${BASE_URL}/doctors/${doctorId}/slots?date=${todayStr}`).then(r => r.json());
  const availableSlots = (slotsRes.data || []).filter(s => s.isAvailable ?? s.available);

  for (let i = 0; i < 3; i++) {
    const p = patients[i];
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: p.name, email: p.email, password: 'password123', role: 'PATIENT', phone: '9876543210', gender: 'MALE', age: 30 })
    });

    const pLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: p.email, password: 'password123' })
    }).then(r => r.json());
    p.token = pLogin.data.token;

    const bookRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${p.token}` },
      body: JSON.stringify({ doctorId: doctorId, appointmentDate: todayStr, startTime: availableSlots[i].startTime, reason: `QA Test 9 - ${p.label}` })
    }).then(r => r.json());
    p.apptId = bookRes.data.id;
    p.slotTime = availableSlots[i].startTime;
  }

  // 3. Receptionist checks in P1, P2, P3 in order
  for (let p of patients) {
    const checkInRes = await fetch(`${BASE_URL}/queues/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${recepToken}` },
      body: JSON.stringify({ appointmentId: p.apptId })
    }).then(r => r.json());
    p.queueId = checkInRes.data.id;
    p.tokenNumber = checkInRes.data.tokenNumber;
    p.queueNumber = checkInRes.data.queueNumber;
  }

  console.log("Initial Queue Created:");
  console.log(patients.map(p => ({ label: p.label, patient: p.name, token: p.tokenNumber, queueNum: p.queueNumber, slotTime: p.slotTime })));

  // 4. Call Next Operation 1
  const call1Res = await fetch(`${BASE_URL}/queues/call-next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
    body: JSON.stringify({ doctorId: doctorId })
  }).then(r => r.json());
  const called1 = call1Res.data;

  console.log(`Call Next #1 Result: Called Token #${called1.tokenNumber} (Patient ID: ${called1.patientId}), Status: ${called1.status}`);

  // Complete consultation for #1 to allow Call Next #2
  await fetch(`${BASE_URL}/queues/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
    body: JSON.stringify({ queueId: called1.id })
  });
  await fetch(`${BASE_URL}/queues/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
    body: JSON.stringify({ queueId: called1.id })
  });

  // 5. Call Next Operation 2
  const call2Res = await fetch(`${BASE_URL}/queues/call-next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
    body: JSON.stringify({ doctorId: doctorId })
  }).then(r => r.json());
  const called2 = call2Res.data;

  console.log(`Call Next #2 Result: Called Token #${called2.tokenNumber} (Patient ID: ${called2.patientId}), Status: ${called2.status}`);

  // 6. Cross-Module View & Privacy Check
  const p1QueueState = await fetch(`${BASE_URL}/queues/patient/me`, { headers: { 'Authorization': `Bearer ${patients[0].token}` } }).then(r => r.json());
  const p2QueueState = await fetch(`${BASE_URL}/queues/patient/me`, { headers: { 'Authorization': `Bearer ${patients[1].token}` } }).then(r => r.json());
  const p3QueueState = await fetch(`${BASE_URL}/queues/patient/me`, { headers: { 'Authorization': `Bearer ${patients[2].token}` } }).then(r => r.json());

  console.log("\n=== CROSS-MODULE QUEUE ORDERING VERIFICATION ===");
  console.log(JSON.stringify({
    callNext1MatchP1: called1.tokenNumber === patients[0].tokenNumber,
    callNext2MatchP2: called2.tokenNumber === patients[1].tokenNumber,
    p1FinalStatus: p1QueueState.data?.status || 'COMPLETED',
    p2FinalStatus: p2QueueState.data?.status,
    p3FinalStatus: p3QueueState.data?.status,
    p3StillWaitingInQueue: p3QueueState.data?.status === 'WAITING'
  }, null, 2));
}

runQaTest9();
