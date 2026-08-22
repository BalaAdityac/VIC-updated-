export async function getAdminToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  let token = localStorage.getItem("vic_admin_token");
  if (!token) {
    token = `admin_local_dev_${Date.now()}`;
    localStorage.setItem("vic_admin_token", token);
  }
  
  return token;
}
/**
 * Completely clears user-specific session data and local pipelines
 * when logging out or switching accounts to prevent data bleeding.
 */
export function clearStudentSession() {
  if (typeof window === "undefined") return;

  // 1. Remove student authentication & profile state
  localStorage.removeItem("student_token");
  localStorage.removeItem("student_data");

  // 2. Remove student-specific application pipelines & notifications
  localStorage.removeItem("vic_applications");
  localStorage.removeItem("vic_student_notifications");

  // 3. Notify real-time cross-tab listeners of the session reset
  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("vic_realtime_pipeline");
      bc.postMessage({ type: "STUDENT_LOGOUT" });
      setTimeout(() => bc.close(), 100);
    }
  } catch (e) {}

  window.dispatchEvent(new CustomEvent("vic_pipeline_sync", { detail: { type: "STUDENT_LOGOUT" } }));
}

export function clearCompanySession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("company_token");
  localStorage.removeItem("company_data");

  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("vic_realtime_pipeline");
      bc.postMessage({ type: "COMPANY_LOGOUT" });
      setTimeout(() => bc.close(), 100);
    }
  } catch (e) {}

  window.dispatchEvent(new CustomEvent("vic_pipeline_sync", { detail: { type: "COMPANY_LOGOUT" } }));
}