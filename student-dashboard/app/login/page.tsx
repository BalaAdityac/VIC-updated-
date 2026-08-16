"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_URL } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("student@test.com");
  const [password, setPassword] = useState("Student@123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("vic_token")) router.replace("/dashboard");
  }, [router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      if (!data.token) throw new Error("Backend did not return a JWT token");
      localStorage.setItem("vic_token", data.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect to the backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-glow glow-one" />
      <div className="login-glow glow-two" />
      <section className="login-card">
        <div className="login-brand"><b>VIC</b><span>Visionary Interns Club</span></div>
        <div className="login-title">
          <h1>Welcome back</h1>
          <p>Sign in to access your student dashboard.</p>
        </div>
        <form onSubmit={submit}>
          <label>Email address</label>
          <div className="input-wrap"><Mail /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="student@example.com" required /></div>
          <label>Password</label>
          <div className="input-wrap"><LockKeyhole /><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button></div>
          {error && <div className="login-error">{error}</div>}
          <button className="login-submit" disabled={loading}>{loading ? <><Loader2 className="spin" /> Signing in...</> : <>Sign in <ArrowRight /></>}</button>
        </form>
        <div className="login-note"><ShieldCheck /> Secure JWT authentication through VIC Backend</div>
        <p className="login-backend">Backend: {API_URL}</p>
      </section>
    </main>
  );
}
