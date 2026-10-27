"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, CheckCircle2, ClipboardCheck, Copy, Heart, LockKeyhole, MessageCircle, Send, ShieldCheck, Sparkles } from "lucide-react";
import { semesters } from "@/lib/demo-data";

type ApiResult = { error?: string; reference?: string; status?: string; answer?: string; createdAt?: string };

export function QuestionSection({ onSubmitted }: { onSubmitted: (reference: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [copied, setCopied] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data.entries())) });
      const result: ApiResult = await response.json();
      if (!response.ok || !result.reference) throw new Error(result.error || "Something went wrong. Please try again.");
      setReference(result.reference);
      try { localStorage.setItem("campus-connect-reference", result.reference); } catch { /* The code is also shown on screen. */ }
      onSubmitted(result.reference);
      form.reset();
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(reference); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
  }

  return (
    <section className="question-section section-space" id="ask" data-reveal>
      <div className="question-intro">
        <div className="eyebrow light"><Sparkles size={14} /> WE&apos;RE HERE TO HELP</div>
        <h2>Have a question?<br /><span>Let&apos;s figure it out.</span></h2>
        <p>Big question or small doubt, you don&apos;t have to figure it out alone. Send it our way and keep track of the response.</p>
        <div className="question-benefits">
          <div><span><MessageCircle size={17} /></span><div><strong>Ask anything academic</strong><small>Share the details that matter.</small></div></div>
          <div><span><ClipboardCheck size={17} /></span><div><strong>Track your question</strong><small>Get a private reference code.</small></div></div>
          <div><span><ShieldCheck size={17} /></span><div><strong>No account needed</strong><small>Simple, accessible student support.</small></div></div>
        </div>
        <div className="question-decoration"><span></span><span></span><span></span></div>
      </div>
      <div className="question-form-card">
        {reference ? (
          <div className="success-panel" role="status">
            <div className="success-icon"><CheckCircle2 size={28} /></div>
            <span className="mini-eyebrow">QUESTION RECEIVED</span>
            <h3>You&apos;re all set!</h3>
            <p>Your question has been saved. Keep this private code to check for an answer later.</p>
            <div className="reference-box"><code>{reference}</code><button type="button" onClick={copy} aria-label="Copy reference code">{copied ? <Check size={17} /> : <Copy size={17} />}</button></div>
            <div className="success-actions"><a href="#track" className="primary-button">Track my question <ArrowRight size={16} /></a><button type="button" className="text-button" onClick={() => setReference("")}>Ask another</button></div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="form-heading"><div><span className="mini-eyebrow">STUDENT SUPPORT</span><h3>Ask a question</h3><p>Tell us what you need help with.</p></div><span className="form-heading-icon"><MessageCircle size={21} /></span></div>
            <label className="field-label" htmlFor="student-question">Your question <span>*</span></label>
            <textarea id="student-question" name="question" rows={3} minLength={10} maxLength={2000} required placeholder="What would you like to know?" />
            <div className="form-row">
              <div><label className="field-label" htmlFor="student-semester">Semester <span>*</span></label><select id="student-semester" name="semester" required defaultValue=""><option value="" disabled>Select semester</option>{semesters.map(s => <option key={s}>{s}</option>)}<option>Other / not sure</option></select></div>
              <div><label className="field-label" htmlFor="student-subject">Subject <span>*</span></label><input id="student-subject" name="subject" required maxLength={120} placeholder="e.g. Economics" /></div>
            </div>
            <label className="field-label" htmlFor="student-contact">Email or contact <em>(optional)</em></label>
            <input id="student-contact" name="contact" maxLength={160} placeholder="Only if you would like to share" />
            <p className="privacy-note"><LockKeyhole size={13} /> Visible to administrators only. Please don&apos;t share sensitive IDs or passwords.</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button submit-button" disabled={busy} type="submit">{busy ? "Sending..." : "Submit question"} <Send size={16} /></button>
          </form>
        )}
      </div>
    </section>
  );
}

export function TrackingCard({ initialReference }: { initialReference: string }) {
  const [reference, setReference] = useState(initialReference);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (initialReference) setReference(initialReference); }, [initialReference]);
  async function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setResult(null);
    try {
      const response = await fetch(`/api/questions?reference=${encodeURIComponent(reference.trim())}`, { cache: "no-store" });
      const data: ApiResult = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to find your question.");
      setResult(data);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to track your question."); }
    finally { setBusy(false); }
  }
  const stage = result?.status === "Answered" ? 2 : result?.status === "In Progress" ? 1 : 0;
  return (
    <section className="surface-card tracking-card" id="track" data-reveal>
      <div className="card-topline"><span className="soft-icon blue"><ClipboardCheck size={20} /></span><span className="tiny-pill">NO LOGIN NEEDED</span></div>
      <h3>Track your question</h3><p>Have a reference code? See where your question stands.</p>
      <form className="tracking-form" onSubmit={track}>
        <label htmlFor="reference-code" className="sr-only">Question reference code</label>
        <input id="reference-code" value={reference} onChange={e => setReference(e.target.value)} placeholder="Enter your reference code" required autoComplete="off" />
        <button className="primary-button" disabled={busy}>{busy ? "Checking..." : "Check status"} <ArrowRight size={15} /></button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {result && <div className="tracking-result" role="status"><div className="tracking-result-title"><strong>Current status</strong><span className="status-pill">{result.status}</span></div><div className="status-steps">{["Received", "In Progress", "Answered"].map((label, i) => <div className={i <= stage ? "done" : ""} key={label}><span>{i < stage ? <Check size={12} /> : i + 1}</span>{label}</div>)}</div>{result.answer && <div className="answer-box"><strong>Response</strong><p>{result.answer}</p></div>}{!result.answer && <p className="result-note">Your question is in the queue. Check back using this code.</p>}</div>}
    </section>
  );
}

export function FeedbackCard() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data.entries())) });
      const result: ApiResult = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send feedback.");
      setSent(true); form.reset();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not send feedback."); }
    finally { setBusy(false); }
  }
  return (
    <section className="surface-card feedback-card" id="feedback" data-reveal>
      <div className="card-topline"><span className="soft-icon pink"><Heart size={20} /></span><span className="tiny-pill pink-pill">YOUR VOICE MATTERS</span></div>
      <h3>Help us make this better</h3><p>Have an idea? We&apos;d love to hear what would make student life easier.</p>
      {sent ? <div className="feedback-thanks" role="status"><CheckCircle2 size={20} /> Thanks for helping us improve! <button type="button" onClick={() => setSent(false)}>Send another</button></div> : <form onSubmit={submit}><label className="sr-only" htmlFor="feedback-message">Your feedback</label><textarea id="feedback-message" name="message" rows={2} required minLength={5} maxLength={2000} placeholder="Share your suggestion..." /><label className="sr-only" htmlFor="feedback-contact">Contact information, optional</label><input id="feedback-contact" name="contact" maxLength={160} placeholder="Email or contact (optional)" />{error && <p className="form-error" role="alert">{error}</p>}<button className="outline-button" disabled={busy}>{busy ? "Sending..." : "Send feedback"} <ArrowRight size={15} /></button></form>}
    </section>
  );
}
