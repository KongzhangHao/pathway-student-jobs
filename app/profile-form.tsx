"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = { name?: string; email?: string; university?: string; studyYear?: number; major?: string; gpa?: number; graduationDate?: string; visaStatus?: string; visaWorkRights?: string; githubUrl?: string | null; linkedinUrl?: string | null; preferredIndustries?: string[]; preferredPositions?: string[]; preferredLocations?: string[]; salaryMin?: number; salaryMax?: number; skills?: { name: string; level: string }[] };

export function ProfileForm({ profile, onCancel }: { profile?: Profile | null; onCancel?: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false); const [message, setMessage] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false);
    if (!response.ok) { const result = await response.json(); return setMessage(result.error ?? "Could not save your profile."); }
    setMessage("Profile saved — your matches have been refreshed."); router.refresh();
    if (!profile) router.push("/student");
  };
  return <form className="profile-form" onSubmit={submit}>
    <div className="form-section"><div><span>01</span><h3>Personal & study details</h3></div><div className="form-fields">
      <label>Full name<input name="name" defaultValue={profile?.name ?? ""} required /></label><label>Email<input name="email" type="email" defaultValue={profile?.email ?? ""} required /></label>
      <label className="span-2">University<input name="university" defaultValue={profile?.university ?? ""} required /></label><label>Year of study<input name="studyYear" type="number" min="1" max="8" defaultValue={profile?.studyYear ?? 1} required /></label><label>GPA<input name="gpa" type="number" min="0" max="7" step="0.1" defaultValue={profile?.gpa ?? ""} required /></label>
      <label className="span-2">Major<input name="major" defaultValue={profile?.major ?? ""} required /></label><label>Graduation date<input name="graduationDate" type="date" defaultValue={profile?.graduationDate?.slice(0,10) ?? ""} required /></label><label>Visa status<input name="visaStatus" defaultValue={profile?.visaStatus ?? ""} required /></label>
      <label className="span-2">Work rights<input name="visaWorkRights" defaultValue={profile?.visaWorkRights ?? ""} required /></label><label>GitHub URL<input name="githubUrl" type="url" defaultValue={profile?.githubUrl ?? ""} /></label><label>LinkedIn URL<input name="linkedinUrl" type="url" defaultValue={profile?.linkedinUrl ?? ""} /></label>
    </div></div>
    <div className="form-section"><div><span>02</span><h3>Job preferences</h3><p>Separate multiple choices with commas.</p></div><div className="form-fields">
      <label className="span-2">Target positions<input name="preferredPositions" defaultValue={profile?.preferredPositions?.join(", ") ?? ""} placeholder="Data Analyst, Software Engineer" required /></label><label className="span-2">Industries<input name="preferredIndustries" defaultValue={profile?.preferredIndustries?.join(", ") ?? ""} placeholder="Technology, FinTech" required /></label>
      <label className="span-2">Preferred locations<input name="preferredLocations" defaultValue={profile?.preferredLocations?.join(", ") ?? ""} placeholder="Sydney, Melbourne, Remote" required /></label><label>Minimum salary (AUD)<input name="salaryMin" type="number" min="0" step="1000" defaultValue={profile?.salaryMin ?? 60000} required /></label><label>Maximum salary (AUD)<input name="salaryMax" type="number" min="0" step="1000" defaultValue={profile?.salaryMax ?? 85000} required /></label>
      <label className="span-2">Skills<input name="skills" defaultValue={profile?.skills?.map((skill) => skill.name).join(", ") ?? ""} placeholder="Python, SQL, Tableau" required /></label>
    </div></div>
    {message ? <p className={message.startsWith("Profile saved") ? "form-success" : "form-error"} role="status">{message}</p> : null}
    <div className="form-footer">{onCancel ? <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button> : null}<button className="primary-button" disabled={saving}>{saving ? "Saving…" : profile ? "Save changes" : "Create profile"}</button></div>
  </form>;
}
