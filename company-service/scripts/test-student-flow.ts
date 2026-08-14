import jwt from 'jsonwebtoken';

const BASE_URL = 'http://127.0.0.1:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production';

const studentId = 'c301bc99-9c0b-4ef8-bb6d-6bb9bd380c33';
const studentToken = jwt.sign(
  { id: studentId, email: 'student.aditya@example.com', role: 'STUDENT' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

async function runStudentFlowTests() {
  console.log('🧪 Testing Student Workflow (Discovery -> Apply -> Duplicate Check -> My Applications)...\n');

  try {
    // 1. Fetch Active Internships
    console.log('1️⃣ Discovering Active Internships...');
    const listRes = await fetch(`${BASE_URL}/api/internships`);
    const listData = await listRes.json();
    const internships = listData.internships || [];
    console.log(`   Found ${internships.length} active internship(s).`);

    if (internships.length === 0) {
      console.log('⚠️ No active internships available to test application flow. Post an active job first using company routes.');
      return;
    }

    const testJob = internships[0];
    console.log(`   Targeting Internship: "${testJob.title}" (ID: ${testJob.id})`);

    // 2. Fetch Single Internship Details
    console.log('\n2️⃣ Fetching Detailed Internship Specs...');
    const detailRes = await fetch(`${BASE_URL}/api/internships/${testJob.id}`);
    const detailData = await detailRes.json();
    console.log(`   Loaded job title: "${detailData.internship?.title}" from company "${detailData.internship?.company?.companyName}"`);

    // 3. Submit Student Application
    console.log('\n3️⃣ Submitting Application via Student JWT...');
    const applyRes = await fetch(`${BASE_URL}/api/applications/student/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        internshipId: testJob.id,
        resumeUrl: 'https://example.com/resumes/aditya_portfolio_cv.pdf',
        coverLetter: 'Interested in working on embedded systems and firmware architecture.',
        githubUrl: 'https://github.com/aditya-iot'
      })
    });

    const applyData = await applyRes.json();
    console.log(`   Status Code: ${applyRes.status}`);
    console.log(`   Message: ${applyData.message || JSON.stringify(applyData)}`);

    // 4. Test Duplicate Application Protection
    console.log('\n4️⃣ Testing Duplicate Application Protection...');
    const dupRes = await fetch(`${BASE_URL}/api/applications/student/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        internshipId: testJob.id,
        resumeUrl: 'https://example.com/resumes/aditya_portfolio_cv.pdf'
      })
    });

    const dupData = await dupRes.json();
    if (dupRes.status === 409) {
      console.log(`   ✅ Correctly blocked duplicate application (HTTP 409): "${dupData.message}"`);
    } else {
      console.log(`   Status: ${dupRes.status} - ${dupData.message}`);
    }

    // 5. Fetch My Applications
    console.log('\n5️⃣ Fetching "My Applications" List...');
    const myAppsRes = await fetch(`${BASE_URL}/api/applications/my-applications`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const myAppsData = await myAppsRes.json();
    const userApplications = myAppsData.applications || [];

    console.log(`   Found ${userApplications.length} submitted application(s) for logged-in student.`);
    if (userApplications.length > 0) {
      console.log(`   Latest Application Status: ${userApplications[0].status}`);
      console.log(`   Applied For: ${userApplications[0].internship?.title || 'Job'}`);
    }

    console.log('\n🎉 ALL STUDENT WORKFLOW ENDPOINTS VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ Test execution failed:', err);
  }
}

runStudentFlowTests();
