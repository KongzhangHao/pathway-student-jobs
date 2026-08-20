"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SkillEntry = { name: string; level: string };
type ExperienceEntry = { company: string; title: string; startDate: string; endDate: string; description: string };
type ProjectEntry = { name: string; description: string; technologies: string; projectUrl: string };
type LanguageEntry = { language: string; proficiency: string };
type CertificateEntry = { name: string; issuer: string; issueDate: string };
type AwardEntry = { name: string; issuer: string; awardedDate: string };
type Profile = {
  name?: string; email?: string; university?: string; studyYear?: number; major?: string; gpa?: number; graduationDate?: string;
  visaStatus?: string; visaWorkRights?: string; githubUrl?: string | null; linkedinUrl?: string | null;
  preferredIndustries?: string[]; preferredPositions?: string[]; preferredLocations?: string[]; salaryMin?: number; salaryMax?: number;
  skills?: SkillEntry[];
  experiences?: { company: string; title: string; startDate: string; endDate: string | null; description: string }[];
  projects?: { name: string; description: string; technologies: string[]; projectUrl: string | null }[];
  languages?: LanguageEntry[];
  certificates?: CertificateEntry[];
  awards?: AwardEntry[];
};

const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
const languageLevels = ["Basic", "Conversational", "Professional", "Fluent", "Native"];
const updateAt = <T,>(items: T[], index: number, patch: Partial<T>) => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);

