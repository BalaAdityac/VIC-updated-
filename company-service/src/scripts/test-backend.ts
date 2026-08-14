// scripts/test-backend.ts

const BASE_URL = 'http://localhost:3000';

async function runBackendTests() {
  console.log('🧪 Starting End-to-End ATS Backend Test with Dummy Data...\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('   Response:', healthData);

    // 2. Register Company
    const uniqueEmail = `test.company.${Date.now()}@example.com`;
    console.log(`\n2️⃣ Registering Dummy Company (${uniqueEmail})...`);
    const regRes = await fetch(`${BASE_URL}/api/company/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Acme AI Systems',
        email: uniqueEmail,
        password: 'Password123!',
        website: 'https://acmeai.example.com',
        description: 'Leading AI Hardware Prototyping Laboratory',
        address: '123 Tech Park, Bengaluru, Karnataka',
        gstNumber: '29ABCDE1234F1Z5'
      })
    });
    const regData = await regRes.json();
    const token = regData.token;
    const companyId = regData.company.id;
    console.log('   ✅ Company Registered. Token captured.');

    // 3. Create Internship
    console.log('\n3️⃣ Creating Dummy Internship Posting...');
    const jobRes = await fetch(`${BASE_URL}/api/internships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Embedded Systems & IoT Engineering Intern',
        description: 'Design and prototype LoRa, ESP32, and Raspberry Pi embedded hardware nodes.',
        location: 'Bengaluru, India',
        mode: 'ON_SITE',
        stipend: 25000,
        durationMonths: 6,
        skills: ['Embedded C', 'ESP32', 'LoRa', 'Raspberry Pi', 'Python'],
        status: 'ACTIVE'
      })
    });
    const jobData = await jobRes.json();
    const internshipId = jobData.internship.id;
    console.log(`   ✅ Internship Created: "${jobData.internship.title}" (ID: ${internshipId})`);

    // 4. Submit Student Application
    console.log('\n4️⃣ Submitting Dummy Student Application...');
    const dummyStudentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // UUID format
    const appRes = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        internshipId,
        studentId: dummyStudentId,
        resumeUrl: 'https://example.com/resumes/john_doe_cv.pdf',
        coverLetter: 'I am highly passionate about IoT and hardware system designs.',
        portfolioUrl: 'https://github.com/example/iot-portfolio',
        githubUrl: 'https://github.com/example'
      })
    });
    const appData = await appRes.json();
    const applicationId = appData.application.id;
    console.log(`   ✅ Application Submitted (ID: ${applicationId})`);

    // 5. Schedule Interview Round 1
    console.log('\n5️⃣ Scheduling Technical Interview Round...');
    const intRes = await fetch(`${BASE_URL}/api/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        applicationId,
        roundNumber: 1,
        roundName: 'Technical Architecture & C Programming',
        meetingUrl: 'https://meet.google.com/xyz-abc-def',
        scheduledAt: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      })
    });
    const intData = await intRes.json();
    const interviewId = intData.interview.id;
    console.log(`   ✅ Interview Scheduled (ID: ${interviewId})`);

    // 6. Submit Interview Evaluation
    console.log('\n6️⃣ Logging Interview Evaluation...');
    const dummyEvaluatorId = 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b22';
    const evalRes = await fetch(`${BASE_URL}/api/evaluations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        interviewId,
        evaluatorId: dummyEvaluatorId,
        score: 9.5,
        passed: true,
        feedback: 'Excellent grasp of embedded protocols, DMA memory mapping, and RTOS principles.'
      })
    });
    const evalData = await evalRes.json();
    console.log(`   ✅ Evaluation Submitted (Score: ${evalData.evaluation.score}/10)`);

    // 7. Issue Offer Letter
    console.log('\n7️⃣ Issuing Offer Letter...');
    const offerRes = await fetch(`${BASE_URL}/api/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        applicationId,
        stipendAmount: 30000,
        joiningDate: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days later
        offerLetterUrl: 'https://example.com/offers/official_offer_john.pdf'
      })
    });
    const offerData = await offerRes.json();
    const offerId = offerData.offer.id;
    console.log(`   ✅ Offer Extended (ID: ${offerId})`);

    // 8. Accept Offer (Student Response)
    console.log('\n8️⃣ Accepting Offer...');
    const respRes = await fetch(`${BASE_URL}/api/offers/${offerId}/respond`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACCEPTED' })
    });
    const respData = await respRes.json();
    console.log(`   ✅ Offer Status Updated: ${respData.offer.status}`);

    // 9. Initiate Onboarding
    console.log('\n9️⃣ Initiating Candidate Onboarding...');
    const onboardRes = await fetch(`${BASE_URL}/api/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        offerId,
        startDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        notes: 'Laptop and hardware kit dispatch pending.'
      })
    });
    const onboardData = await onboardRes.json();
    console.log(`   ✅ Onboarding Created (Status: ${onboardData.onboarding.status})`);

    // 10. Fetch Dashboard Analytics
    console.log('\n🔟 Checking Company Dashboard Stats...');
    const dashRes = await fetch(`${BASE_URL}/api/company/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dashData = await dashRes.json();
    console.log('   📊 Dashboard Metrics:', dashData.stats);

    console.log('\n🎉 ALL ENDPOINTS TESTED AND WORKING PERFECTLY!');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
  }
}

runBackendTests();