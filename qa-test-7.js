// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest7() {
  console.log("=== STARTING QA TEST 7: Receptionist Appointment Booking and Data Consistency ===");

  // 1. Setup Receptionist Token & Doctor Info
  const recepLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'receptionist@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const recepToken = recepLogin.data.token;

  const doctorId = '6abab82f336aed31d4c3732e'; // Dr. Arjun Mehta

  // 2. Setup Patient (Ravi Kumar)
  const patientEmail = `qa7_ravi_${Date.now()}@smarthospital.com`;
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
  const patientUserId = pLogin.data.id || pLogin.data.userId;

  // Get patient profile ID
  const pProfile = await fetch(`${BASE_URL}/patients/me`, {
    headers: { 'Authorization': `Bearer ${patientToken}` }
  }).then(r => r.json());
  const patientProfileId = pProfile.data.id;

  // 3. Receptionist selects available slot on future date (2026-10-26)
  const testDate = '2026-10-26';
  const slotsRes = await fetch(`${BASE_URL}/doctors/${doctorId}/slots?date=${testDate}`).then(r => r.json());
  const availableSlot = (slotsRes.data || []).find(s => s.isAvailable ?? s.available);

  // 4. Receptionist Books Appointment for Ravi Kumar
  const bookPayload = {
    patientId: patientProfileId,
    doctorId: doctorId,
    appointmentDate: testDate,
    startTime: availableSlot.startTime,
    reason: 'QA Test 7 - Receptionist Booking'
  };

  const bookRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${recepToken}` },
    body: JSON.stringify(bookPayload)
  }).then(r => r.json());

  const appt = bookRes.data;
  const apptId = appt.id;

  console.log(`Receptionist Booked Appointment: ID=${apptId}, Number=${appt.appointmentNumber}, Time=${appt.startTime}`);

  // 5. Cross-Module View Verification
  // A. Receptionist View (List all appointments for doctor on testDate)
  const recepView = await fetch(`${BASE_URL}/appointments?doctorId=${doctorId}&date=${testDate}`, {
    headers: { 'Authorization': `Bearer ${recepToken}` }
  }).then(r => r.json());

  // B. Patient View (/mine)
  const patientView = await fetch(`${BASE_URL}/appointments/mine`, {
    headers: { 'Authorization': `Bearer ${patientToken}` }
  }).then(r => r.json());

  // C. Doctor View (doctor@gmail.com login)
  const docLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'doctor@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const docToken = docLogin.data.token;

  const docView = await fetch(`${BASE_URL}/appointments/mine?date=${testDate}`, {
    headers: { 'Authorization': `Bearer ${docToken}` }
  }).then(r => r.json());

  // Check counts & single record integrity
  const recepApptMatch = (recepView.data || []).filter(a => a.id === apptId);
  const patientApptMatch = (patientView.data || []).filter(a => a.id === apptId);
  const docApptMatch = (docView.data || []).filter(a => a.id === apptId);

  console.log("\n=== CROSS-MODULE VERIFICATION RESULTS ===");
  console.log(JSON.stringify({
    appointmentId: apptId,
    patientName: appt.patientName,
    doctorName: appt.doctorName,
    date: appt.appointmentDate,
    time: appt.startTime,
    status: appt.status,
    receptionistViewCountForAppt: recepApptMatch.length,
    patientViewCountForAppt: patientApptMatch.length,
    doctorViewCountForAppt: docApptMatch.length,
    totalDateApptsInDoctorView: (docView.data || []).length
  }, null, 2));
}

runQaTest7();
