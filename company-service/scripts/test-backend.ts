import { randomUUID } from 'crypto';
import { spawn, ChildProcess } from 'child_process';
import { resolve } from 'path';

const BASE_URL = process.env.API_URL || 'http://127.0.0.1:3000';
let serverProcess: ChildProcess | null = null;

// Helper to poll the health endpoint
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

  // Spawn server process
  serverProcess = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['tsx', serverPath],
    {
      cwd: resolve(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PORT: '3000' }
    }
  );

  // Stream output if server errors out
  serverProcess.stderr?.on('data', (chunk) => {
    const msg = chunk.toString();
    if (msg.includes('Error')) console.error(`[Server stderr]: ${msg}`);
  });

  // Wait for server to become ready (up to 15 seconds)
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

async function runTests() {
  await ensureServerRunning();

  console.log('🧪 Starting ATS Backend Test against:', BASE_URL);

  const timestamp = Date.now();
  const testCompanyEmail = `company.${timestamp}@test.com`;
  const testPassword = 'Password123!';
  const studentUUID = randomUUID();
  const evaluatorUUID = randomUUID();

  // 1. Health Check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('\n1️⃣ Health Check:', healthData);

  // 2. Register Company
  const regRes = await fetch(`${BASE_URL}/api/company/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyName: `Backend Test Corp ${timestamp}`,
      email: testCompanyEmail,
      password: testPassword,
      website: 'https://backendtest.example.com',
      description: 'Automated backend testing suite company'
    })
  });
  const regData: any = await regRes.json();
  if (!regRes.ok) throw new Error(JSON.stringify(regData));
  const companyToken = regData.token;
  const companyId = regData.company?.id;
  console.log('2️⃣ Register Company: Success - Company ID:', companyId);

  // 3. Post Internship
  const jobRes = await fetch(`${BASE_URL}/api/internships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      title: 'Backend Systems Engineering Intern',
      description: 'Building microservices, Fastify routing, and PostgreSQL models with Prisma.',
      location: 'Bengaluru / Remote',
      mode: 'HYBRID',
      stipend: 30000,
      durationMonths: 6,
      skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Fastify'],
      status: 'ACTIVE'
    })
  });
  const jobData: any = await jobRes.json();
  if (!jobRes.ok) throw new Error(JSON.stringify(jobData));
  const internshipId = jobData.internship?.id;
  console.log('3️⃣ Post Internship: Success - Role:', jobData.internship?.title);

  // 4. Issue Student Token
  const studentTokenRes = await fetch(`${BASE_URL}/api/student/dev-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: studentUUID,
      email: `student.${timestamp}@vic.edu`
    })
  });
  const studentTokenData: any = await studentTokenRes.json();
  const studentToken = studentTokenData.token;
  console.log('4️⃣ Student Dev Token: Generated for UUID:', studentUUID);

  // 5. Submit Application (Student Apply)
  const applyRes = await fetch(`${BASE_URL}/api/applications/student/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      internshipId,
      resumeUrl: 'https://storage.vic.edu/resumes/backend_test.pdf',
      coverLetter: 'Applying through automated ATS pipeline test.',
      portfolioUrl: 'https://github.com/example-student',
      githubUrl: 'https://github.com/example-student'
    })
  });
  const applyData: any = await applyRes.json();
  if (!applyRes.ok) throw new Error(JSON.stringify(applyData));
  const applicationId = applyData.application?.id;
  console.log('5️⃣ Submit Application: Success - Application ID:', applicationId);

  // 6. Schedule Interview
  const interviewDate = new Date(Date.now() + 86400000 * 2).toISOString();
  const intvRes = await fetch(`${BASE_URL}/api/interviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      applicationId,
      roundNumber: 1,
      roundName: 'Live Coding & System Architecture',
      meetingUrl: 'https://meet.google.com/vic-test-room',
      scheduledAt: interviewDate
    })
  });
  const intvData: any = await intvRes.json();
  if (!intvRes.ok) throw new Error(JSON.stringify(intvData));
  const interviewId = intvData.interview?.id;
  console.log('6️⃣ Schedule Interview: Success - Interview ID:', interviewId);

  // 7. Submit Evaluation
  const evalRes = await fetch(`${BASE_URL}/api/evaluations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      interviewId,
      evaluatorId: evaluatorUUID,
      score: 9.2,
      passed: true,
      feedback: 'Candidate displayed exceptional understanding of backend systems, data modeling, and API security.'
    })
  });
  const evalData: any = await evalRes.json();
  if (!evalRes.ok) throw new Error(JSON.stringify(evalData));
  console.log('7️⃣ Submit Evaluation: Success - Evaluation ID:', evalData.evaluation?.id);

  // 8. Generate and Send Offer
  const offerRes = await fetch(`${BASE_URL}/api/offers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      applicationId,
      stipendAmount: 30000,
      joiningDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      offerLetterUrl: 'https://storage.vic.edu/offers/sample-offer.pdf'
    })
  });
  const offerData: any = await offerRes.json();
  if (!offerRes.ok) throw new Error(JSON.stringify(offerData));
  const offerId = offerData.offer?.id;
  console.log('8️⃣ Issue Offer: Success - Offer ID:', offerId);

  // 9. Student Accepts Offer
  const acceptRes = await fetch(`${BASE_URL}/api/offers/${offerId}/respond`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'ACCEPTED' })
  });
  const acceptData: any = await acceptRes.json();
  if (!acceptRes.ok) throw new Error(JSON.stringify(acceptData));
  console.log('9️⃣ Student Responds to Offer: Status ->', acceptData.offer?.status);

  // 10. Superadmin Overview Verification
  const adminTokenRes = await fetch(`${BASE_URL}/api/admin/dev-token`, { method: 'POST' });
  const adminTokenData: any = await adminTokenRes.json();
  const adminToken = adminTokenData.token;

  const overviewRes = await fetch(`${BASE_URL}/api/admin/overview`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const overviewData: any = await overviewRes.json();
  if (!overviewRes.ok) throw new Error(JSON.stringify(overviewData));
  console.log('🔟 Superadmin Overview:', overviewData.stats);

  console.log('\n🎉 ALL 10 ATS & SUPERADMIN BACKEND TESTS PASSED CLEANLY!\n');
}

runTests()
  .catch((err) => {
    console.error('\n❌ Test failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    if (serverProcess) {
      console.log('🧹 Shutting down auto-started backend server...');
      serverProcess.kill('SIGTERM');
    }
  });