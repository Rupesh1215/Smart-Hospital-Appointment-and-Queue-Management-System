// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest11() {
  console.log("=== STARTING QA TEST 11: Admin Doctor Availability Management ===");

  // 1. Setup Admin Token & Doctor Info
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

  // Step 1: Record Current Availability
  const docOriginal = await fetch(`${BASE_URL}/doctors/${doctorId}`).then(r => r.json());
  const origStart = docOriginal.data.workingHoursStart;
  const origEnd = docOriginal.data.workingHoursEnd;
  console.log(`Original Doctor Schedule: ${origStart} - ${origEnd}`);

  // Step 2: Create Baseline Appointment at 09:00:00 on future date (2026-10-28)
  const testDate = '2026-10-28';
  const patientEmail = `qa11_ravi_${Date.now()}@smarthospital.com`;
  await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ravi Kumar', email: patientEmail, password: 'password123', role: 'PATIENT', phone: '9876543211', gender: 'MALE', age: 32 })
  });

  const pLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: patientEmail, password: 'password123' })
  }).then(r => r.json());
  const patientToken = pLogin.data.token;

  const baselineBookRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientToken}` },
    body: JSON.stringify({ doctorId: doctorId, appointmentDate: testDate, startTime: '09:00:00', reason: 'Baseline Appointment' })
  }).then(r => r.json());
  const baselineApptId = baselineBookRes.data.id;
  console.log(`Baseline Appointment Created: ID=${baselineApptId}, Time=09:00:00`);

  // Step 3: Admin Modifies Doctor Availability (Change workingHoursStart from 09:00 to 11:00)
  const updatePayload = {
    workingHoursStart: '11:00:00',
    workingHoursEnd: '17:00:00'
  };

  const updateRes = await fetch(`${BASE_URL}/doctors/${doctorId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify(updatePayload)
  }).then(r => r.json());

  console.log(`Schedule Updated Result: ${updateRes.success ? "SUCCESS" : "FAIL"}`);

  // Step 4 & 5: Verify New Availability & Patient Slot View
  const slotsRes = await fetch(`${BASE_URL}/doctors/${doctorId}/slots?date=${testDate}`).then(r => r.json());
  const slot9AM = (slotsRes.data || []).find(s => s.startTime === '09:00:00');

  // Step 6: Attempt Invalid Booking at 09:00 (outside new working hours 11:00-17:00)
  const invalidBookRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientToken}` },
    body: JSON.stringify({ doctorId: doctorId, appointmentDate: testDate, startTime: '09:00:00', reason: 'Invalid Slot Test' })
  });
  const invalidBookText = await invalidBookRes.text();

  // Step 7: Verify Baseline Appointment Preserved
  const baselineCheck = await fetch(`${BASE_URL}/appointments/${baselineApptId}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());

  // Restore Doctor Original Schedule
  await fetch(`${BASE_URL}/doctors/${doctorId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ workingHoursStart: origStart, workingHoursEnd: origEnd })
  });

  console.log("\n=== DOCTOR AVAILABILITY QA RESULTS ===");
  console.log(JSON.stringify({
    baselineApptId: baselineApptId,
    scheduleUpdateSaved: updateRes.success,
    slot9AMVisibleInSlots: !!slot9AM,
    slot9AMAvailableInSlots: slot9AM ? slot9AM.isAvailable : false,
    invalidBookingBackendRejected: !invalidBookRes.ok,
    invalidBookingStatus: invalidBookRes.status,
    baselineApptPreserved: baselineCheck.data?.id === baselineApptId,
    baselineApptStatus: baselineCheck.data?.status,
    baselineApptTime: baselineCheck.data?.startTime
  }, null, 2));
}

runQaTest11();
