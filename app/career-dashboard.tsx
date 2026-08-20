"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { profileCompleteness } from "@/lib/profile-completion";

type Student = {
  id: number; name: string; email: string; university: string; studyYear: number; major: string; gpa: number;
  graduationDate: string; visaStatus: string; visaWorkRights: string; githubUrl: string | null; linkedinUrl: string | null;
  preferredIndustries: string[]; preferredPositions: string[]; preferredLocations: string[]; salaryMin: number; salaryMax: number;
  skills: { name: string; level: string }[]; experiences: { id: number; company: string; title: string; description: string; startDate: string; endDate: string | null }[];
  projects: { id: number; name: string; description: string; technologies: string[]; projectUrl: string | null }[];
  languages: { id: number; language: string; proficiency: string }[]; certificates: { id: number; name: string; issuer: string; issueDate: string }[];
  awards: { id: number; name: string; issuer: string; awardedDate: string }[]; savedJobIds: number[];
};

type Job = {
  id: number; company: string; companyInitials: string; companyColour: string; position: string; industry: string;
  employmentType: string; description: string; responsibilities: string[]; yearsExperience: number; salaryMin: number;
  salaryMax: number; location: string; workMode: string; visaRequirement: string; applicationDeadline: string;
  requiredSkills: string[]; matchingSkills: string[]; missingSkills: string[]; matchScore: number;
};

const money = (value: number) => `$${Math.round(value / 1000)}k`;
const shortDate = (date: string) => new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" }).format(new Date(date));
const longDate = (date: string) => new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: "Australia/Sydney" }).format(new Date(date));
const monthYear = (date: string) => new Intl.DateTimeFormat("en-AU", { month: "short", year: "numeric" }).format(new Date(date));
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
const ordinal = (value: number) => {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  return `${value}${value % 10 === 1 ? "st" : value % 10 === 2 ? "nd" : value % 10 === 3 ? "rd" : "th"}`;
};

function coverLetterText(student: Student, job: Job) {
  const paragraphs = [
    `Dear ${job.company} Hiring Team,`,
    `I am excited to apply for the ${job.position} position at ${job.company}. I am a ${ordinal(student.studyYear)}-year ${student.major} student at ${student.university} with a ${student.gpa.toFixed(1)} GPA.`,
  ];
  const experience = student.experiences[0];
  if (experience) paragraphs.push(`In my role as ${experience.title} at ${experience.company}, ${experience.description.trim().replace(/^[A-Z]/, (letter) => letter.toLowerCase())}`);
  const project = student.projects[0];
  if (project) paragraphs.push(`I also developed ${project.name}, using ${project.technologies.join(", ")}. ${project.description}`);
  if (job.matchingSkills.length) paragraphs.push(`My profile directly matches ${job.matchingSkills.length} of the role’s ${job.requiredSkills.length} required skills: ${job.matchingSkills.join(", ")}.`);
  const opportunity = job.responsibilities[0] || job.description;
  paragraphs.push(`I am particularly interested in the opportunity to ${opportunity.trim().replace(/^[A-Z]/, (letter) => letter.toLowerCase())}`);
  paragraphs.push(`Thank you for considering my application. I would welcome the opportunity to discuss how my experience and skills could contribute to ${job.company}.`, `Kind regards,\n${student.name}`);
  return paragraphs.join("\n\n");
}

