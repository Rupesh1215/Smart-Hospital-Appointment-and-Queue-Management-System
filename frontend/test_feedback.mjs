async function testFeedback() {
  const BASE_URL = 'http://localhost:8080/api';

  console.log('--- STEP 1: Login as Patient ---');
  const patLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'patient@gmail.com', password: '12345678' }),
  });
  const patData = await patLoginRes.json();
  const patToken = patData.data.token;
  console.log('Patient Login Success Token retrieved.');

  console.log('--- STEP 2: Fetch Patient Appointments ---');
  const aptsRes = await fetch(`${BASE_URL}/appointments/mine`, {
    headers: { Authorization: `Bearer ${patToken}` },
  });
  const aptsData = await aptsRes.json();
  const apts = aptsData.data || [];
  console.log(`Found ${apts.length} appointments for patient.`);

  let completedApt = apts.find((a) => a.status === 'COMPLETED');
  if (!completedApt && apts.length > 0) {
    const targetApt = apts[0];
    console.log(`Marking appointment ${targetApt.id} as COMPLETED for testing...`);
    const updateRes = await fetch(`${BASE_URL}/appointments/${targetApt.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patToken}`,
      },
      body: JSON.stringify({ status: 'COMPLETED', notes: 'Consultation finished' }),
    });
    const updated = await updateRes.json();
    completedApt = updated.data;
  }

  if (!completedApt) {
    console.log('No appointment found to test feedback.');
    return;
  }

  console.log('Target Completed Appointment:', completedApt.id, 'Doctor:', completedApt.doctorName);

  console.log('--- STEP 3: Check Pending Feedbacks ---');
  const pendingRes = await fetch(`${BASE_URL}/feedbacks/pending`, {
    headers: { Authorization: `Bearer ${patToken}` },
  });
  const pendingData = await pendingRes.json();
  console.log('Pending feedback count:', pendingData.data?.length);

  const pendingApt = pendingData.data && pendingData.data.length > 0 ? pendingData.data[0] : completedApt;

  console.log('--- STEP 4: Submit 5-Star Feedback ---');
  const fbPayload = {
    appointmentId: pendingApt.id,
    doctorId: pendingApt.doctorId,
    rating: 5,
    emoji: '😄',
    comment: 'Dr. ' + (pendingApt.doctorName || 'Doctor') + ' was extremely helpful and empathetic!',
  };

  const fbSubmitRes = await fetch(`${BASE_URL}/feedbacks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patToken}`,
    },
    body: JSON.stringify(fbPayload),
  });

  const rawTxt = await fbSubmitRes.text();
  console.log('Feedback Submission Status:', fbSubmitRes.status);
  console.log('Raw Submission Response:', rawTxt);

  console.log('--- STEP 5: Verify Doctor Profile & Feedback List ---');
  const docRes = await fetch(`${BASE_URL}/feedbacks/doctor/${pendingApt.doctorId}`);
  const docFbData = await docRes.json();
  console.log('Doctor Feedbacks List:', docFbData.data);
}

testFeedback();
