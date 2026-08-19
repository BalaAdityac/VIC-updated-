const baseUrl = process.env.BASE_URL || "http://localhost:5000";
const token = process.env.ADMIN_TOKEN;
if (!token) {
  console.error("ADMIN_TOKEN is required. Example: $env:ADMIN_TOKEN='ey...'; node scripts/admin-smoke-test.js");
  process.exit(1);
}

const checks = [
  ["GET", "/api/admin/me"],
  ["GET", "/api/admin/dashboard"],
  ["GET", "/api/admin/users?page=1&limit=5"],
  ["GET", "/api/admin/companies?page=1&limit=5"],
  ["GET", "/api/admin/analytics/applications"],
  ["GET", "/api/admin/analytics/interviews"],
  ["GET", "/api/admin/analytics/trends/applications?days=7"],
  ["GET", "/api/admin/analytics/trends/interviews?days=7"],
  ["GET", "/api/admin/audit-logs?page=1&limit=5"],
  ["GET", "/api/admin/users/not-a-uuid"],
];

(async () => {
  let failed = 0;
  for (const [method, path] of checks) {
    const res = await fetch(baseUrl + path, { method, headers: { Authorization: `Bearer ${token}` } });
    const expected = path.includes("not-a-uuid") ? 400 : 200;
    const ok = res.status === expected;
    console.log(`${ok ? "PASS" : "FAIL"} ${method} ${path} -> ${res.status} (expected ${expected})`);
    if (!ok) failed++;
  }
  if (failed) process.exit(1);
  console.log("Admin smoke tests passed.");
})().catch(err => { console.error(err); process.exit(1); });
