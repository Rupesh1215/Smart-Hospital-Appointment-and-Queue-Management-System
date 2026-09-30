// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest6() {
  console.log("=== STARTING QA TEST 6: Consultation Completion and Patient History ===");

  // 1. Setup Admin Token & Doctor Token
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

  // 2. Setup Patient (Arun Kumar) & Book Appointment for today
  const todayStr = new Date().toISOString().split('T')[0];
  const patientEmail = `qa6_arun_${Date.now()}@smarthospital.com`;
  
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

  const bookRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientToken}` },
    body: JSON.stringify({
      doctorId: doctorId,
      appointmentDate: todayStr,
      startTime: availableSlot.startTime,
      reason: 'QA Test 6 - Consultation Test'
    })
  }).then(r => r.json());

  const apptId = bookRes.data.id;
  console.log(`Appointment Created: ID=${apptId}`);

  // Step 1: Check In -> Call Next -> Start Consultation
  const checkInRes = await fetch(`${BASE_URL}/queues/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ appointmentId: apptId })
  }).then(r => r.json());
  const queueEntry = checkInRes.data;

  const callNextRes = await fetch(`${BASE_URL}/queues/call-next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
    body: JSON.stringify({ doctorId: doctorId })
  }).then(r => r.json());
  const activeQueueId = callNextRes.data ? callNextRes.data.id : queueEntry.id;

  await fetch(`${BASE_URL}/queues/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
    body: JSON.stringify({ queueId: activeQueueId })
  });

  // Step 2 & 3: Save Consultation Details
  const consultData = {
    appointmentId: apptId,
    doctorId: doctorId,
    patientId: patientId,
    diagnosis: 'Acute Arrhythmia - Stable',
    prescription: 'Aspirin 75mg once daily, Metoprolol 25mg twice daily',
    notes: 'Patient responded well to initial examination. Advised 2 weeks follow-up.',
    durationMinutes: 15
  };

  const saveConsultRes = await fetch(`${BASE_URL}/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
    body: JSON.stringify(consultData)
  }).then(r => r.json());

  console.log("Save Consultation Result:", saveConsultRes.success ? "SUCCESS" : "FAIL");
  const consultId = saveConsultRes.data?.id;

  // Step 4: Verify saved consultation before completion
  const consultFetchBefore = await fetch(`${BASE_URL}/consultations/appointment/${apptId}`, {
    headers: { 'Authorization': `Bearer ${docToken}` }
  }).then(r => r.json());

  // Step 5: Doctor completes consultation via Queue Service
  const completeRes = await fetch(`${BASE_URL}/queues/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
    body: JSON.stringify({ queueId: activeQueueId })
  }).then(r => r.json());

  // Step 6: Verify Patient History & Queue status
  const patientProfile = await fetch(`${BASE_URL}/patients/me`, {
    headers: { 'Authorization': `Bearer ${patientToken}` }
  }).then(r => r.json());
  const actualPatientId = patientProfile.data ? patientProfile.data.id : patientId;

  const patientConsults = await fetch(`${BASE_URL}/consultations/patient/${actualPatientId}`, {
    headers: { 'Authorization': `Bearer ${patientToken}` }
  }).then(r => r.json());

  const patientAppts = await fetch(`${BASE_URL}/appointments/mine`, {
    headers: { 'Authorization': `Bearer ${patientToken}` }
  }).then(r => r.json());

  const activeQueueCheck = await fetch(`${BASE_URL}/queues/patient/me`, {
    headers: { 'Authorization': `Bearer ${patientToken}` }
  }).then(r => r.json());

  console.log("\n=== CONSULTATION & HISTORY VERIFICATION ===");
  console.log(JSON.stringify({
    consultationSaved: saveConsultRes.success,
    consultationId: consultId,
    diagnosisPersisted: consultFetchBefore.data?.diagnosis === consultData.diagnosis,
    prescriptionPersisted: consultFetchBefore.data?.prescription === consultData.prescription,
    appointmentStatusAfterComplete: patientAppts.data[0]?.status,
    patientHistoryCount: (patientConsults.data || []).length,
    patientHistoryDiagnosis: (patientConsults.data || [])[0]?.diagnosis,
    patientActiveQueueStatus: activeQueueCheck.data?.status || 'NO_ACTIVE_QUEUE'
  }, null, 2));
}

runQaTest6();
