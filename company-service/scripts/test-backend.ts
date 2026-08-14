const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting ATS Backend Test...\n');
  try {
    const health = await (await fetch(`${BASE_URL}/health`)).json();
    console.log('1️⃣ Health Check:', health);

    const email = `test.${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/company/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: 'Acme AI Systems', email, password: 'Password123!' })
    });
    const reg = await regRes.json();
    console.log('2️⃣ Register Company:', reg.message);
    const token = reg.token;

    const jobRes = await fetch(`${BASE_URL}/api/internships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'IoT Engineer Intern', description: 'ESP32 & Raspberry Pi hardware design', location: 'Bengaluru', skills: ['IoT', 'Embedded C'], status: 'ACTIVE' })
    });
    const job = await jobRes.json();
    console.log('3️⃣ Create Job:', job.internship.title);

    const appRes = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internshipId: job.internship.id, studentId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', resumeUrl: 'https://example.com/cv.pdf' })
    });
    const app = await appRes.json();
    console.log('4️⃣ Submit Application:', app.message);

    const dashRes = await fetch(`${BASE_URL}/api/company/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dash = await dashRes.json();
    console.log('5️⃣ Dashboard Stats:', dash.stats);

    console.log('\n🎉 ALL CORE ENDPOINTS TESTED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

runTests();
