// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest10() {
  console.log("=== STARTING QA TEST 10: Admin Department and Doctor Management ===");

  // 1. Setup Admin Token
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const adminToken = adminLogin.data.token;

  // Step 2: Create Department "Dermatology QA"
  const deptNameStr = `Dermatology QA ${Date.now()}`;
  const deptPayload = {
    name: deptNameStr,
    description: 'QA test department for skin and dermatology'
  };

  const createDeptRes = await fetch(`${BASE_URL}/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify(deptPayload)
  }).then(r => r.json());

  const department = createDeptRes.data;
  console.log(`Department Created: ID=${department?.id}, Name=${department?.name}`);

  // Test duplicate department creation
  const dupDeptRes = await fetch(`${BASE_URL}/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify(deptPayload)
  });
  const dupDeptText = await dupDeptRes.text();

  // Step 3: Create Doctor "Dr. QA Test" under "Dermatology QA"
  const docEmail = `dr_qa_${Date.now()}@smarthospital.com`;
  const docPayload = {
    doctorName: 'Dr. QA Test',
    email: docEmail,
    password: 'password123',
    specialization: 'Dermatology',
    departmentId: department.id,
    qualification: 'MD Dermatology',
    experience: 8,
    phone: '9876543999',
    consultationFee: 500,
    averageConsultationTime: 20
  };

  const createDocRes = await fetch(`${BASE_URL}/doctors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify(docPayload)
  }).then(r => r.json());

  const doctor = createDocRes.data;
  console.log(`Doctor Created: ID=${doctor.id}, Name=${doctor.doctorName}, DeptID=${doctor.departmentId}, DeptName=${doctor.departmentName}`);

  // Test duplicate doctor creation (same email)
  const dupDocRes = await fetch(`${BASE_URL}/doctors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify(docPayload)
  });
  const dupDocText = await dupDocRes.text();

  // Step 4: Verify Admin View
  const allDepts = await fetch(`${BASE_URL}/departments/all`, { headers: { 'Authorization': `Bearer ${adminToken}` } }).then(r => r.json());
  const allDocs = await fetch(`${BASE_URL}/doctors`, { headers: { 'Authorization': `Bearer ${adminToken}` } }).then(r => r.json());

  // Step 5: Verify Public/Patient View
  const publicDepts = await fetch(`${BASE_URL}/departments`).then(r => r.json());
  const publicDocsInDept = await fetch(`${BASE_URL}/doctors?departmentId=${department.id}`).then(r => r.json());

  // Step 6: Verify Slots Availability as Patient
  const todayStr = new Date().toISOString().split('T')[0];
  const slotsRes = await fetch(`${BASE_URL}/doctors/${doctor.id}/slots?date=${todayStr}`).then(r => r.json());

  console.log("\n=== CROSS-MODULE INTEGRITY VERIFICATION ===");
  console.log(JSON.stringify({
    departmentCreatedSuccess: createDeptRes.success,
    departmentId: department?.id,
    departmentName: department?.name,
    duplicateDepartmentPrevented: !dupDeptRes.ok,
    doctorCreatedSuccess: createDocRes.success,
    doctorId: doctor?.id,
    doctorDepartmentMappingMatch: doctor?.departmentId === department?.id,
    duplicateDoctorPrevented: !dupDocRes.ok,
    publicDeptVisible: (publicDepts.data || []).some(d => d.id === department?.id),
    patientDoctorUnderDeptVisible: (publicDocsInDept.data || []).some(d => d.id === doctor?.id),
    availableSlotsGenerated: (slotsRes.data || []).length > 0
  }, null, 2));
}

runQaTest10();
