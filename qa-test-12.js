// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest12() {
  console.log("=== STARTING QA TEST 12: Admin Deactivation and Data Integrity ===");

  // 1. Setup Admin Token
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const adminToken = adminLogin.data.token;

  // Create unique QA Doctor for deactivation test
  const deptRes = await fetch(`${BASE_URL}/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ name: `Deact QA Dept ${Date.now()}`, description: 'QA Deactivation Dept' })
  }).then(r => r.json());
  const deptId = deptRes.data.id;

  const docEmail = `dr_deact_${Date.now()}@smarthospital.com`;
  const docRes = await fetch(`${BASE_URL}/doctors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      doctorName: 'Dr. Deactivation QA',
      email: docEmail,
      password: 'password123',
      specialization: 'Dermatology',
      departmentId: deptId,
      qualification: 'MBBS',
      experience: 5,
      phone: '9876543888',
      consultationFee: 400
    })
  }).then(r => r.json());
  const docId = docRes.data.id;

  // Create Patient & Baseline Appointment + Consultation for Dr. Deactivation QA
  const pEmail = `qa12_patient_${Date.now()}@smarthospital.com`;
  await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Deact Test Patient', email: pEmail, password: 'password123', role: 'PATIENT', phone: '9876543887', gender: 'FEMALE', age: 28 })
  });

  const pLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: pEmail, password: 'password123' })
  }).then(r => r.json());
  const pToken = pLogin.data.token;

  const todayStr = new Date().toISOString().split('T')[0];
  const apptRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pToken}` },
    body: JSON.stringify({ doctorId: docId, appointmentDate: todayStr, startTime: '10:00:00', reason: 'Pre-Deactivation Appointment' })
  }).then(r => r.json());
  const apptId = apptRes.data.id;

  // Save consultation
  const docLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: docEmail, password: 'password123' })
  }).then(r => r.json());
  const targetDocToken = docLogin.data.token;

  const consultRes = await fetch(`${BASE_URL}/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${targetDocToken}` },
    body: JSON.stringify({ appointmentId: apptId, doctorId: docId, diagnosis: 'Skin Rash - QA Test', prescription: 'Topical Cream' })
  }).then(r => r.json());
  const consultId = consultRes.data.id;

  // Step 2: Admin Deactivates Doctor
  const deactRes = await fetch(`${BASE_URL}/doctors/${docId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());
  console.log(`Deactivation Request Result: ${deactRes.message}`);

  // Step 3 & 4: Patient visibility & new booking attempt
  const availDocs = await fetch(`${BASE_URL}/doctors/available`).then(r => r.json());
  const isDocInAvailableList = (availDocs.data || []).some(d => d.id === docId);

  const invalidBookRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pToken}` },
    body: JSON.stringify({ doctorId: docId, appointmentDate: todayStr, startTime: '11:00:00', reason: 'Post-Deactivation Booking' })
  });

  // Step 5 & 6: Verify Existing Appointment & Patient Consultation History
  const checkAppt = await fetch(`${BASE_URL}/appointments/${apptId}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());

  const pProfile = await fetch(`${BASE_URL}/patients/me`, { headers: { 'Authorization': `Bearer ${pToken}` } }).then(r => r.json());
  const pConsults = await fetch(`${BASE_URL}/consultations/patient/${pProfile.data.id}`, { headers: { 'Authorization': `Bearer ${pToken}` } }).then(r => r.json());

  // Step 7: Verify Unrelated Active Doctor (Dr. Arjun Mehta)
  const unrelatedDoc = await fetch(`${BASE_URL}/doctors/6abab82f336aed31d4c3732e`).then(r => r.json());

  console.log("\n=== DEACTIVATION QA VERIFICATION RESULTS ===");
  console.log(JSON.stringify({
    doctorId: docId,
    deactivationSuccess: deactRes.success,
    doctorInAvailableList: isDocInAvailableList,
    newBookingToDeactivatedDocBlocked: !invalidBookRes.ok,
    newBookingHttpStatus: invalidBookRes.status,
    existingApptPreserved: checkAppt.data?.id === apptId,
    existingApptDoctorIdUnchanged: checkAppt.data?.doctorId === docId,
    historicalConsultationPreserved: (pConsults.data || []).some(c => c.id === consultId),
    unrelatedDoctorRemainsAvailable: unrelatedDoc.data?.isAvailable ?? true
  }, null, 2));
}

runQaTest12();
