async function testRebooking() {
  const BASE_URL = 'http://localhost:8080/api';

  console.log('--- STEP 1: Login as Patient ---');
  const patLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'patient@gmail.com', password: '12345678' }),
  });
  const patData = await patLoginRes.json();
  const patToken = patData.data.token;
  console.log('Patient Logged In successfully.');

  console.log('--- STEP 2: Fetch Active Appointments ---');
  const aptsRes = await fetch(`${BASE_URL}/appointments/mine`, {
    headers: { Authorization: `Bearer ${patToken}` },
  });
  const aptsData = await aptsRes.json();
  const apts = aptsData.data || [];
  console.log(`Found ${apts.length} appointments for patient.`);

  const activeApt = apts.find((a) => a.status === 'CONFIRMED' || a.status === 'PENDING') || apts[0];
  if (!activeApt) {
    console.log('No appointment available to test rebooking.');
    return;
  }

  console.log('Original Appointment ID:', activeApt.id, 'Doctor:', activeApt.doctorName, 'Status:', activeApt.status);

  console.log('--- STEP 3: Perform Free Rebooking (Reschedule) ---');
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const reschedulePayload = {
    newDate: tomorrowStr,
    newStartTime: '11:00',
    newDoctorId: activeApt.doctorId,
    reason: 'Unable to reach hospital for original slot on time. Free rebooking requested.',
  };

  const rebookRes = await fetch(`${BASE_URL}/appointments/${activeApt.id}/reschedule`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patToken}`,
    },
    body: JSON.stringify(reschedulePayload),
  });

  const rebookData = await rebookRes.json();
  console.log('Rebook Response Status:', rebookRes.status);
  console.log('New Rebooked Appointment Data:', rebookData.data);
}

testRebooking();
