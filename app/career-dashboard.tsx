"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "./profile-form";

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

function CoverLetter({ student, job, onClose }: { student: Student; job: Job; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const letter = `Dear ${job.company} Hiring Team,\n\nI am excited to apply for the ${job.position} position at ${job.company}. As a third-year ${student.major} student at ${student.university}, I bring a strong academic foundation, a ${student.gpa.toFixed(1)} GPA, and hands-on experience turning data into decisions.\n\nDuring my internship at ${student.experiences[0]?.company}, I built SQL reporting pipelines and Tableau dashboards for a commercial team. This experience, together with my projects in ${student.skills.slice(0, 3).map((skill) => skill.name).join(", ")}, aligns closely with your need for ${job.matchingSkills.join(", ")}. I am especially drawn to the opportunity to ${job.responsibilities[0]?.toLowerCase()}.\n\nI would welcome the chance to bring my analytical curiosity, clear communication, and collaborative approach to ${job.company}. Thank you for considering my application.\n\nKind regards,\n${student.name}`;
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

export function CareerDashboard({ initialData }: { initialData: { student: Student; jobs: Job[] } }) {
  const router = useRouter();
  const { student, jobs } = initialData;
  const [active, setActive] = useState("Dashboard");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(student.savedJobIds);
  const [selected, setSelected] = useState<Job | null>(null);
  const [letterJob, setLetterJob] = useState<Job | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const visibleJobs = useMemo(() => jobs.filter((job) => {
    const matchesSearch = `${job.position} ${job.company} ${job.location} ${job.requiredSkills.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    return matchesSearch && (active !== "Saved" || saved.includes(job.id));
  }), [jobs, query, active, saved]);
  const firstName = student.name.split(" ")[0];

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
      <div className="sidebar-support"><span>?</span><div><strong>Need a hand?</strong><p>Visit the student guide</p></div></div>
      <div className="sidebar-user"><span>MC</span><div><strong>{student.name}</strong><p>Student account</p></div><button onClick={logout} aria-label="Sign out" title="Sign out">↪</button></div>
    </aside>

    <main className="dashboard-main">
      <header className="topbar"><button className="mobile-logo" onClick={() => setActive("Dashboard")}>p</button><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles, companies or skills" aria-label="Search jobs" /><kbd>⌘ K</kbd></label><div className="top-actions"><button aria-label="Notifications">♧<i /></button><span className="mini-avatar">MC</span></div></header>

      {active === "Profile" ? <section className="profile-view">
        <div className="page-heading"><div><span className="eyebrow">Your story</span><h1>Profile</h1><p>Keep this current so every recommendation tells the right story.</p></div>{!editingProfile ? <button className="primary-button" onClick={() => setEditingProfile(true)}>Edit profile</button> : null}</div>
        {editingProfile ? <ProfileForm profile={student} onCancel={() => setEditingProfile(false)} /> :
        <div className="profile-grid"><article className="profile-card identity-card"><span className="large-avatar">MC</span><h2>{student.name}</h2><p>{student.major}</p><small>{student.university}</small><div className="completion"><span><b>86%</b> complete</span><div><i /></div></div></article>
        <article className="profile-card"><h2>Career preferences</h2><dl><div><dt>Target roles</dt><dd>{student.preferredPositions.join(", ")}</dd></div><div><dt>Industries</dt><dd>{student.preferredIndustries.join(", ")}</dd></div><div><dt>Locations</dt><dd>{student.preferredLocations.join(", ")}</dd></div><div><dt>Ideal salary</dt><dd>{money(student.salaryMin)}–{money(student.salaryMax)} AUD</dd></div></dl></article>
        <article className="profile-card wide"><h2>Skills & strengths</h2><div className="skill-cloud">{student.skills.map((skill) => <span key={skill.name}>{skill.name}<small>{skill.level}</small></span>)}</div></article>
        <article className="profile-card wide"><h2>Experience & projects</h2>{student.experiences.map((experience) => <div className="timeline-item" key={experience.id}><i /><div><strong>{experience.title}</strong><span>{experience.company}</span><p>{experience.description}</p></div></div>)}{student.projects.map((project) => <div className="timeline-item" key={project.id}><i /><div><strong>{project.name}</strong><span>Project · {project.technologies.join(" · ")}</span><p>{project.description}</p></div></div>)}</article></div>}
      </section> : <>
        <section className="welcome-row"><div><span className="eyebrow">Sunday, 9 August</span><h1>{active === "Saved" ? "Your saved opportunities" : active === "Matches" ? "All your matches" : `Good morning, ${firstName}`} <span>✦</span></h1><p>{active === "Saved" ? "Pick up where you left off." : "Your profile is working hard. Here are the opportunities worth your attention."}</p></div><div className="profile-progress"><div className="avatar">MC</div><div><span><strong>Profile strength</strong><b>86%</b></span><div className="progress"><i /></div><button onClick={() => setActive("Profile")}>Complete your profile →</button></div></div></section>

        {active === "Dashboard" ? <section className="stats-grid"><article><span className="stat-icon purple">✦</span><div><strong>{jobs.length}</strong><p>New matches</p></div><em>+{Math.max(1, jobs.length - 1)} this week</em></article><article><span className="stat-icon peach">♡</span><div><strong>{saved.length}</strong><p>Saved roles</p></div><em>Ready to review</em></article><article><span className="stat-icon blue">↗</span><div><strong>{jobs.filter((job) => job.matchScore >= 85).length}</strong><p>Strong fits</p></div><em>85% match or more</em></article></section> : null}

        <section className="matches-section"><div className="section-heading"><div><span className="eyebrow">Curated for you</span><h2>{active === "Saved" ? "Saved jobs" : "Top matches"}</h2></div><div className="filters"><button className="filter-button">All roles⌄</button><button className="filter-button">Sydney⌄</button>{active === "Dashboard" ? <button className="view-all" onClick={() => setActive("Matches")}>View all {jobs.length} matches →</button> : null}</div></div>
          {visibleJobs.length ? <div className="jobs-grid">{visibleJobs.map((job) => <JobCard key={job.id} job={job} saved={saved.includes(job.id)} onSave={() => toggleSave(job.id)} onOpen={() => setSelected(job)} onLetter={() => setLetterJob(job)} />)}</div> : <div className="empty-state"><span>⌕</span><h3>No opportunities found</h3><p>Try a different search or save a role to see it here.</p></div>}
        </section>
      </>}
    </main>

    {selected ? <div className="detail-drawer" role="dialog" aria-modal="true" aria-label="Job match details"><button className="drawer-close" onClick={() => setSelected(null)}>×</button><div className="company-logo large" style={{ background: selected.companyColour }}>{selected.companyInitials}</div><span className="eyebrow">{selected.matchScore}% required skills match</span><h2>{selected.position}</h2><p className="drawer-company">{selected.company} · {selected.location} · {selected.workMode}</p><div className="drawer-summary">{selected.description}</div><h3>Required skills comparison</h3><ul className="fit-list">{selected.matchingSkills.map((skill) => <li key={skill}><span>✓</span><div><strong>{skill} is a direct match</strong><p>Your profile includes this required skill.</p></div></li>)}{selected.missingSkills.map((skill) => <li className="gap" key={skill}><span>↗</span><div><strong>{skill} is an opportunity to grow</strong><p>This required skill is not currently listed in your profile.</p></div></li>)}</ul><div className="job-facts"><span><small>Experience</small>{selected.yearsExperience === 0 ? "Graduate friendly" : `${selected.yearsExperience}+ years`}</span><span><small>Salary</small>{money(selected.salaryMin)}–{money(selected.salaryMax)}</span><span><small>Visa</small>{selected.visaRequirement}</span></div><div className="drawer-actions"><button className="secondary-button" onClick={() => toggleSave(selected.id)}>{saved.includes(selected.id) ? "Saved ♥" : "Save job"}</button><button className="primary-button" onClick={() => setLetterJob(selected)}>Create cover letter</button></div></div> : null}
    {selected ? <button className="drawer-scrim" aria-label="Close job details" onClick={() => setSelected(null)} /> : null}
    {letterJob ? <CoverLetter student={student} job={letterJob} onClose={() => setLetterJob(null)} /> : null}
  </div>;
}
