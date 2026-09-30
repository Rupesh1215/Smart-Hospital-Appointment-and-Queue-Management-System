// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest14() {
  console.log("=== STARTING QA TEST 14: Concurrent Double-Booking Prevention ===");

  const doctorId = '6abab82f336aed31d4c3732e'; // Dr. Arjun Mehta
  const testDate = '2026-11-20';

  // 1. Setup Patient 1 (Arun Kumar) & Patient 2 (Ravi Kumar)
  const p1Email = `qa14_arun_${Date.now()}@smarthospital.com`;
  await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Arun Kumar', email: p1Email, password: 'password123', role: 'PATIENT', phone: '9876543210', gender: 'MALE', age: 30 })
  });
  const p1Login = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: p1Email, password: 'password123' })
  }).then(r => r.json());
  const p1Token = p1Login.data.token;

  const p2Email = `qa14_ravi_${Date.now()}@smarthospital.com`;
  await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ravi Kumar', email: p2Email, password: 'password123', role: 'PATIENT', phone: '9876543211', gender: 'MALE', age: 32 })
  });
  const p2Login = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: p2Email, password: 'password123' })
  }).then(r => r.json());
  const p2Token = p2Login.data.token;

  // 2. Select fresh available time slot (09:00:00)
  const targetTime = '09:00:00';

  // 3. Fire Concurrent Requests using Promise.all()
  console.log(`Firing simultaneous booking requests for Doctor=${doctorId}, Date=${testDate}, Time=${targetTime}...`);

  const req1Promise = fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${p1Token}` },
    body: JSON.stringify({ doctorId: doctorId, appointmentDate: testDate, startTime: targetTime, reason: 'Concurrent Booking Request A' })
  }).then(async r => ({ status: r.status, ok: r.ok, json: await r.json() }));

  const req2Promise = fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${p2Token}` },
    body: JSON.stringify({ doctorId: doctorId, appointmentDate: testDate, startTime: targetTime, reason: 'Concurrent Booking Request B' })
  }).then(async r => ({ status: r.status, ok: r.ok, json: await r.json() }));

  const [res1, res2] = await Promise.all([req1Promise, req2Promise]);

  console.log("Request A Result:", { status: res1.status, success: res1.json.success, message: res1.json.message, apptId: res1.json.data?.id });
  console.log("Request B Result:", { status: res2.status, success: res2.json.success, message: res2.json.message, apptId: res2.json.data?.id });

  // 4. Verify Database Records for Doctor + Date + Time
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const adminToken = adminLogin.data.token;

  const apptsOnDate = await fetch(`${BASE_URL}/appointments?doctorId=${doctorId}&date=${testDate}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());

  const matchingApptsInDb = (apptsOnDate.data || []).filter(a => a.startTime === targetTime && a.status !== 'CANCELLED');

  const successes = [res1, res2].filter(r => r.ok && r.json.success);
  const failures = [res1, res2].filter(r => !r.ok || !r.json.success);

  console.log("\n=== CONCURRENT DOUBLE-BOOKING QA RESULTS ===");
  console.log(JSON.stringify({
    totalConcurrentRequests: 2,
    successfulBookings: successes.length,
    rejectedBookings: failures.length,
    rejectionHttpStatus: failures[0]?.status,
    rejectionMessage: failures[0]?.json.message,
    matchingActiveApptsInDatabase: matchingApptsInDb.length,
    winningAppointmentId: successes[0]?.json.data?.id,
    winningPatientName: successes[0]?.json.data?.patientName,
    exactOneApptInDb: matchingApptsInDb.length === 1
  }, null, 2));
}

runQaTest14();
