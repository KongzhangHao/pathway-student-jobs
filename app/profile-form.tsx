"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = { name?: string; email?: string; university?: string; studyYear?: number; major?: string; gpa?: number; graduationDate?: string; visaStatus?: string; visaWorkRights?: string; githubUrl?: string | null; linkedinUrl?: string | null; preferredIndustries?: string[]; preferredPositions?: string[]; preferredLocations?: string[]; salaryMin?: number; salaryMax?: number; skills?: { name: string; level: string }[] };
type SkillEntry = { name: string; level: string };
const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

export function ProfileForm({ profile, onCancel }: { profile?: Profile | null; onCancel?: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false); const [message, setMessage] = useState("");
  const [skills, setSkills] = useState<SkillEntry[]>(profile?.skills?.length ? profile.skills : [{ name: "", level: "Intermediate" }]);
  const updateSkill = (index: number, field: keyof SkillEntry, value: string) => setSkills((current) => current.map((skill, skillIndex) => skillIndex === index ? { ...skill, [field]: value } : skill));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setMessage("");
    const data: Record<string, unknown> = Object.fromEntries(new FormData(event.currentTarget));
    data.skills = skills.map((skill) => ({ name: skill.name.trim(), level: skill.level }));
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
      <div className="span-2 skill-editor"><div className="skill-editor-heading"><div><strong>Skills & strengths</strong><small>Add each skill and select your proficiency.</small></div><button type="button" onClick={() => setSkills((current) => [...current, { name: "", level: "Intermediate" }])}>＋ Add skill</button></div>
        <div className="skill-rows">{skills.map((skill, index) => <div className="skill-row" key={index}><label>Skill<input value={skill.name} onChange={(event) => updateSkill(index, "name", event.target.value)} placeholder="e.g. Python" required /></label><label>Proficiency<select value={skill.level} onChange={(event) => updateSkill(index, "level", event.target.value)}>{skillLevels.map((level) => <option key={level}>{level}</option>)}</select></label><button type="button" aria-label={`Remove ${skill.name || `skill ${index + 1}`}`} disabled={skills.length === 1} onClick={() => setSkills((current) => current.filter((_, skillIndex) => skillIndex !== index))}>Remove</button></div>)}</div>
      </div>
    </div></div>
    {message ? <p className={message.startsWith("Profile saved") ? "form-success" : "form-error"} role="status">{message}</p> : null}
    <div className="form-footer">{onCancel ? <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button> : null}<button className="primary-button" disabled={saving}>{saving ? "Saving…" : profile ? "Save changes" : "Create profile"}</button></div>
  </form>;
}
