"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, CheckCircle2, CircleHelp, ClipboardCheck, Copy, FileText, GraduationCap, LayoutDashboard, Link2, LockKeyhole, LogOut, MessageCircle, Pencil, Plus, Save, Settings2, Trash2, X } from "lucide-react";
import { semesters, type Notice, type Resource } from "@/lib/demo-data";
import { defaultSettings } from "@/lib/site-defaults";
import AdminContent, { type ContentTab, type EditableContent } from "@/components/admin-content";

type Question = { id: number; reference: string; question: string; semester: string; subject: string; contact: string | null; status: string; answer: string; createdAt: string; updatedAt: string };
type Feedback = { id: number; message: string; contact: string | null; createdAt: string };
type AdminData = { questions: Question[]; notices: Notice[]; resources: Resource[]; feedback: Feedback[] } & EditableContent;
type Tab = "questions" | "notices" | "resources" | "feedback" | ContentTab;
const emptyData: AdminData = { questions: [], notices: [], resources: [], feedback: [], links: [], faqs: [], events: [], settings: defaultSettings };

function formatDate(value: string) { const d = new Date(value); return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

function QuestionEditor({ item, onSave, onDelete }: { item: Question; onSave: (id: number, status: string, answer: string) => Promise<void>; onDelete: (id: number) => void }) {
  const [status, setStatus] = useState(item.status);
  const [answer, setAnswer] = useState(item.answer);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setStatus(item.status); setAnswer(item.answer); }, [item.id, item.status, item.answer]);
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); await onSave(item.id, status, answer); setSaving(false); }
  return <article className="admin-item question-admin-item"><div className="admin-item-head"><div><span className="admin-ref">{item.reference}</span><h3>{item.subject} <span>· {item.semester}</span></h3></div><div className="admin-question-actions"><span className="status-pill">{item.status}</span><div className="admin-item-actions"><button type="button" onClick={() => onDelete(item.id)} aria-label={`Delete question ${item.reference}`}><Trash2 size={15} /></button></div></div></div><p className="admin-question-text">{item.question}</p><div className="admin-meta">Submitted {formatDate(item.createdAt)} {item.contact ? ` · Contact: ${item.contact}` : " · No contact provided"}</div><form onSubmit={submit} className="admin-answer-form"><div><label className="field-label" htmlFor={`status-${item.id}`}>Status</label><select id={`status-${item.id}`} value={status} onChange={e => setStatus(e.target.value)}><option>Received</option><option>In Progress</option><option>Answered</option></select></div><div><label className="field-label" htmlFor={`answer-${item.id}`}>Answer {status === "Answered" && "(required)"}</label><textarea id={`answer-${item.id}`} value={answer} onChange={e => setAnswer(e.target.value)} rows={3} maxLength={3000} placeholder="Write a helpful response for the student..." /></div><button className="primary-button" disabled={saving}><Save size={14} /> {saving ? "Saving..." : "Save response"}</button></form></article>;
}

