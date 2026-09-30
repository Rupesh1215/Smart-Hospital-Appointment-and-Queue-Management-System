// Using native fetch

const BASE_URL = 'http://localhost:8080/api';

async function runQaTest4() {
  console.log("=== STARTING QA TEST 4: Doctor Working Hours and Availability ===");
  
  // 1. Get Doctor Schedule Before (Dr. Arjun Mehta or active doctor)
  const docsRes = await fetch(`${BASE_URL}/doctors`).then(r => r.json());
  const doctor = (docsRes.data || []).find(d => (d.doctorName || d.name || '').includes('Arjun Mehta')) || docsRes.data[0];
  const doctorId = doctor.id;
  const doctorName = doctor.doctorName || doctor.name;

  console.log(`Testing with Doctor: ${doctorName} (ID: ${doctorId})`);

  const origSchedule = {
    workingDays: doctor.workingDays,
    workingHoursStart: doctor.workingHoursStart,
    workingHoursEnd: doctor.workingHoursEnd,
    breakStart: doctor.breakStart,
    breakEnd: doctor.breakEnd,
    averageConsultationTime: doctor.averageConsultationTime
  };
  console.log("Original Doctor Schedule:", origSchedule);

  // 2. Check Patient-side slots before modification for a test date (2026-10-19 Monday)
  const testDate = '2026-10-19';
  const slotsBeforeRes = await fetch(`${BASE_URL}/doctors/${doctorId}/slots?date=${testDate}`).then(r => r.json());
  const slotsBefore = slotsBeforeRes.data || [];
  const timesBefore = slotsBefore.map(s => s.startTime);
  console.log(`Slots count before modification: ${slotsBefore.length} (${timesBefore[0]} to ${timesBefore[timesBefore.length - 1]})`);

  // 3. Login as Admin / Doctor to update doctor schedule
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: '12345678' })
  }).then(r => r.json());
  const adminToken = adminLogin.data.token;

  // Modify schedule: Change workingHoursEnd from 17:00:00 to 18:00:00
  const modifiedSchedule = {
    ...doctor,
    workingHoursEnd: '18:00:00'
  };

  const updateRes = await fetch(`${BASE_URL}/doctors/${doctorId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(modifiedSchedule)
  });
  const updateJson = await updateRes.json();
  console.log("Update schedule response status:", updateRes.status, updateJson.success ? "SUCCESS" : "FAIL");

  // 4. Check Patient-side slots AFTER schedule modification
  const slotsAfterRes = await fetch(`${BASE_URL}/doctors/${doctorId}/slots?date=${testDate}`).then(r => r.json());
  const slotsAfter = slotsAfterRes.data || [];
  const timesAfter = slotsAfter.map(s => s.startTime);
  console.log(`Slots count after modification: ${slotsAfter.length} (${timesAfter[0]} to ${timesAfter[timesAfter.length - 1]})`);

  const newSlotsFound = timesAfter.filter(t => t >= '17:00:00');
  console.log("Newly generated slots after schedule extension:", newSlotsFound);

  // 5. Restore Original Schedule
  const restoreRes = await fetch(`${BASE_URL}/doctors/${doctorId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(doctor)
  });
  const restoreJson = await restoreRes.json();
  console.log("Restore schedule response status:", restoreRes.status, restoreJson.success ? "RESTORED" : "FAIL");

  // 6. Verify existing appointments integrity
  const existingApptsRes = await fetch(`${BASE_URL}/appointments?doctorId=${doctorId}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }).then(r => r.json());
  const existingApptsCount = (existingApptsRes.data || []).length;

  console.log(JSON.stringify({
    origSchedule,
    modifiedWorkingHoursEnd: '18:00:00',
    slotsBeforeCount: slotsBefore.length,
    slotsAfterCount: slotsAfter.length,
    newSlotsFound,
    scheduleRestored: restoreJson.success,
    existingApptsCount
  }, null, 2));
}

runQaTest4();
