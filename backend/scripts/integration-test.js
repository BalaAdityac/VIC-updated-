/*
 * Real-database integration test for the VIC recruiter workflow.
 * Run with the API and PostgreSQL running:
 *   node scripts/integration-test.js
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:5000/api";
const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const emails = {
  companyA: `company-a-${suffix}@example.com`,
  companyB: `company-b-${suffix}@example.com`,
  studentA: `student-a-${suffix}@example.com`,
  studentB: `student-b-${suffix}@example.com`,
};

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  let body = null;
  try { body = await response.json(); } catch {}
  return { status: response.status, body };
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

function expect(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

async function register(payload) {
  const r = await request("/auth/register", { method: "POST", body: JSON.stringify(payload) });
  expect(r.status === 201, `register ${payload.email}`);
  return r.body.data.token;
}

async function main() {
  console.log(`Testing ${BASE_URL}`);

  const companyToken = await register({ email: emails.companyA, password: "Password123", role: "COMPANY", companyName: "VIC Test Company A" });
  const otherCompanyToken = await register({ email: emails.companyB, password: "Password123", role: "COMPANY", companyName: "VIC Test Company B" });
  const studentToken = await register({ email: emails.studentA, password: "Password123", role: "STUDENT", fullName: "Workflow Student A" });
  const rejectedStudentToken = await register({ email: emails.studentB, password: "Password123", role: "STUDENT", fullName: "Workflow Student B" });

  const internship = await request("/company/internships", {
    method: "POST",
    headers: auth(companyToken),
    body: JSON.stringify({
      title: "Backend Integration Intern",
      description: "Real database workflow integration test",
      location: "Bengaluru",
      workMode: "HYBRID",
      stipend: "15000",
      skills: "Node.js, Prisma, PostgreSQL",
    }),
  });
  expect(internship.status === 201, "company creates internship");
  const internshipId = internship.body.data.id;

  const applied = await request(`/student/internships/${internshipId}/apply`, { method: "POST", headers: auth(studentToken) });
  expect(applied.status === 201, "student applies to internship");
  const applicationId = applied.body.data.id;

  const duplicate = await request(`/student/internships/${internshipId}/apply`, { method: "POST", headers: auth(studentToken) });
  expect(duplicate.status === 409, "duplicate application is rejected");

  const secondApplied = await request(`/student/internships/${internshipId}/apply`, { method: "POST", headers: auth(rejectedStudentToken) });
  expect(secondApplied.status === 201, "second student application is created");
  const rejectedApplicationId = secondApplied.body.data.id;

  const companyApps = await request("/company/applications", { headers: auth(companyToken) });
  expect(companyApps.status === 200 && companyApps.body.data.length >= 2, "company receives applications");

  const candidate = await request(`/company/applications/${applicationId}/candidate`, { headers: auth(companyToken) });
  expect(candidate.status === 200 && candidate.body.data.candidate.email === emails.studentA, "company can view candidate profile");

  const unauthorizedCandidate = await request(`/company/applications/${applicationId}/candidate`, { headers: auth(otherCompanyToken) });
  expect(unauthorizedCandidate.status === 404, "other company cannot view candidate");

  const invalidApplication = await request(`/company/applications/00000000-0000-0000-0000-000000000000/candidate`, { headers: auth(companyToken) });
  expect(invalidApplication.status === 404, "invalid application id returns 404");

  const studentPortalInitial = await request("/student/applications", { headers: auth(studentToken) });
  expect(studentPortalInitial.status === 200 && studentPortalInitial.body.data.find(a => a.id === applicationId)?.status === "APPLIED", "student portal sees APPLIED status");

  const shortlist = await request(`/company/applications/${applicationId}/status`, {
    method: "PATCH", headers: auth(companyToken), body: JSON.stringify({ status: "SHORTLISTED" }),
  });
  expect(shortlist.status === 200 && shortlist.body.data.status === "SHORTLISTED", "company shortlists candidate");

  const studentPortalShortlisted = await request("/student/applications", { headers: auth(studentToken) });
  expect(studentPortalShortlisted.body.data.find(a => a.id === applicationId)?.status === "SHORTLISTED", "student portal sees SHORTLISTED status");

  const scheduled = await request(`/company/applications/${applicationId}/interviews`, {
    method: "POST", headers: auth(companyToken), body: JSON.stringify({
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      durationMins: 45,
      meetingLink: "https://meet.google.com/vic-test",
      interviewType: "ONLINE",
      round: "TECHNICAL",
      interviewer: "VIC Engineering Team",
      notes: "Integration test interview",
    }),
  });
  expect(scheduled.status === 201 && scheduled.body.data.status === "SCHEDULED", "company schedules interview");
  const interviewId = scheduled.body.data.id;

  const duplicateInterview = await request(`/company/applications/${applicationId}/interviews`, {
    method: "POST", headers: auth(companyToken), body: JSON.stringify({
      scheduledAt: new Date(Date.now() + 172800000).toISOString(),
      interviewType: "ONLINE", round: "HR",
    }),
  });
  expect(duplicateInterview.status === 409, "duplicate interview scheduling is rejected");

  const studentInterview = await request("/student/interviews", { headers: auth(studentToken) });
  const studentInterviewRecord = studentInterview.body.data.find(i => i.id === interviewId);
  expect(studentInterview.status === 200 && studentInterviewRecord?.meetingLink && studentInterviewRecord?.round === "TECHNICAL" && studentInterviewRecord?.status === "SCHEDULED", "student receives complete scheduled interview details");

  const rescheduled = await request(`/company/interviews/${interviewId}/reschedule`, {
    method: "PATCH", headers: auth(companyToken), body: JSON.stringify({
      scheduledAt: new Date(Date.now() + 259200000).toISOString(),
      durationMins: 60,
      meetingLink: "https://meet.google.com/vic-rescheduled",
      interviewType: "ONLINE",
      round: "MANAGERIAL",
      interviewer: "VIC Manager",
      notes: "Rescheduled integration test",
    }),
  });
  expect(rescheduled.status === 200 && rescheduled.body.data.status === "RESCHEDULED", "company can reschedule interview");

  const studentAfterReschedule = await request("/student/interviews", { headers: auth(studentToken) });
  const rescheduledRecord = studentAfterReschedule.body.data.find(i => i.id === interviewId);
  expect(rescheduledRecord?.status === "RESCHEDULED" && rescheduledRecord?.round === "MANAGERIAL" && rescheduledRecord?.durationMins === 60, "student receives rescheduled interview details");

  const holdEvaluation = await request(`/company/interviews/${interviewId}/evaluation`, {
    method: "PUT", headers: auth(companyToken), body: JSON.stringify({ score: 82, remarks: "Good candidate, keep on hold", recommendation: "HOLD" }),
  });
  expect(holdEvaluation.status === 200, "company records HOLD evaluation");

  const selectedEvaluation = await request(`/company/interviews/${interviewId}/evaluation`, {
    method: "PUT", headers: auth(companyToken), body: JSON.stringify({ score: 91, remarks: "Strong technical performance", recommendation: "SELECTED" }),
  });
  expect(selectedEvaluation.status === 200, "company updates evaluation to SELECTED");

  const companyEvaluation = await request(`/company/interviews/${interviewId}/evaluation`, { headers: auth(companyToken) });
  expect(companyEvaluation.status === 200 && companyEvaluation.body.data.recommendation === "SELECTED", "company can retrieve final evaluation");

  const studentFinal = await request("/student/applications", { headers: auth(studentToken) });
  const finalApplication = studentFinal.body.data.find(a => a.id === applicationId);
  expect(finalApplication?.status === "SELECTED", "student portal sees final SELECTED result");
  expect(finalApplication?.interviews?.[0]?.status === "COMPLETED", "student application contains completed interview status");

  const otherCompanyEvaluation = await request(`/company/interviews/${interviewId}/evaluation`, { headers: auth(otherCompanyToken) });
  expect(otherCompanyEvaluation.status === 404, "other company cannot access evaluation");

  const studentCompanyEndpoint = await request("/company/applications", { headers: auth(studentToken) });
  expect(studentCompanyEndpoint.status === 403, "student cannot access company applications");

  const rejected = await request(`/company/applications/${rejectedApplicationId}/status`, {
    method: "PATCH", headers: auth(companyToken), body: JSON.stringify({ status: "REJECTED" }),
  });
  expect(rejected.status === 200 && rejected.body.data.status === "REJECTED", "company rejects candidate");

  const rejectedSchedule = await request(`/company/applications/${rejectedApplicationId}/interviews`, {
    method: "POST", headers: auth(companyToken), body: JSON.stringify({
      scheduledAt: new Date(Date.now() + 86400000).toISOString(), interviewType: "ONLINE", round: "HR",
    }),
  });
  expect(rejectedSchedule.status === 400, "rejected candidate cannot be scheduled");

  const missingDetails = await request(`/company/applications/${rejectedApplicationId}/interviews`, {
    method: "POST", headers: auth(companyToken), body: JSON.stringify({}),
  });
  expect(missingDetails.status === 400, "missing interview details fail validation");

  const invalidToken = await request("/company/applications", { headers: { Authorization: "Bearer invalid-token" } });
  expect(invalidToken.status === 401, "invalid token is rejected");

  console.log("\nALL INTEGRATION TESTS PASSED");
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
