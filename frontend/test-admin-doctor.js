// using native fetch

async function test() {
  console.log("Adding doctor...");
  const adminLogin = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: 'password123' })
  });
  if (!adminLogin.ok) {
    const adminLoginAlt = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: 'password' })
    });
    if (!adminLoginAlt.ok) {
        const adminLoginAlt2 = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@gmail.com', password: '12345678' })
        });
        var adminRes = await adminLoginAlt2.json();
    } else {
        var adminRes = await adminLoginAlt.json();
    }
  } else {
    var adminRes = await adminLogin.json();
  }

  const token = adminRes.data.token;
  console.log("Token:", token);

  console.log("Fetching departments...");
  const deptRes = await fetch('http://localhost:8080/api/departments').then(r => r.json());
  const deptId = deptRes.data[0].id;

  const payload = {
    doctorName: 'Test Add Doc',
    email: 'testadddoc@smarthospital.com',
    password: 'password123',
    specialization: 'General Physician',
    departmentId: deptId,
    qualification: 'MBBS',
    experience: 5,
    phone: '9999999999',
    consultationFee: 50,
    maxPatientsPerDay: 20,
    averageConsultationTime: 20
  };

  const addRes = await fetch('http://localhost:8080/api/doctors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload)
  });

  const bodyResponse = await addRes.text();
  console.log("Add response status:", addRes.status, bodyResponse);

  if (addRes.ok) {
    const json = JSON.parse(bodyResponse);
    const docId = json.data.id;
    console.log("Deleting doctor:", docId);
    
    const delRes = await fetch(`http://localhost:8080/api/doctors/${docId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log("Delete response status:", delRes.status, await delRes.text());
  }
}

test();
