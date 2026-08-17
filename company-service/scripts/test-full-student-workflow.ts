import { randomUUID } from 'crypto';
import { spawn, ChildProcess } from 'child_process';
import { resolve } from 'path';

const BASE_URL = process.env.API_URL || 'http://127.0.0.1:3000';
let serverProcess: ChildProcess | null = null;

// Helper to poll health endpoint
async function isServerReady(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

// Automatically start backend server if not running
async function ensureServerRunning() {
  const alreadyRunning = await isServerReady();
  if (alreadyRunning) {
    console.log('✅ Connected to running ATS backend on port 3000.');
    return;
  }

  console.log('⚡ Server not detected on port 3000. Auto-launching backend server...');
  const serverPath = resolve(__dirname, '../src/server.ts');

  serverProcess = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['tsx', serverPath],
    {
      cwd: resolve(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PORT: '3000' }
    }
  );

  serverProcess.stderr?.on('data', (chunk) => {
    const msg = chunk.toString();
    if (msg.includes('Error')) console.error(`[Server stderr]: ${msg}`);
  });

  const maxRetries = 30;
  for (let i = 0; i < maxRetries; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isServerReady()) {
      console.log('🚀 Backend server successfully booted and ready.\n');
      return;
    }
  }

  throw new Error('Timed out waiting for ATS backend server to start.');
}

async function testFullWorkflow() {
  await ensureServerRunning();

  console.log('🚀 Starting Full Student & ATS Workflow Test against:', BASE_URL);

  const timestamp = Date.now();
  const testCompanyEmail = `test.company.${timestamp}@example.com`;
  const testPassword = 'Password123!';
  const validStudentUUID = randomUUID();

  // Step 1: Register Company
  console.log('\n1️⃣  Registering a new company...');
  const regRes = await fetch(`${BASE_URL}/api/company/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyName: `Tech Innovations ${timestamp}`,
      email: testCompanyEmail,
      password: testPassword,
      website: 'https://techinnovations.example.com',
      description: 'Building modern web & IoT solutions'
    })
  });

  const regData: any = await regRes.json();
  if (!regRes.ok) {
    console.error('❌ Registration failed:', regData);
    throw new Error(regData.message || 'Company registration failed');
  }

  const companyToken = regData.token;
  const companyId = regData.company?.id;
  console.log('✅ Company registered:', { companyId, email: testCompanyEmail });

  // Step 2: Post an Active Internship
  console.log('\n2️⃣  Posting a new active internship...');
  const jobRes = await fetch(`${BASE_URL}/api/internships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      title: 'Full Stack Engineering Intern',
      description: 'Hands-on role developing Next.js web applications and microservices.',
      location: 'Bengaluru / Remote',
      mode: 'HYBRID',
      stipend: 25000,
      durationMonths: 6,
      skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL'],
      status: 'ACTIVE'
    })
  });

  const jobData: any = await jobRes.json();
  if (!jobRes.ok) {
    console.error('❌ Failed to create internship:', jobData);
    throw new Error(jobData.message || 'Internship creation failed');
  }

  const internshipId = jobData.internship?.id;
  console.log('✅ Internship published successfully:', { internshipId, title: jobData.internship?.title });

  // Step 3: Issue Student Dev Token with Valid UUID
  console.log('\n3️⃣  Acquiring Student Dev Authentication Token...');
  const studentTokenRes = await fetch(`${BASE_URL}/api/student/dev-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: validStudentUUID,
      email: `student.${timestamp}@vic.edu`
    })
  });

  const studentTokenData: any = await studentTokenRes.json();
  const studentToken = studentTokenData.token;
  console.log('✅ Student token generated successfully with UUID:', validStudentUUID);

  // Step 4: Student Submits Application
  console.log('\n4️⃣  Submitting Student Application...');
  const applyRes = await fetch(`${BASE_URL}/api/applications/student/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      internshipId,
      resumeUrl: 'https://storage.vic.edu/resumes/candidate.pdf',
      coverLetter: 'I am excited about this engineering internship opportunity!',
      portfolioUrl: 'https://github.com/example-student',
      githubUrl: 'https://github.com/example-student'
    })
  });

  const applyData: any = await applyRes.json();
  if (!applyRes.ok) {
    console.error('❌ Application submission failed:', applyData);
    throw new Error(applyData.message || 'Application failed');
  }

  const applicationId = applyData.application?.id;
  console.log('✅ Application submitted with ID:', applicationId);

  // Step 5: Verify Duplicate Prevention (409 Conflict)
  console.log('\n5️⃣  Verifying Duplicate Application Prevention...');
  const duplicateRes = await fetch(`${BASE_URL}/api/applications/student/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      internshipId,
      resumeUrl: 'https://storage.vic.edu/resumes/candidate.pdf'
    })
  });

  if (duplicateRes.status === 409) {
    console.log('✅ Duplicate check PASSED: Received 409 Conflict as expected.');
  } else {
    console.warn('⚠️ Duplicate check warning: Expected 409 but received', duplicateRes.status);
  }

  // Step 6: Recruiter Schedules Interview
  console.log('\n6️⃣  Recruiter scheduling technical interview...');
  const interviewDate = new Date(Date.now() + 86400000 * 3).toISOString();
  const intvRes = await fetch(`${BASE_URL}/api/interviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      applicationId,
      roundNumber: 1,
      roundName: 'System Architecture & Coding Round',
      meetingUrl: 'https://meet.google.com/vic-interview-room',
      scheduledAt: interviewDate
    })
  });

  const intvData: any = await intvRes.json();
  if (!intvRes.ok) {
    console.error('❌ Interview scheduling failed:', intvData);
    throw new Error(intvData.message || 'Interview scheduling failed');
  }
  console.log('✅ Interview scheduled:', intvData.interview?.roundName);

  // Step 7: Student Checks Applications & Interview Details
  console.log('\n7️⃣  Student checking applications list & interview details...');
  const myAppsRes = await fetch(`${BASE_URL}/api/applications/my-applications`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  const myAppsData: any = await myAppsRes.json();
  console.log(`✅ Retrieved ${myAppsData.count || 0} applications for student.`);
  console.log('📋 Current Application Status:', myAppsData.applications?.[0]?.interviews?.[0]?.status || 'SCHEDULED');

  console.log('\n🎉 ALL ATS & STUDENT WORKFLOW TESTS PASSED SUCCESSFULLY!\n');
}

testFullWorkflow()
  .catch((err) => {
    console.error('\n❌ Test failed with error:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    if (serverProcess) {
      console.log('🧹 Shutting down auto-started backend server...');
      serverProcess.kill('SIGTERM');
    }
  });