import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/student");
  return <main className="login-page"><section className="login-brand"><div className="login-logo"><span>p</span><strong>pathway</strong></div><div><span className="eyebrow light">Your career, made clearer</span><h1>Find the work<br />that fits you.</h1><p>Explainable job matches, stronger applications, and one clear place to manage your next move.</p></div><div className="login-proof"><div><strong>92%</strong><span>Top profile match</span></div><div><strong>4</strong><span>New opportunities</span></div></div></section><section className="login-panel"><LoginForm /></section></main>;
}
