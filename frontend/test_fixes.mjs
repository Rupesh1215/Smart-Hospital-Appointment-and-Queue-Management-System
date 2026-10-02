async function testFixes() {
  const BASE_URL = 'http://localhost:8080/api';

  console.log('--- TEST 1: Check Doctor Ratings (range 2.5 to 4.5) ---');
  const docRes = await fetch(`${BASE_URL}/doctors`);
  const doctors = (await docRes.json()).data;
  console.log(`Retrieved ${doctors.length} doctors.`);
  const invalidRatings = doctors.filter((d) => d.rating > 4.5 || d.rating < 2.5 || d.rating === 5.0);
  if (invalidRatings.length > 0) {
    console.error('FAIL: Found doctors outside 2.5 - 4.5 rating range:', invalidRatings.map(d => ({ name: d.doctorName, rating: d.rating })));
  } else {
    console.log('SUCCESS: All doctor ratings are within 2.5 to 4.5 range!', doctors.slice(0, 5).map(d => ({ name: d.doctorName, rating: d.rating })));
  }

  console.log('--- TEST 2: Login as Doctor & Test Check-In Access ---');
  const docLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'doctor@gmail.com', password: '12345678' }),
  });
  const docToken = (await docLoginRes.json()).data.token;

  console.log('--- TEST 3: Login as Patient & Book Appointment ---');
  const patLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'patient@gmail.com', password: '12345678' }),
  });
  const patToken = (await patLoginRes.json()).data.token;

  const todayStr = new Date().toISOString().split('T')[0];
  const targetDoc = doctors[0];

  const bookRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patToken}` },
    body: JSON.stringify({
      doctorId: targetDoc.id,
      departmentId: targetDoc.departmentId,
      appointmentDate: todayStr,
      startTime: '11:30:00',
      reason: 'Regular Checkup',
      bookingType: 'ONLINE',
    }),
  });
  const bookData = await bookRes.json();
  console.log('Patient Booking HTTP Status:', bookRes.status);
  console.log('Booking Result:', JSON.stringify(bookData, null, 2));

  if (bookData.data?.id) {
    const aptId = bookData.data.id;
    console.log('--- TEST 4: Doctor Checks In Patient ---');
    const ciRes = await fetch(`${BASE_URL}/queues/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${docToken}` },
      body: JSON.stringify({ appointmentId: aptId }),
    });
    const ciData = await ciRes.json();
    console.log('Doctor Check-In HTTP Status:', ciRes.status);
    console.log('Doctor Check-In Result:', ciData.message || ciData);
  }
}

testFixes();