export default function AdminPortal() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const [tab, setTab] = useState<Tab>("questions");
  const [data, setData] = useState<AdminData>(emptyData);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  async function load() {
    try {
      const response = await fetch("/api/admin/data", { cache: "no-store" });
      if (response.status === 401) { setAuthorized(false); return; }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load admin data.");
      setData(result); setAuthorized(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load admin data."); }
    finally { setLoading(false); }
  }
  useEffect(() => { setSiteUrl(window.location.origin); void load(); }, []);
  async function copySiteLink() {
    try { await navigator.clipboard.writeText(siteUrl); setCopyState("copied"); window.setTimeout(() => setCopyState("idle"), 2500); }
    catch { setCopyState("manual"); }
  }

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sign in failed.");
      setPassword(""); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Sign in failed."); }
    finally { setBusy(false); }
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); setAuthorized(false); setData(emptyData); setMessage(""); }
  async function mutate(method: string, body: Record<string, unknown>, success: string) {
    setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/data", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) { if (response.status === 401) setAuthorized(false); throw new Error(result.error || "Something went wrong."); }
      setMessage(success); await load(); return true;
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); return false; }
  }
  async function saveQuestion(id: number, status: string, answer: string) { await mutate("PATCH", { type: "question", id, status, answer }, "Question updated successfully."); }
  async function saveItem(event: FormEvent<HTMLFormElement>, type: "notice" | "resource") {
    event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form).entries());
    const editing = type === "notice" ? editingNotice : editingResource;
    setBusy(true);
    const ok = await mutate(editing ? "PATCH" : "POST", { ...values, type, ...(editing ? { id: editing.id } : {}) }, `${type === "notice" ? "Notice" : "Resource"} ${editing ? "updated" : "added"} successfully.`);
    if (ok) { form.reset(); if (type === "notice") setEditingNotice(null); else setEditingResource(null); }
    setBusy(false);
  }
  async function remove(type: "notice" | "resource" | "question" | "feedback", id: number) { if (window.confirm(`Delete this ${type}? This cannot be undone.`)) await mutate("DELETE", { type, id }, `${type[0].toUpperCase() + type.slice(1)} deleted.`); }
  function editNotice(item: Notice) { setEditingNotice(item); document.getElementById("notice-form")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  function editResource(item: Resource) { setEditingResource(item); document.getElementById("resource-form")?.scrollIntoView({ behavior: "smooth", block: "start" }); }

  if (loading) return <main className="admin-login-page"><div className="admin-loading">Loading admin dashboard...</div></main>;
  if (!authorized) return <main className="admin-login-page"><a className="admin-back" href="/"><ArrowLeft size={16} /> Back to student hub</a><div className="admin-login-card"><div className="admin-logo"><span className="brand-mark"><GraduationCap size={22} /></span><strong>Campus<span>Connect</span>.</strong></div><span className="admin-login-icon"><LockKeyhole size={23} /></span><div className="mini-eyebrow">PROTECTED ACCESS</div><h1>Admin sign in</h1><p>Manage your links, notices, resources and student questions from one place.</p><form onSubmit={login}><label className="field-label" htmlFor="admin-password">Administrator password</label><input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Enter your password" />{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" disabled={busy}>{busy ? "Signing in..." : "Sign in securely"} <ArrowLeft className="arrow-flip" size={15} /></button></form><div className="admin-config-note">First-time setup: set an ADMIN_PASSWORD (at least 12 characters) and a different ADMIN_SESSION_SECRET (at least 32 characters) in your server environment, then restart or redeploy. <a href="/setup">See the free hosting &amp; setup guide <ArrowUpRight size={12} /></a></div></div></main>;

  const tabs: { id: Tab; label: string; count: number | null; icon: typeof MessageCircle }[] = [
    { id: "questions", label: "Questions", count: data.questions.length, icon: MessageCircle },
    { id: "notices", label: "Notices", count: data.notices.length, icon: FileText },
    { id: "resources", label: "Resources", count: data.resources.length, icon: LayoutDashboard },
    { id: "links", label: "Links", count: data.links.length, icon: Link2 },
    { id: "events", label: "Events", count: data.events.length, icon: CalendarDays },
    { id: "faqs", label: "FAQs", count: data.faqs.length, icon: CircleHelp },
    { id: "settings", label: "Homepage", count: null, icon: Settings2 },
    { id: "feedback", label: "Feedback", count: data.feedback.length, icon: ClipboardCheck },
  ];
  return <div className="admin-shell"><header className="admin-header"><a className="admin-logo" href="/"><span className="brand-mark"><GraduationCap size={21} /></span><strong>Campus<span>Connect</span>.</strong><em>ADMIN</em></a><div><a href="/" className="admin-view-site">View student hub <ArrowLeft className="arrow-flip" size={14} /></a><button onClick={logout}><LogOut size={16} /> Sign out</button></div></header><main className="admin-main"><div className="admin-title-row"><div><div className="mini-eyebrow">STUDENT SUPPORT</div><h1>Admin dashboard</h1><p>Add, edit or remove content whenever you need. Changes are saved to your student hub.</p></div><span className="admin-secure"><LockKeyhole size={14} /> Protected session</span></div><div className="admin-share-card"><div className="admin-share-intro"><span><Link2 size={18} /></span><div><strong>Current website link</strong><small>Preview links may be temporary. Share your production link after deploying.</small></div></div><div className="admin-share-input"><label className="sr-only" htmlFor="admin-site-link">Current website link</label><input id="admin-site-link" readOnly value={siteUrl} onFocus={e => e.currentTarget.select()} /><button type="button" onClick={copySiteLink} disabled={!siteUrl}>{copyState === "copied" ? <Check size={15} /> : <Copy size={15} />}{copyState === "copied" ? "Copied" : "Copy link"}</button></div><a href="/setup">Free hosting guide <ArrowUpRight size={13} /></a>{copyState === "manual" && <small className="admin-copy-hint" role="status">Select the link above to copy it manually.</small>}</div><div className="admin-tabs" role="tablist" aria-label="Admin sections">{tabs.map(item => <button role="tab" aria-selected={tab === item.id} key={item.id} className={tab === item.id ? "active" : ""} onClick={() => { setTab(item.id); setError(""); setMessage(""); }}><item.icon size={16} /> {item.label} {item.count !== null && <span>{item.count}</span>}</button>)}</div>{error && <div className="admin-alert error" role="alert">{error}</div>}{message && <div className="admin-alert success" role="status"><CheckCircle2 size={16} /> {message}</div>}
    {tab === "questions" && <section><div className="admin-section-heading"><div><h2>Student questions</h2><p>Update the status and write an answer. Students can see the response using their reference code.</p></div></div><div className="admin-list">{data.questions.length ? data.questions.map(item => <QuestionEditor key={item.id} item={item} onSave={saveQuestion} onDelete={id => void remove("question", id)} />) : <div className="admin-empty"><MessageCircle size={24} /><strong>No questions yet</strong><p>New student submissions will appear here.</p></div>}</div></section>}
    {tab === "notices" && <section><div className="admin-section-heading"><div><h2>Notice board</h2><p>Only publish verified information. Link directly to an approved official source.</p></div></div><div className="admin-columns"><form id="notice-form" className="admin-editor" onSubmit={e => saveItem(e, "notice")} key={editingNotice?.id || "new-notice"}><div className="editor-heading"><h3>{editingNotice ? "Edit notice" : "Add a notice"}</h3>{editingNotice && <button type="button" onClick={() => setEditingNotice(null)}><X size={16} /></button>}</div><label className="field-label" htmlFor="notice-title">Title</label><input id="notice-title" name="title" defaultValue={editingNotice?.title} required maxLength={180} placeholder="Notice title" /><label className="field-label" htmlFor="notice-summary">Summary</label><textarea id="notice-summary" name="summary" defaultValue={editingNotice?.summary} required maxLength={1200} rows={3} placeholder="A short, accurate summary" /><div className="form-row"><div><label className="field-label" htmlFor="notice-category">Category</label><select id="notice-category" name="category" defaultValue={editingNotice?.category || "General"}>{["General", "Examination", "Admissions", "Scholarship", "Academics"].map(v => <option key={v}>{v}</option>)}</select></div><div><label className="field-label" htmlFor="notice-date">Publication date</label><input id="notice-date" type="date" name="publishedDate" defaultValue={editingNotice?.publishedDate} required /></div></div><label className="field-label" htmlFor="notice-source">Official source URL</label><input id="notice-source" name="sourceUrl" type="url" defaultValue={editingNotice?.sourceUrl} required placeholder="https://ddugu.ac.in/..." /><p className="admin-hint">Use an official DDUGU, DDUGU admissions or UP scholarship HTTPS link.</p><button className="primary-button" disabled={busy}><Plus size={15} /> {editingNotice ? "Save changes" : "Publish notice"}</button></form><div className="admin-list">{data.notices.length ? data.notices.map(item => <article className="admin-item" key={item.id}><div className="admin-item-head"><div><span className="admin-ref">{item.category} · {item.publishedDate}</span><h3>{item.title}</h3></div><div className="admin-item-actions"><button onClick={() => editNotice(item)} aria-label={`Edit ${item.title}`}><Pencil size={15} /></button><button onClick={() => remove("notice", item.id)} aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button></div></div><p>{item.summary}</p><a className="admin-source" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Open official source ↗</a></article>) : <div className="admin-empty"><FileText size={24} /><strong>No notices published</strong><p>The student hub currently shows clearly labeled examples.</p></div>}</div></div></section>}
    {tab === "resources" && <section><div className="admin-section-heading"><div><h2>Academic resources</h2><p>Add useful material and clearly verify its source before sharing.</p></div></div><div className="admin-columns"><form id="resource-form" className="admin-editor" onSubmit={e => saveItem(e, "resource")} key={editingResource?.id || "new-resource"}><div className="editor-heading"><h3>{editingResource ? "Edit resource" : "Add a resource"}</h3>{editingResource && <button type="button" onClick={() => setEditingResource(null)}><X size={16} /></button>}</div><label className="field-label" htmlFor="resource-title-admin">Title</label><input id="resource-title-admin" name="title" defaultValue={editingResource?.title} required maxLength={180} placeholder="Resource title" /><div className="form-row"><div><label className="field-label" htmlFor="resource-subject-admin">Subject</label><input id="resource-subject-admin" name="subject" defaultValue={editingResource?.subject} required maxLength={120} placeholder="e.g. Economics" /></div><div><label className="field-label" htmlFor="resource-semester-admin">Semester</label><select id="resource-semester-admin" name="semester" defaultValue={editingResource?.semester || "Semester 1"}>{semesters.map(v => <option key={v}>{v}</option>)}</select></div></div><label className="field-label" htmlFor="resource-category-admin">Category</label><select id="resource-category-admin" name="category" defaultValue={editingResource?.category || "Notes"}>{["Notes", "Syllabus", "Assignment", "Previous papers"].map(v => <option key={v}>{v}</option>)}</select><label className="field-label" htmlFor="resource-description-admin">Description</label><textarea id="resource-description-admin" name="description" defaultValue={editingResource?.description} required maxLength={1200} rows={3} placeholder="Describe this resource" /><label className="field-label" htmlFor="resource-url-admin">Resource URL</label><input id="resource-url-admin" name="url" type="url" defaultValue={editingResource?.url} required placeholder="https://..." /><p className="admin-hint">HTTPS links only. Shared resources are labeled as such for students.</p><button className="primary-button" disabled={busy}><Plus size={15} /> {editingResource ? "Save changes" : "Add resource"}</button></form><div className="admin-list">{data.resources.length ? data.resources.map(item => <article className="admin-item" key={item.id}><div className="admin-item-head"><div><span className="admin-ref">{item.category} · {item.semester}</span><h3>{item.title}</h3></div><div className="admin-item-actions"><button onClick={() => editResource(item)} aria-label={`Edit ${item.title}`}><Pencil size={15} /></button><button onClick={() => remove("resource", item.id)} aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button></div></div><p>{item.subject} · {item.description}</p><a className="admin-source" href={item.url} target="_blank" rel="noopener noreferrer">Open resource ↗</a></article>) : <div className="admin-empty"><LayoutDashboard size={24} /><strong>No resources added</strong><p>The student hub currently shows clearly labeled examples.</p></div>}</div></div></section>}
    {(tab === "links" || tab === "faqs" || tab === "events" || tab === "settings") && <AdminContent tab={tab} data={data} mutate={mutate} />}
    {tab === "feedback" && <section><div className="admin-section-heading"><div><h2>Student feedback</h2><p>Ideas and suggestions shared by students.</p></div></div><div className="admin-list">{data.feedback.length ? data.feedback.map(item => <article className="admin-item" key={item.id}><div className="admin-item-head"><span className="admin-ref">{formatDate(item.createdAt)}</span><div className="admin-item-actions"><button type="button" onClick={() => void remove("feedback", item.id)} aria-label="Delete feedback"><Trash2 size={15} /></button></div></div><p className="admin-question-text">{item.message}</p><div className="admin-meta">{item.contact ? `Contact: ${item.contact}` : "No contact provided"}</div></article>) : <div className="admin-empty"><ClipboardCheck size={24} /><strong>No feedback yet</strong><p>Student suggestions will appear here.</p></div>}</div></section>}
  </main></div>;
}