export function ProfileForm({ profile, onCancel, onSaved }: { profile?: Profile | null; onCancel?: () => void; onSaved?: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [skills, setSkills] = useState<SkillEntry[]>(profile?.skills?.length ? profile.skills : [{ name: "", level: "Intermediate" }]);
  const [experiences, setExperiences] = useState<ExperienceEntry[]>((profile?.experiences ?? []).map((item) => ({ ...item, startDate: item.startDate.slice(0, 10), endDate: item.endDate?.slice(0, 10) ?? "" })));
  const [projects, setProjects] = useState<ProjectEntry[]>((profile?.projects ?? []).map((item) => ({ ...item, technologies: item.technologies.join(", "), projectUrl: item.projectUrl ?? "" })));
  const [languages, setLanguages] = useState<LanguageEntry[]>(profile?.languages ?? []);
  const [certificates, setCertificates] = useState<CertificateEntry[]>((profile?.certificates ?? []).map((item) => ({ ...item, issueDate: item.issueDate.slice(0, 10) })));
  const [awards, setAwards] = useState<AwardEntry[]>((profile?.awards ?? []).map((item) => ({ ...item, awardedDate: item.awardedDate.slice(0, 10) })));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const data: Record<string, unknown> = Object.fromEntries(new FormData(event.currentTarget));
    data.skills = skills.map((skill) => ({ name: skill.name.trim(), level: skill.level }));
    data.experiences = experiences;
    data.projects = projects.map((project) => ({ ...project, technologies: project.technologies.split(",").map((item) => item.trim()).filter(Boolean) }));
    data.languages = languages;
    data.certificates = certificates;
    data.awards = awards;
    const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false);
    if (!response.ok) {
      const result = await response.json();
      return setMessage(result.error ?? "Could not save your profile.");
    }
    setMessage("Profile saved — your matches have been refreshed.");
    router.refresh();
    onSaved?.();
    if (!profile) router.push("/student");
  };

  return <form className="profile-form" onSubmit={submit}>
    <div className="form-section"><div><span>01</span><h3>Personal & study details</h3></div><div className="form-fields">
      <label>Full name<input name="name" defaultValue={profile?.name ?? ""} required /></label>
      <label>Email<input name="email" type="email" defaultValue={profile?.email ?? ""} required /></label>
      <label className="span-2">University<input name="university" defaultValue={profile?.university ?? ""} required /></label>
      <label>Year of study<input name="studyYear" type="number" min="1" max="8" defaultValue={profile?.studyYear ?? 1} required /></label>
      <label>GPA<input name="gpa" type="number" min="0" max="7" step="0.1" defaultValue={profile?.gpa ?? ""} required /></label>
      <label className="span-2">Major<input name="major" defaultValue={profile?.major ?? ""} required /></label>
      <label>Graduation date<input name="graduationDate" type="date" defaultValue={profile?.graduationDate?.slice(0, 10) ?? ""} required /></label>
      <label>Visa status<input name="visaStatus" defaultValue={profile?.visaStatus ?? ""} required /></label>
      <label className="span-2">Work rights<input name="visaWorkRights" defaultValue={profile?.visaWorkRights ?? ""} required /></label>
      <label>GitHub URL<input name="githubUrl" type="url" defaultValue={profile?.githubUrl ?? ""} /></label>
      <label>LinkedIn URL<input name="linkedinUrl" type="url" defaultValue={profile?.linkedinUrl ?? ""} /></label>
    </div></div>

    <div className="form-section"><div><span>02</span><h3>Job preferences & skills</h3><p>Separate multiple preferences with commas.</p></div><div className="form-fields">
      <label className="span-2">Target positions<input name="preferredPositions" defaultValue={profile?.preferredPositions?.join(", ") ?? ""} placeholder="Data Analyst, Software Engineer" required /></label>
      <label className="span-2">Industries<input name="preferredIndustries" defaultValue={profile?.preferredIndustries?.join(", ") ?? ""} placeholder="Technology, FinTech" required /></label>
      <label className="span-2">Preferred locations<input name="preferredLocations" defaultValue={profile?.preferredLocations?.join(", ") ?? ""} placeholder="Sydney, Melbourne, Remote" required /></label>
      <label>Minimum salary (AUD)<input name="salaryMin" type="number" min="0" step="1000" defaultValue={profile?.salaryMin ?? 60000} required /></label>
      <label>Maximum salary (AUD)<input name="salaryMax" type="number" min="0" step="1000" defaultValue={profile?.salaryMax ?? 85000} required /></label>
      <div className="span-2 repeatable-editor"><div className="repeatable-heading"><div><strong>Skills & strengths</strong><small>Add each skill and select your proficiency.</small></div><button type="button" onClick={() => setSkills((current) => [...current, { name: "", level: "Intermediate" }])}>＋ Add skill</button></div>
        <div className="repeatable-list">{skills.map((skill, index) => <div className="repeatable-card compact" key={index}><label>Skill<input value={skill.name} onChange={(event) => setSkills((current) => updateAt(current, index, { name: event.target.value }))} placeholder="e.g. Python" required /></label><label>Proficiency<select value={skill.level} onChange={(event) => setSkills((current) => updateAt(current, index, { level: event.target.value }))}>{skillLevels.map((level) => <option key={level}>{level}</option>)}</select></label><button className="remove-entry" type="button" aria-label={`Remove ${skill.name || `skill ${index + 1}`}`} disabled={skills.length === 1} onClick={() => setSkills((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}</div>
      </div>
    </div></div>

    <div className="form-section"><div><span>03</span><h3>Experience & projects</h3><p>Add evidence that strengthens applications and cover letters.</p></div><div className="form-fields">
      <div className="span-2 repeatable-editor"><div className="repeatable-heading"><strong>Work and internship experience</strong><button type="button" onClick={() => setExperiences((current) => [...current, { company: "", title: "", startDate: "", endDate: "", description: "" }])}>＋ Add experience</button></div>
        <div className="repeatable-list">{experiences.map((item, index) => <div className="repeatable-card" key={index}><label>Company<input value={item.company} onChange={(event) => setExperiences((current) => updateAt(current, index, { company: event.target.value }))} required /></label><label>Position<input value={item.title} onChange={(event) => setExperiences((current) => updateAt(current, index, { title: event.target.value }))} required /></label><label>Start date<input type="date" value={item.startDate} onChange={(event) => setExperiences((current) => updateAt(current, index, { startDate: event.target.value }))} required /></label><label>End date<input type="date" value={item.endDate} onChange={(event) => setExperiences((current) => updateAt(current, index, { endDate: event.target.value }))} /></label><label className="span-2">Description<textarea value={item.description} onChange={(event) => setExperiences((current) => updateAt(current, index, { description: event.target.value }))} required /></label><button className="remove-entry span-2" type="button" onClick={() => setExperiences((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove experience</button></div>)}</div>
      </div>
      <div className="span-2 repeatable-editor"><div className="repeatable-heading"><strong>Projects</strong><button type="button" onClick={() => setProjects((current) => [...current, { name: "", description: "", technologies: "", projectUrl: "" }])}>＋ Add project</button></div>
        <div className="repeatable-list">{projects.map((item, index) => <div className="repeatable-card" key={index}><label>Project name<input value={item.name} onChange={(event) => setProjects((current) => updateAt(current, index, { name: event.target.value }))} required /></label><label>Project URL<input type="url" value={item.projectUrl} onChange={(event) => setProjects((current) => updateAt(current, index, { projectUrl: event.target.value }))} /></label><label className="span-2">Technologies<input value={item.technologies} onChange={(event) => setProjects((current) => updateAt(current, index, { technologies: event.target.value }))} placeholder="Python, React, PostgreSQL" required /></label><label className="span-2">Description<textarea value={item.description} onChange={(event) => setProjects((current) => updateAt(current, index, { description: event.target.value }))} required /></label><button className="remove-entry span-2" type="button" onClick={() => setProjects((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove project</button></div>)}</div>
      </div>
    </div></div>

    <div className="form-section"><div><span>04</span><h3>Languages & achievements</h3><p>Optional evidence can help employers understand your strengths.</p></div><div className="form-fields">
      <div className="span-2 repeatable-editor"><div className="repeatable-heading"><strong>Languages</strong><button type="button" onClick={() => setLanguages((current) => [...current, { language: "", proficiency: "Conversational" }])}>＋ Add language</button></div>
        <div className="repeatable-list">{languages.map((item, index) => <div className="repeatable-card compact" key={index}><label>Language<input value={item.language} onChange={(event) => setLanguages((current) => updateAt(current, index, { language: event.target.value }))} required /></label><label>Proficiency<select value={item.proficiency} onChange={(event) => setLanguages((current) => updateAt(current, index, { proficiency: event.target.value }))}>{languageLevels.map((level) => <option key={level}>{level}</option>)}</select></label><button className="remove-entry" type="button" onClick={() => setLanguages((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}</div>
      </div>
      <div className="span-2 repeatable-editor"><div className="repeatable-heading"><strong>Certificates</strong><button type="button" onClick={() => setCertificates((current) => [...current, { name: "", issuer: "", issueDate: "" }])}>＋ Add certificate</button></div>
        <div className="repeatable-list">{certificates.map((item, index) => <div className="repeatable-card compact" key={index}><label>Certificate<input value={item.name} onChange={(event) => setCertificates((current) => updateAt(current, index, { name: event.target.value }))} required /></label><label>Issuer<input value={item.issuer} onChange={(event) => setCertificates((current) => updateAt(current, index, { issuer: event.target.value }))} required /></label><label>Issue date<input type="date" value={item.issueDate} onChange={(event) => setCertificates((current) => updateAt(current, index, { issueDate: event.target.value }))} required /></label><button className="remove-entry" type="button" onClick={() => setCertificates((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}</div>
      </div>
      <div className="span-2 repeatable-editor"><div className="repeatable-heading"><strong>Awards</strong><button type="button" onClick={() => setAwards((current) => [...current, { name: "", issuer: "", awardedDate: "" }])}>＋ Add award</button></div>
        <div className="repeatable-list">{awards.map((item, index) => <div className="repeatable-card compact" key={index}><label>Award<input value={item.name} onChange={(event) => setAwards((current) => updateAt(current, index, { name: event.target.value }))} required /></label><label>Issuer<input value={item.issuer} onChange={(event) => setAwards((current) => updateAt(current, index, { issuer: event.target.value }))} required /></label><label>Awarded date<input type="date" value={item.awardedDate} onChange={(event) => setAwards((current) => updateAt(current, index, { awardedDate: event.target.value }))} required /></label><button className="remove-entry" type="button" onClick={() => setAwards((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}</div>
      </div>
    </div></div>

    {message ? <p className={message.startsWith("Profile saved") ? "form-success" : "form-error"} role="status">{message}</p> : null}
    <div className="form-footer">{onCancel ? <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button> : null}<button className="primary-button" disabled={saving}>{saving ? "Saving…" : profile ? "Save changes" : "Create profile"}</button></div>
  </form>;
}
