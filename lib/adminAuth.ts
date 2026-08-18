export async function getAdminToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const cached = localStorage.getItem("superadmin_token");
  if (cached) return cached;

  try {
    const res = await fetch("http://127.0.0.1:3000/api/admin/dev-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("superadmin_token", data.token);
        return data.token;
      }
    }
  } catch (err) {
    console.warn("Could not retrieve backend superadmin token:", err);
  }

  return null;
}

export function isSuperAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("superadmin_token") || localStorage.getItem("superadmin_logged_in"));
}