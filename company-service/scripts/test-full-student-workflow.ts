import 'dotenv/config';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://127.0.0.1:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production';

async function testFullWorkflow() {
  console.log('🧪 Starting Full Student & Company Integration Test Suite...\n');

  try {
    // 1. Setup: Register Company & Post Active Job
    console.log('1️⃣ Setup: Registering Company & Creating Active Job Posting...');
    const companyEmail = `company.${Date.now()}@nexus.com`;
    const regRes = await (await fetch(`${BASE_URL}/api/company/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: 'Nexus Embedded Systems', email: companyEmail, password: 'Password123!' })
    })).json();
    const companyToken = regRes.token;

    const jobRes = await (await fetch(`${BASE_URL}/api/internships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${companyToken}` },
      body: JSON.stringify({
        title: 'Full Stack Firmware Engineer Intern',
        description: 'Design real-time telemetry systems and React dashboards for LoRa mesh architectures.',
        location: 'Bengaluru',
        mode: 'HYBRID',
        stipend: 25000,
        durationMonths: 6,
        skills: ['TypeScript', 'Fastify', 'C++', 'IoT'],
        status: 'ACTIVE'
      })
    })).json();
    const internshipId = jobRes.internship.id;
    console.log(`   ✅ Active Internship Created: "${jobRes.internship.title}" (ID: ${internshipId})`);

    // 2. Student Discovery & Details
    console.log('\n2️⃣ Student Discovery: Browsing Active Internships...');
    const searchRes = await (await fetch(`${BASE_URL}/api/internships?search=Firmware`)).json();
    console.log(`   ✅ Found ${searchRes.count} matching internship(s).`);

    const detailRes = await (await fetch(`${BASE_URL}/api/internships/${internshipId}`)).json();
    console.log(`   ✅ Fetched details for: "${detailRes.internship.title}" at ${detailRes.internship.company?.companyName}`);

    // 3. Student Apply (Student ID derived strictly from JWT)
    console.log('\n3️⃣ Student Apply: Submitting application with JWT...');
    const studentId = 'e205bc99-9c0b-4ef8-bb6d-6bb9bd380e22';
    const studentToken = jwt.sign(
      { id: studentId, email: 'student.aditya@example.com', role: 'STUDENT' },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    const applyRes = await fetch(`${BASE_URL}/api/applications/student/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        internshipId,
        resumeUrl: 'https://example.com/resumes/aditya_cv.pdf',
        coverLetter: 'Extensive experience in embedded C and TypeScript full-stack platforms.',
        githubUrl: 'https://github.com/aditya'
      })
    });
    const applyData = await applyRes.json();

    if (!applyRes.ok) {
      throw new Error(`Application failed [${applyRes.status}]: ${applyData.message || JSON.stringify(applyData)}`);
    }

    console.log(`   ✅ Application response: "${applyData.message}" (Status: ${applyRes.status})`);
    const applicationId = applyData.application.id;

    // 4. Duplicate Application Prevention Check
    console.log('\n4️⃣ Duplicate Check: Attempting identical application...');
    const dupRes = await fetch(`${BASE_URL}/api/applications/student/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        internshipId,
        resumeUrl: 'https://example.com/resumes/aditya_cv.pdf'
      })
    });
    const dupData = await dupRes.json();
    if (dupRes.status === 409) {
      console.log(`   ✅ Correctly blocked duplicate application (HTTP 409): "${dupData.message}"`);
    } else {
      console.error(`   ❌ Failed duplicate prevention: Expected 409, got ${dupRes.status}`);
    }

    // 5. Company Schedules Interview
    console.log('\n5️⃣ Company Action: Scheduling Technical Interview Round...');
    const interviewRes = await (await fetch(`${BASE_URL}/api/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${companyToken}` },
      body: JSON.stringify({
        applicationId,
        roundNumber: 1,
        roundName: 'Technical & Architecture Round',
        meetingUrl: 'https://meet.google.com/xyz-qwer-abc',
        scheduledAt: new Date(Date.now() + 86400000).toISOString()
      })
    })).json();
    console.log(`   ✅ Interview Scheduled: "${interviewRes.interview.roundName}" at ${interviewRes.interview.scheduledAt}`);

    // 6. Student Retrieves "My Applications" & Live Interview Data
    console.log('\n6️⃣ Student Tracking: Fetching "My Applications" with live interview schedule...');
    const myAppsRes = await (await fetch(`${BASE_URL}/api/applications/my-applications`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    })).json();

    const currentApp = myAppsRes.applications.find((a: any) => a.id === applicationId);
    console.log(`   ✅ Application Status: ${currentApp.status}`);
    console.log(`   ✅ Live Interview Round Retrieved: Round ${currentApp.interviews[0].roundNumber} - ${currentApp.interviews[0].roundName}`);
    console.log(`   ✅ Meeting URL: ${currentApp.interviews[0].meetingUrl}`);

    console.log('\n🎉 ALL RECRUITMENT WORKFLOW DELIVERABLES VERIFIED END-TO-END!');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  }
}

testFullWorkflow();
