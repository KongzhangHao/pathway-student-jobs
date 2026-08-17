"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("maya.chen@example.com");
  const [password, setPassword] = useState("Student123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return setError(data.error ?? "Unable to sign in");
    router.push(data.role === "ADMIN" ? "/admin" : "/student"); router.refresh();
  };
  const useDemo = (role: "student" | "admin") => { if (role === "student") { setEmail("maya.chen@example.com"); setPassword("Student123!"); } else { setEmail("admin@pathway.app"); setPassword("Admin123!"); } };
  return <div className="login-form-wrap"><span className="eyebrow">Welcome back</span><h2>Sign in to Pathway</h2><p className="login-intro">Use your student or administrator account to continue.</p><div className="demo-switch"><button type="button" onClick={() => useDemo("student")}>Student demo</button><button type="button" onClick={() => useDemo("admin")}>Admin demo</button></div><form onSubmit={submit}><label>Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label><label>Password<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<button className="login-submit" disabled={loading}>{loading ? "Signing in…" : "Sign in →"}</button></form><p className="login-note">Demo accounts are pre-filled. Choose a role above to explore each journey.</p></div>;
}
