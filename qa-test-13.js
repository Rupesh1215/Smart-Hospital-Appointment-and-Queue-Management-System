// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest13() {
  console.log("=== STARTING QA TEST 13: Appointment Cancellation and Slot Reuse ===");

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

  // 2. Setup Patient 1 (Suresh Kumar) & Book Appointment for future date (2026-11-10 @ 10:00 AM)
  const testDate = '2026-11-10';
  const p1Email = `qa13_suresh_${Date.now()}@smarthospital.com`;
  await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Suresh Kumar', email: p1Email, password: 'password123', role: 'PATIENT', phone: '9876543212', gender: 'MALE', age: 35 })
  });

  const p1Login = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: p1Email, password: 'password123' })
  }).then(r => r.json());
  const p1Token = p1Login.data.token;

  // Step 1: Book Appointment
  const bookRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${p1Token}` },
    body: JSON.stringify({ doctorId: doctorId, appointmentDate: testDate, startTime: '10:00:00', reason: 'QA Test 13 Initial Booking' })
  }).then(r => r.json());
  const appt1Id = bookRes.data.id;
  console.log(`Original Appointment Created: ID=${appt1Id}, Status=${bookRes.data.status}`);

  // Check slot 10:00 is unavailable now
  const slotsBeforeCancel = await fetch(`${BASE_URL}/doctors/${doctorId}/slots?date=${testDate}`).then(r => r.json());
  const slot10Before = (slotsBeforeCancel.data || []).find(s => s.startTime === '10:00:00');

  // Step 3: Cancel Appointment by Suresh Kumar
  const cancelRes = await fetch(`${BASE_URL}/appointments/${appt1Id}/cancel?reason=QA+Test+Cancellation`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${p1Token}` }
  }).then(r => r.json());
  console.log(`Cancellation Result: Status=${cancelRes.data?.status}`);

  // Step 4, 5, 6: Cross-Module Cancelled Status Verification
  const p1View = await fetch(`${BASE_URL}/appointments/mine`, { headers: { 'Authorization': `Bearer ${p1Token}` } }).then(r => r.json());
  const docView = await fetch(`${BASE_URL}/appointments/mine?date=${testDate}`, { headers: { 'Authorization': `Bearer ${docToken}` } }).then(r => r.json());
  const recepView = await fetch(`${BASE_URL}/appointments?doctorId=${doctorId}&date=${testDate}`, { headers: { 'Authorization': `Bearer ${recepToken}` } }).then(r => r.json());

  // Step 7: Verify Slot Reuse - Query slots again for 10:00 AM
  const slotsAfterCancel = await fetch(`${BASE_URL}/doctors/${doctorId}/slots?date=${testDate}`).then(r => r.json());
  const slot10After = (slotsAfterCancel.data || []).find(s => s.startTime === '10:00:00');

  // Re-book slot with Patient 2 (Ravi Kumar)
  const p2Email = `qa13_ravi_${Date.now()}@smarthospital.com`;
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

  const rebookRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${p2Token}` },
    body: JSON.stringify({ doctorId: doctorId, appointmentDate: testDate, startTime: '10:00:00', reason: 'Rebooked Released Slot' })
  }).then(r => r.json());
  const appt2Id = rebookRes.data?.id;

  // Step 8: Verify Queue Integrity
  const adminQueue = await fetch(`${BASE_URL}/queues/today`, { headers: { 'Authorization': `Bearer ${adminToken}` } }).then(r => r.json());
  const activeQueueForCancelledAppt = (adminQueue.data || []).filter(q => q.appointmentId === appt1Id && q.status !== 'CANCELLED' && q.status !== 'COMPLETED');

  console.log("\n=== CANCELLATION & SLOT REUSE QA RESULTS ===");
  console.log(JSON.stringify({
    originalApptId: appt1Id,
    cancellationSuccess: cancelRes.success,
    cancelledStatusInPatientView: p1View.data[0]?.status,
    cancelledStatusInDoctorView: (docView.data || []).find(a => a.id === appt1Id)?.status,
    cancelledStatusInRecepView: (recepView.data || []).find(a => a.id === appt1Id)?.status,
    slot10BeforeCancelAvailable: slot10Before ? slot10Before.isAvailable : false,
    slot10AfterCancelAvailable: slot10After ? slot10After.isAvailable : false,
    rebookSuccess: rebookRes.success,
    newApptIdForRebookedSlot: appt2Id,
    rebookDifferentFromOriginalId: appt1Id !== appt2Id,
    noActiveQueueForCancelledAppt: activeQueueForCancelledAppt.length === 0
  }, null, 2));
}

runQaTest13();