function CoverLetter({ student, job, onClose }: { student: Student; job: Job; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const letter = coverLetterText(student, job);
  const copy = async () => { await navigator.clipboard.writeText(letter); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="letter-modal" role="dialog" aria-modal="true" aria-labelledby="letter-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><span className="eyebrow">Tailored draft</span><h2 id="letter-title">Cover letter</h2><p>{job.position} · {job.company}</p></div><button className="icon-button" onClick={onClose} aria-label="Close cover letter">×</button></header>
      <div className="letter-paper"><div className="letter-mark">P</div><p>{letter}</p></div>
      <footer><span>Review the draft before submitting.</span><button className="secondary-button" onClick={onClose}>Close</button><button className="primary-button" onClick={copy}>{copied ? "Copied!" : "Copy letter"}</button></footer>
    </section>
  </div>;
}

function JobCard({ job, saved, onSave, onOpen, onLetter }: { job: Job; saved: boolean; onSave: () => void; onOpen: () => void; onLetter: () => void }) {
  return <article className="job-card">
    <div className="job-card-top">
      <div className="company-logo" style={{ background: job.companyColour }}>{job.companyInitials}</div>
      <div className="job-title"><div><span>{job.company}</span><h3>{job.position}</h3></div><button className={`save-button ${saved ? "saved" : ""}`} onClick={onSave} aria-label={saved ? "Remove saved job" : "Save job"}>{saved ? "♥" : "♡"}</button></div>
    </div>
    <div className="job-meta"><span>⌖ {job.location}</span><span>◷ {job.workMode}</span><span>{money(job.salaryMin)}–{money(job.salaryMax)}</span></div>
    <div className="match-row"><div className="score-ring" style={{ "--score": `${job.matchScore * 3.6}deg` } as React.CSSProperties}><span>{job.matchScore}%</span></div><div><strong>Required skills match</strong><p>{job.matchingSkills.length} of {job.requiredSkills.length} required skills align</p></div></div>
    <div className="match-reasons">
      {job.matchingSkills.slice(0, 3).map((skill) => <span className="reason-positive" key={skill}>✓ {skill}</span>)}
      {job.missingSkills.slice(0, 1).map((skill) => <span className="reason-gap" key={skill}>↗ Grow {skill}</span>)}
    </div>
    <div className="deadline"><span>Applications close</span><strong>{shortDate(job.applicationDeadline)}</strong></div>
    <div className="card-actions"><button className="text-button" onClick={onLetter}>Create cover letter</button><button className="primary-button" onClick={onOpen}>View match →</button></div>
  </article>;
}

function SkillComparison({ student, job }: { student: Student; job: Job }) {
  const levels = new Map(student.skills.map((skill) => [skill.name.trim().toLowerCase(), skill.level]));
  return <section className="skill-comparison" aria-labelledby="skill-comparison-title">
    <h3 id="skill-comparison-title">Required skills comparison</h3>
    <div className="skill-comparison-summary"><div><strong>{job.matchingSkills.length} of {job.requiredSkills.length}</strong><span>required skills in your profile</span></div><b>{job.matchScore}%</b></div>
    {job.requiredSkills.length === 0 ? <p className="skill-comparison-empty">This job has no required skills listed.</p> : <div className="skill-comparison-groups">
      <div><h4>Matched <span>{job.matchingSkills.length}</span></h4><div className="comparison-skills">{job.matchingSkills.map((skill) => <span className="matched" key={skill}>✓ {skill}<small>{levels.get(skill.trim().toLowerCase())}</small></span>)}</div></div>
      <div><h4>Missing <span>{job.missingSkills.length}</span></h4><div className="comparison-skills">{job.missingSkills.map((skill) => <span className="missing" key={skill}>{skill}</span>)}</div></div>
    </div>}
  </section>;
}

export function CareerDashboard({ initialData }: { initialData: { generatedAt: string; student: Student; jobs: Job[] } }) {
  const router = useRouter();
  const { student, jobs } = initialData;
  const [active, setActive] = useState("Dashboard");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [saved, setSaved] = useState(student.savedJobIds);
  const [selected, setSelected] = useState<Job | null>(null);
  const [letterJob, setLetterJob] = useState<Job | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);
  const visibleJobs = useMemo(() => jobs.filter((job) => {
    const matchesSearch = `${job.position} ${job.company} ${job.location} ${job.requiredSkills.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    return matchesSearch && (!roleFilter || job.position === roleFilter) && (!locationFilter || job.location === locationFilter) && (active !== "Saved" || saved.includes(job.id));
  }), [jobs, query, roleFilter, locationFilter, active, saved]);
  const roles = useMemo(() => [...new Set(jobs.map((job) => job.position))].sort(), [jobs]);
  const locations = useMemo(() => [...new Set(jobs.map((job) => job.location))].sort(), [jobs]);
  const firstName = student.name.split(" ")[0];
  const studentInitials = initials(student.name);
  const completion = profileCompleteness(student);
  const dashboardDate = longDate(initialData.generatedAt);
  const sydneyHour = Number(new Intl.DateTimeFormat("en-AU", { hour: "numeric", hourCycle: "h23", timeZone: "Australia/Sydney" }).format(new Date(initialData.generatedAt)));
  const greeting = sydneyHour < 12 ? "Good morning" : sydneyHour < 18 ? "Good afternoon" : "Good evening";

  const toggleSave = async (id: number) => {
    const shouldSave = !saved.includes(id);
    setSaved((current) => shouldSave ? [...current, id] : current.filter((jobId) => jobId !== id));
    await fetch("/api/saved-jobs", { method: shouldSave ? "POST" : "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: student.id, jobId: id }) });
  };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="logo"><span>p</span><strong>pathway</strong></div>
      <nav aria-label="Primary">
        {[{ name: "Dashboard", icon: "⌂" }, { name: "Matches", icon: "✦" }, { name: "Saved", icon: "♡" }, { name: "Profile", icon: "○" }].map((item) => <button key={item.name} className={active === item.name ? "active" : ""} onClick={() => setActive(item.name)}><i>{item.icon}</i>{item.name}{item.name === "Matches" ? <b>{jobs.length}</b> : null}</button>)}
      </nav>
      <div className="sidebar-user"><span>{studentInitials}</span><div><strong>{student.name}</strong><p>Student account</p></div><button onClick={logout} aria-label="Sign out" title="Sign out">↪</button></div>
    </aside>

    <main className="dashboard-main">
      <header className="topbar"><button className="mobile-logo" onClick={() => setActive("Dashboard")}>p</button><label className="search"><span>⌕</span><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles, companies or skills" aria-label="Search jobs" /><kbd>⌘ K</kbd></label><div className="top-actions"><span className="mini-avatar">{studentInitials}</span></div></header>

      {active === "Profile" ? <section className="profile-view">
        <div className="page-heading"><div><span className="eyebrow">Your story</span><h1>Profile</h1><p>Keep this current so every recommendation tells the right story.</p></div>{!editingProfile ? <button className="primary-button" onClick={() => setEditingProfile(true)}>Edit profile</button> : null}</div>
        {editingProfile ? <ProfileForm profile={student} onCancel={() => setEditingProfile(false)} onSaved={() => setEditingProfile(false)} /> :
        <div className="profile-grid">
          <article className="profile-card identity-card"><span className="large-avatar">{studentInitials}</span><h2>{student.name}</h2><p>{student.major}</p><small>{student.university}</small><div className="completion"><span><b>{completion.score}%</b> complete</span><div><i style={{ width: `${completion.score}%` }} /></div></div>{completion.missing[0] ? <small className="completion-hint">{completion.missing[0]}</small> : null}</article>
          <article className="profile-card"><h2>Career preferences</h2><dl><div><dt>Target roles</dt><dd>{student.preferredPositions.join(", ")}</dd></div><div><dt>Industries</dt><dd>{student.preferredIndustries.join(", ")}</dd></div><div><dt>Locations</dt><dd>{student.preferredLocations.join(", ")}</dd></div><div><dt>Ideal salary</dt><dd>{money(student.salaryMin)}–{money(student.salaryMax)} AUD</dd></div></dl></article>
          <article className="profile-card wide"><h2>Personal, study & work rights</h2><dl className="profile-details"><div><dt>Email</dt><dd>{student.email}</dd></div><div><dt>Study</dt><dd>Year {student.studyYear} · GPA {student.gpa.toFixed(1)} · Graduating {monthYear(student.graduationDate)}</dd></div><div><dt>Visa status</dt><dd>{student.visaStatus}</dd></div><div><dt>Work rights</dt><dd>{student.visaWorkRights}</dd></div><div><dt>Professional links</dt><dd>{student.githubUrl ? <a href={student.githubUrl} target="_blank" rel="noreferrer">GitHub</a> : null}{student.githubUrl && student.linkedinUrl ? " · " : null}{student.linkedinUrl ? <a href={student.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a> : null}{!student.githubUrl && !student.linkedinUrl ? "Not provided" : null}</dd></div></dl></article>
          <article className="profile-card wide"><h2>Skills & strengths</h2><div className="skill-cloud">{student.skills.map((skill) => <span key={skill.name}>{skill.name}<small>{skill.level}</small></span>)}</div></article>
          <article className="profile-card wide"><h2>Experience</h2>{student.experiences.length ? student.experiences.map((experience) => <div className="timeline-item" key={experience.id}><i /><div><strong>{experience.title}</strong><span>{experience.company} · {monthYear(experience.startDate)}–{experience.endDate ? monthYear(experience.endDate) : "Present"}</span><p>{experience.description}</p></div></div>) : <p className="profile-empty">No experience added yet.</p>}</article>
          <article className="profile-card wide"><h2>Projects</h2>{student.projects.length ? student.projects.map((project) => <div className="timeline-item" key={project.id}><i /><div><strong>{project.projectUrl ? <a href={project.projectUrl} target="_blank" rel="noreferrer">{project.name}</a> : project.name}</strong><span>{project.technologies.join(" · ")}</span><p>{project.description}</p></div></div>) : <p className="profile-empty">No projects added yet.</p>}</article>
          <article className="profile-card wide"><h2>Languages & achievements</h2><div className="profile-evidence"><div><h3>Languages</h3>{student.languages.length ? <div className="skill-cloud">{student.languages.map((item) => <span key={item.id}>{item.language}<small>{item.proficiency}</small></span>)}</div> : <p className="profile-empty">No languages added yet.</p>}</div><div><h3>Certificates</h3>{student.certificates.length ? student.certificates.map((item) => <div className="credential-row" key={item.id}><strong>{item.name}</strong><span>{item.issuer} · {monthYear(item.issueDate)}</span></div>) : <p className="profile-empty">No certificates added yet.</p>}</div><div><h3>Awards</h3>{student.awards.length ? student.awards.map((item) => <div className="credential-row" key={item.id}><strong>{item.name}</strong><span>{item.issuer} · {monthYear(item.awardedDate)}</span></div>) : <p className="profile-empty">No awards added yet.</p>}</div></div></article>
        </div>}
      </section> : <>
        <section className="welcome-row"><div><span className="eyebrow">{dashboardDate}</span><h1>{active === "Saved" ? "Your saved opportunities" : active === "Matches" ? "All your matches" : `${greeting}, ${firstName}`} <span>✦</span></h1><p>{active === "Saved" ? "Pick up where you left off." : "Your profile is working hard. Here are the opportunities worth your attention."}</p></div><div className="profile-progress"><div className="avatar">{studentInitials}</div><div><span><strong>Profile strength</strong><b>{completion.score}%</b></span><div className="progress"><i style={{ width: `${completion.score}%` }} /></div><button onClick={() => setActive("Profile")}>{completion.missing[0] ?? "View your complete profile"} →</button></div></div></section>

        {active === "Dashboard" ? <section className="stats-grid"><article><span className="stat-icon purple">✦</span><div><strong>{jobs.length}</strong><p>Available matches</p></div><em>Ranked by required skills</em></article><article><span className="stat-icon peach">♡</span><div><strong>{saved.length}</strong><p>Saved roles</p></div><em>Ready to review</em></article><article><span className="stat-icon blue">↗</span><div><strong>{jobs.filter((job) => job.matchScore >= 85).length}</strong><p>Strong fits</p></div><em>85% match or more</em></article></section> : null}

        <section className="matches-section"><div className="section-heading"><div><span className="eyebrow">Curated for you</span><h2>{active === "Saved" ? "Saved jobs" : "Top matches"}</h2></div><div className="filters"><select className="filter-button" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Filter by role"><option value="">All roles</option>{roles.map((role) => <option key={role}>{role}</option>)}</select><select className="filter-button" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} aria-label="Filter by location"><option value="">All locations</option>{locations.map((location) => <option key={location}>{location}</option>)}</select>{active === "Dashboard" ? <button className="view-all" onClick={() => setActive("Matches")}>View all {jobs.length} matches →</button> : null}</div></div>
          {visibleJobs.length ? <div className="jobs-grid">{visibleJobs.map((job) => <JobCard key={job.id} job={job} saved={saved.includes(job.id)} onSave={() => toggleSave(job.id)} onOpen={() => setSelected(job)} onLetter={() => setLetterJob(job)} />)}</div> : <div className="empty-state"><span>⌕</span><h3>No opportunities found</h3><p>Try a different search or save a role to see it here.</p></div>}
        </section>
      </>}
    </main>

    {selected ? <div className="detail-drawer" role="dialog" aria-modal="true" aria-label="Job match details"><button className="drawer-close" onClick={() => setSelected(null)}>×</button><div className="company-logo large" style={{ background: selected.companyColour }}>{selected.companyInitials}</div><span className="eyebrow">{selected.matchScore}% required skills match</span><h2>{selected.position}</h2><p className="drawer-company">{selected.company} · {selected.location} · {selected.workMode}</p><div className="drawer-summary">{selected.description}</div><SkillComparison student={student} job={selected} /><div className="job-facts"><span><small>Experience</small>{selected.yearsExperience === 0 ? "Graduate friendly" : `${selected.yearsExperience}+ years`}</span><span><small>Salary</small>{money(selected.salaryMin)}–{money(selected.salaryMax)}</span><span><small>Visa</small>{selected.visaRequirement}</span></div><div className="drawer-actions"><button className="secondary-button" onClick={() => toggleSave(selected.id)}>{saved.includes(selected.id) ? "Saved ♥" : "Save job"}</button><button className="primary-button" onClick={() => setLetterJob(selected)}>Create cover letter</button></div></div> : null}
    {selected ? <button className="drawer-scrim" aria-label="Close job details" onClick={() => setSelected(null)} /> : null}
    {letterJob ? <CoverLetter student={student} job={letterJob} onClose={() => setLetterJob(null)} /> : null}
  </div>;
}
