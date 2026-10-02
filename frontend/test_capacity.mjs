async function testCapacitySystem() {
  const BASE_URL = 'http://localhost:8080/api';

  console.log('--- STEP 1: Login as Doctor ---');
  const docLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'doctor@gmail.com', password: '12345678' }),
  });
  const docData = await docLoginRes.json();
  const docToken = docData.data.token;
  console.log('Doctor Logged In.');

  console.log('--- STEP 2: Fetch Doctor Profile ---');
  const docProfileRes = await fetch(`${BASE_URL}/doctors/me`, {
    headers: { Authorization: `Bearer ${docToken}` },
  });
  const docProfile = (await docProfileRes.json()).data;
  console.log('Doctor ID:', docProfile.id, 'Doctor Name:', docProfile.doctorName);

  console.log('--- STEP 3: Doctor Submits Extra Capacity Request ---');
  const reqRes = await fetch(`${BASE_URL}/capacity/request?doctorId=${docProfile.id}&extraSlots=5&message=Willing+to+accept+5+extra+walk-in+patients+today`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${docToken}` },
  });
  const reqData = await reqRes.json();
  console.log('Request Status:', reqRes.status, 'Created Request ID:', reqData.data?.id);

  console.log('--- STEP 4: Login as Receptionist ---');
  const recLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'receptionist@gmail.com', password: '12345678' }),
  });
  const recData = await recLoginRes.json();
  const recToken = recData.data.token;
  console.log('Receptionist Logged In.');

  console.log('--- STEP 5: Receptionist Fetches Pending Requests ---');
  const allReqsRes = await fetch(`${BASE_URL}/capacity/requests`, {
    headers: { Authorization: `Bearer ${recToken}` },
  });
  const allReqs = (await allReqsRes.json()).data;
  console.log(`Found ${allReqs.length} total capacity requests.`);

  const targetReq = allReqs.find((r) => r.id === reqData.data?.id);
  if (targetReq) {
    console.log('--- STEP 6: Receptionist Approves Extra Capacity Request ---');
    const approveRes = await fetch(`${BASE_URL}/capacity/requests/${targetReq.id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${recToken}` },
    });
    const approvedData = await approveRes.json();
    console.log('Approved Request Status:', approvedData.data?.status);
  }

  console.log('--- STEP 7: Receptionist Adjusts Online vs Offline Slot Allocation ---');
  const todayStr = new Date().toISOString().split('T')[0];
  const updateCapRes = await fetch(`${BASE_URL}/capacity/doctor/${docProfile.id}?date=${todayStr}&onlineLimit=25&offlineLimit=15`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${recToken}` },
  });
  const updatedCapData = await updateCapRes.json();
  console.log('Updated Slot Config:', updatedCapData.data);

  console.log('--- STEP 8: Fetch Final Capacity Metrics ---');
  const capMetricsRes = await fetch(`${BASE_URL}/capacity/doctor/${docProfile.id}?date=${todayStr}`, {
    headers: { Authorization: `Bearer ${recToken}` },
  });
  const metrics = (await capMetricsRes.json()).data;
  console.log('Final Doctor Capacity Metrics:', metrics);
}

testCapacitySystem();
