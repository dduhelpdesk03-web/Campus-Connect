"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BadgeIndianRupee, Bell, BookOpen, BookOpenText,
  CalendarDays, Check, ChevronDown, ChevronRight, CircleHelp, ClipboardCheck, ExternalLink,
  FileQuestion, FileText, FolderOpen, Globe2, GraduationCap, Heart, LayoutDashboard, Link2,
  LockKeyhole, Menu, MessageCircle, MessageSquareHeart, NotebookPen, Search, ShieldCheck, SlidersHorizontal,
  Sparkles, X,
} from "lucide-react";
import { demoNotices, demoResources, semesters, type Notice, type Resource } from "@/lib/demo-data";
import { FeedbackCard, QuestionSection, TrackingCard } from "@/components/student-forms";
import { defaultFaqs, defaultLinks, defaultSettings, type SiteEvent, type SiteFaq, type SiteLink, type SiteSettings } from "@/lib/site-defaults";

const navMain = [
  { label: "Dashboard", href: "#dashboard", icon: LayoutDashboard },
  { label: "Academic resources", href: "#resources", icon: BookOpenText },
  { label: "Important links", href: "#links", icon: Link2 },
  { label: "Notice board", href: "#notices", icon: FileText },
  { label: "Ask a question", href: "#ask", icon: MessageCircle },
];
const navSupport = [
  { label: "Track a question", href: "#track", icon: ClipboardCheck },
  { label: "FAQs", href: "#faq", icon: CircleHelp },
  { label: "Send feedback", href: "#feedback", icon: MessageSquareHeart },
  { label: "Manage content", href: "/admin", icon: LockKeyhole },
];
function Brand() {
  return <a href="#dashboard" className="brand" aria-label="CampusConnect home"><span className="brand-mark"><GraduationCap size={22} strokeWidth={2.1} /></span><span className="brand-copy"><strong>Campus<span>Connect</span><i>.</i></strong><small>DDU STUDENT HUB</small></span></a>;
}
function SectionHeading({ eyebrow, title, description, action, href }: { eyebrow?: string; title: string; description?: string; action?: string; href?: string }) {
  return <div className="section-heading"><div>{eyebrow && <div className="mini-eyebrow">{eyebrow}</div>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{action && href && <a className="section-link" href={href}>{action} <ArrowRight size={15} /></a>}</div>;
}
function categoryIcon(category: string) {
  if (category === "Syllabus") return <BookOpen size={20} />;
  if (category === "Assignment") return <NotebookPen size={20} />;
  if (category === "Previous papers") return <FileQuestion size={20} />;
  return <FileText size={20} />;
}
function categoryColor(category: string) {
  if (category === "Syllabus" || category === "Scholarship") return "green";
  if (category === "Assignment" || category === "Examination") return "orange";
  if (category === "Previous papers" || category === "Academics") return "purple";
  return "blue";
}
function linkAppearance(icon: string) {
  if (icon === "university") return { icon: Globe2, color: "blue" };
  if (icon === "examination") return { icon: ClipboardCheck, color: "purple" };
  if (icon === "results") return { icon: GraduationCap, color: "orange" };
  if (icon === "scholarship") return { icon: BadgeIndianRupee, color: "green" };
  if (icon === "admission") return { icon: NotebookPen, color: "pink" };
  return { icon: Link2, color: "blue" };
}
function displayDate(date: string) {
  if (!date) return "Demo only";
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export default function StudentPortal() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [headerSearch, setHeaderSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const headerSearchRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [category, setCategory] = useState("");
  const [notices, setNotices] = useState<Notice[]>(demoNotices);
  const [resources, setResources] = useState<Resource[]>(demoResources);
  const [links, setLinks] = useState<SiteLink[]>(defaultLinks.map((item, i) => ({ ...item, id: -i - 1, official: true })));
  const [faqs, setFaqs] = useState<SiteFaq[]>(defaultFaqs.map((item, i) => ({ ...item, id: -i - 1 })));
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [contentUnavailable, setContentUnavailable] = useState(false);
  const [lastReference, setLastReference] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content", { cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error("unavailable");
      return response.json() as Promise<{ notices: Notice[]; resources: Resource[]; links: SiteLink[]; faqs: SiteFaq[]; events: SiteEvent[]; settings: SiteSettings }>;
    }).then(data => {
      if (cancelled) return;
      const savedSettings = data.settings || defaultSettings;
      setSettings(savedSettings);
      setNotices(data.notices.length ? data.notices : savedSettings.showDemoContent ? demoNotices : []);
      setResources(data.resources.length ? data.resources : savedSettings.showDemoContent ? demoResources : []);
      setLinks(data.links); setFaqs(data.faqs); setEvents(data.events);
    }).catch(() => { if (!cancelled) setContentUnavailable(true); });
    try { setLastReference(localStorage.getItem("campus-connect-reference") || ""); } catch { /* Storage is optional. */ }
    const items = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("revealed"); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    items.forEach(item => observer.observe(item));
    return () => { cancelled = true; observer.disconnect(); };
  }, []);

  const filteredResources = useMemo(() => resources.filter(item => {
    const haystack = `${item.title} ${item.subject} ${item.category} ${item.semester} ${item.description}`.toLowerCase();
    return (!keyword || haystack.includes(keyword.trim().toLowerCase())) && (!subject || item.subject.toLowerCase().includes(subject.trim().toLowerCase())) && (!semester || item.semester === semester) && (!category || item.category === category);
  }), [resources, keyword, subject, semester, category]);

  const resultsLink = links.find(link => link.shortcut === "results");
  const scholarshipLink = links.find(link => link.shortcut === "scholarships");
  const quickItems = [
    { title: "Academic resources", subtitle: "Notes, syllabus & more", href: "#resources", icon: BookOpenText, color: "blue", external: false },
    { title: "Exams & results", subtitle: resultsLink ? (resultsLink.official ? "Official university portal" : "Open saved link") : "Find important links", href: resultsLink?.url || "#links", icon: GraduationCap, color: "orange", external: Boolean(resultsLink) },
    { title: "Scholarships", subtitle: scholarshipLink ? (scholarshipLink.official ? "Find the official portal" : "Open saved link") : "Find important links", href: scholarshipLink?.url || "#links", icon: BadgeIndianRupee, color: "green", external: Boolean(scholarshipLink) },
    { title: "Ask a question", subtitle: "We're here to help", href: "#ask", icon: MessageCircle, color: "purple", external: false },
  ];

  function searchResources(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setKeyword(headerSearch); setActive("Academic resources"); setMobileSearchOpen(false);
    document.getElementById("resources")?.scrollIntoView({ behavior: "smooth" });
  }
  function openHeaderSearch() {
    if (window.innerWidth <= 650) {
      if (mobileSearchOpen) { setMobileSearchOpen(false); return; }
      setMobileSearchOpen(true);
      window.setTimeout(() => headerSearchRef.current?.focus(), 0);
    } else headerSearchRef.current?.focus();
  }
  function navigate(label: string) { setActive(label); setMobileOpen(false); }
  function resetFilters() { setKeyword(""); setSubject(""); setSemester(""); setCategory(""); setHeaderSearch(""); }

  return (
    <div className="app-shell" id="dashboard">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`} aria-label="Main navigation">
        <div className="sidebar-brand"><Brand /><button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={20} /></button></div>
        <div className="sidebar-scroll"><div className="nav-label">MAIN MENU</div><nav className="nav-list">{navMain.map(item => <a key={item.label} href={item.href} className={active === item.label ? "active" : ""} onClick={() => navigate(item.label)}><item.icon size={19} strokeWidth={1.8} /><span>{item.label}</span>{active === item.label && <ChevronRight className="nav-chevron" size={15} />}</a>)}</nav>
          <div className="nav-label support-label">SUPPORT</div><nav className="nav-list">{navSupport.map(item => <a key={item.label} href={item.href} className={active === item.label ? "active" : ""} onClick={() => navigate(item.label)}><item.icon size={19} strokeWidth={1.8} /><span>{item.label}</span></a>)}</nav>
          <div className="sidebar-help"><div className="sidebar-help-icon"><MessageCircle size={19} /></div><strong>Need a hand?</strong><p>We&apos;re here to make your student journey easier.</p><a href="#ask" onClick={() => navigate("Ask a question")}>Ask a question <ArrowRight size={14} /></a></div>
        </div>
        <div className="sidebar-bottom"><div className="sidebar-bottom-icon"><Heart size={15} fill="currentColor" /></div><div><strong>Made for students</strong><small>Made with care, for you.</small></div></div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left"><button className="menu-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={22} /></button><div className="mobile-brand"><Brand /></div><div className="breadcrumb"><span>Pages</span><ChevronRight size={14} /><strong>Dashboard</strong></div></div>
          <div className="topbar-actions"><form className={`header-search ${mobileSearchOpen ? "header-search-open" : ""}`} onSubmit={searchResources}><button className="search-icon-button" type="button" onClick={openHeaderSearch} aria-label={mobileSearchOpen ? "Close search" : "Open search"}><Search size={18} /></button><label className="sr-only" htmlFor="header-search">Search resources</label><input ref={headerSearchRef} id="header-search" placeholder="Search resources, subjects..." value={headerSearch} onChange={e => setHeaderSearch(e.target.value)} /><button className="search-submit" aria-label="Search resources" type="submit"><span className="search-key">⌘</span><span className="search-key">K</span><span className="search-go">Go</span></button></form><a className="top-icon" href="#notices" aria-label="Go to notice board"><Bell size={19} /><i /></a><a className="top-icon top-help" href="#faq" aria-label="Frequently asked questions"><CircleHelp size={19} /></a><div className="top-divider" /><a className="profile" href="#ask"><span className="avatar">S</span><span><strong>Student</strong><small>DDU student</small></span><ChevronDown size={14} /></a></div>
        </header>
        <main className="content-wrap" id="main-content">
          <div className="welcome-row"><div><div className="welcome-eyebrow"><span></span> YOUR STUDENT DASHBOARD</div><h1>{settings.welcomeTitle} <span>👋</span></h1><p>{settings.welcomeDescription}</p></div><div className="welcome-badge"><span className="welcome-badge-icon"><Sparkles size={16} /></span><div><strong>Made for DDU students</strong><small>Here for your journey</small></div></div></div>

          <section className="hero-banner" aria-label="Welcome to CampusConnect">
            <div className="hero-overlay" />
            <div className="hero-content"><div className="hero-pill"><Sparkles size={13} /> YOUR CAMPUS COMPANION</div><h2>{settings.heroLine1} <br /><span>{settings.heroLine2}</span></h2><p>{settings.heroDescription}</p><div className="hero-actions"><a className="hero-primary" href="#resources">Explore resources <ArrowRight size={16} /></a><a className="hero-secondary" href="#ask">Ask a question <ArrowUpRight size={15} /></a></div></div>
            <div className="hero-float"><span><BookOpenText size={20} /></span><div><strong>A little more connected</strong><small>All your essentials, together</small></div><Check size={15} /></div><div className="hero-image-note">Representative image</div>
          </section>

          <section className="quick-section section-space" data-reveal><SectionHeading title="Quick access" description="Your most-used essentials, just a click away." /><div className="quick-grid">{quickItems.map(item => <a key={item.title} href={item.href} className="quick-card" {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}><div className="quick-card-top"><span className={`soft-icon ${item.color}`}><item.icon size={22} strokeWidth={1.9} /></span><span className="quick-arrow"><ArrowUpRight size={18} /></span></div><strong>{item.title}</strong><p>{item.subtitle}</p></a>)}</div></section>

          <div className="dashboard-grid section-space" data-reveal>
            <section className="surface-card notice-card" id="notices"><div className="card-heading"><div><div className="mini-eyebrow">STAY IN THE LOOP</div><h2>Latest notices</h2><p>Important updates, all in one place.</p></div><a href="https://ddugu.ac.in/" target="_blank" rel="noopener noreferrer" className="section-link">Official notices <ArrowUpRight size={15} /></a></div>
              {notices.some(item => item.demo) && <div className="demo-banner"><Sparkles size={14} /><span><strong>Demo content:</strong> These examples are not university announcements.</span></div>}
              <div className="notice-list">{notices.length ? notices.slice(0, showAllNotices ? notices.length : 3).map(item => <div className="notice-row" key={item.id}><span className={`notice-icon ${categoryColor(item.category)}`}><FileText size={18} /></span><div className="notice-body"><div className="notice-title-line"><strong>{item.title}</strong><span className={`category-tag ${categoryColor(item.category)}`}>{item.demo ? "DEMO" : item.category}</span></div><p>{item.summary}</p><div className="notice-meta"><span>{displayDate(item.publishedDate)}</span><span className="meta-dot">•</span><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.demo ? "Visit official site" : "View official source"} <ArrowUpRight size={12} /></a></div></div><ArrowUpRight className="notice-end" size={16} /></div>) : <div className="notice-empty">No notices have been added yet. Check the official university website for updates.</div>}</div>
              {notices.length > 3 && <button className="content-more" onClick={() => setShowAllNotices(!showAllNotices)}>{showAllNotices ? "Show fewer notices" : `View all ${notices.length} notices`} <ChevronDown size={14} /></button>}<div className="notice-footer"><ShieldCheck size={15} /> Always confirm details with the official university source.</div>
            </section>
            <section className="surface-card events-card"><div className="card-heading"><div><div className="mini-eyebrow">PLAN AHEAD</div><h2>Upcoming events</h2><p>Keep track of what&apos;s next.</p></div><span className="events-heading-icon"><CalendarDays size={19} /></span></div>{events.length ? <div className="event-list">{events.slice(0, showAllEvents ? events.length : 3).map(event => <div className="event-item" key={event.id}><div className="event-date"><CalendarDays size={16} /><span>{displayDate(event.eventDate)}</span></div><div><strong>{event.title}</strong><p>{event.description}</p>{event.location && <small>{event.location}</small>}<a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">Official source <ArrowUpRight size={12} /></a></div></div>)}{events.length > 3 && <button className="content-more" onClick={() => setShowAllEvents(!showAllEvents)}>{showAllEvents ? "Show fewer events" : `View all ${events.length} events`} <ChevronDown size={14} /></button>}</div> : <div className="event-empty"><div className="calendar-art"><CalendarDays size={31} /><span className="calendar-sparkle"><Sparkles size={14} /></span></div><strong>No confirmed events yet</strong><p>We&apos;ll show events here once they&apos;re verified. Check the university website for the latest schedule.</p><a href="https://ddugu.ac.in/" target="_blank" rel="noopener noreferrer">Visit university website <ArrowUpRight size={14} /></a></div>}<div className="events-bottom"><span><i /> STAY INFORMED</span><small>Official sources first</small></div></section>
          </div>

          <section className="resources-section section-space" id="resources" data-reveal><SectionHeading eyebrow="YOUR STUDY TOOLKIT" title="Academic resources" description="Find the right study material for your next step." /><div className="resource-toolbar"><div className="filter-search"><Search size={18} /><label className="sr-only" htmlFor="resource-keyword">Search resources by keyword</label><input id="resource-keyword" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Search resources by keyword..." /></div><div className="filter-subject"><label className="sr-only" htmlFor="resource-subject">Filter by subject</label><input id="resource-subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="All subjects" /></div><label className="sr-only" htmlFor="resource-semester">Filter by semester</label><select id="resource-semester" value={semester} onChange={e => setSemester(e.target.value)}><option value="">All semesters</option>{semesters.map(s => <option key={s}>{s}</option>)}</select><label className="sr-only" htmlFor="resource-category">Filter by category</label><select id="resource-category" value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{["Notes", "Syllabus", "Assignment", "Previous papers"].map(c => <option key={c}>{c}</option>)}</select><button className="filter-reset" onClick={resetFilters} aria-label="Reset resource filters" title="Reset filters"><SlidersHorizontal size={17} /></button></div>
              {resources.some(item => item.demo) && <div className="resource-demo-note"><span>DEMO DATA</span> Sample listings are for illustration only; no files are attached.</div>}
              {contentUnavailable && <p className="content-warning">Live content is temporarily unavailable. Showing demo examples.</p>}
              {filteredResources.length ? <div className="resource-grid">{filteredResources.map(item => <article className="resource-card" key={item.id}><div className="resource-card-top"><span className={`soft-icon ${categoryColor(item.category)}`}>{categoryIcon(item.category)}</span><span className={`category-tag ${categoryColor(item.category)}`}>{item.category}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className="resource-meta"><span>{item.subject}</span><i /> <span>{item.semester}</span></div><div className="resource-bottom">{item.demo ? <span className="demo-resource-label">Demo listing · No file</span> : <a href={item.url} target="_blank" rel="noopener noreferrer">Open resource <ArrowUpRight size={14} /></a>}<span>{item.demo ? "SAMPLE" : "SHARED RESOURCE"}</span></div></article>)}</div> : <div className="empty-search"><FolderOpen size={25} /><strong>{resources.length ? "No matching resources" : "No resources added yet"}</strong><p>{resources.length ? "Try another keyword, subject, semester or category." : "Please check back later or visit the official university website."}</p>{resources.length > 0 && <button onClick={resetFilters}>Clear filters</button>}</div>}
              <p className="section-footnote"><ShieldCheck size={14} /> Shared study material is not necessarily official. Please verify it with your department.</p>
          </section>

          <section className="links-section section-space" id="links" data-reveal><SectionHeading eyebrow="THE RIGHT PLACE TO START" title="Important links" description="Useful destinations, collected in one place." />{links.length ? <div className="official-grid">{links.map(item => { const appearance = linkAppearance(item.icon); return <a href={item.url} target="_blank" rel="noopener noreferrer" className="official-card" key={item.id}><span className={`soft-icon ${appearance.color}`}><appearance.icon size={20} /></span><div><strong>{item.title}</strong><small>{item.subtitle}</small><small className="link-status">{item.official ? "Official domain" : "External · verify source"}</small></div><ArrowUpRight size={17} /></a>; })}</div> : <div className="empty-links">No links have been added yet.</div>}<p className="section-footnote"><ShieldCheck size={14} /> Recognized official domains are labeled. Always verify external links before sharing information.</p></section>

          <QuestionSection onSubmitted={setLastReference} />
          <div className="support-grid section-space"><TrackingCard initialReference={lastReference} /><FeedbackCard /></div>

          <section className="student-needs section-space" data-reveal><div className="needs-intro"><div className="mini-eyebrow">THOUGHTFULLY MADE FOR YOU</div><h2>A little less searching.<br /><span>A lot more studying.</span></h2><p>College comes with enough questions. Finding your next step shouldn&apos;t be one of them.</p><a href="#resources" className="section-link">Find your resources <ArrowRight size={15} /></a></div><div className="needs-quotes"><div className="quote-card"><span className="quote-mark">“</span><p>I just want to find the right information without searching everywhere.</p><small>ILLUSTRATIVE STUDENT NEED</small></div><div className="quote-card"><span className="quote-mark">“</span><p>It helps to have a simple place to ask when I&apos;m not sure where to start.</p><small>ILLUSTRATIVE STUDENT NEED</small></div></div></section>

          <div className="bottom-grid section-space"><section className="faq-section" id="faq" data-reveal><SectionHeading eyebrow="GOOD TO KNOW" title="Frequently asked questions" description="A few helpful answers to get you started." /><div className="faq-list">{faqs.length ? faqs.map((item, i) => <details key={item.id} open={i === 0 ? true : undefined}><summary>{item.question}<span><ChevronDown size={17} /></span></summary><p>{item.answer}</p></details>) : <p className="faq-empty">No FAQs have been added yet.</p>}</div></section><section className="free-card" data-reveal><div className="free-icon"><Heart size={22} /></div><span className="mini-eyebrow">MADE FOR STUDENTS</span><h2>Good help should be easy to access.</h2><p>A simple starting point for your college journey. No subscription, no student account required.</p><div className="price-line"><strong>₹0</strong><span> / for students<br /><small>for this prototype</small></span></div><ul><li><Check size={15} /> Explore resources and links</li><li><Check size={15} /> Ask and track questions</li><li><Check size={15} /> Share ideas and feedback</li></ul><a className="primary-button" href="#ask">Get started <ArrowRight size={16} /></a><small className="free-disclaimer">Official portals may have their own fees.</small></section></div>

          <section className="final-cta section-space" data-reveal><div><span className="mini-eyebrow">HERE FOR YOUR JOURNEY</span><h2>Your next step starts here.</h2><p>Less searching. More learning. Let&apos;s make college a little easier, together.</p></div><a href="#resources">Explore your student hub <ArrowRight size={16} /></a><span className="cta-doodle"><ArrowDownRight size={80} /></span></section>
          <footer className="footer"><div className="footer-main"><div><Brand /><p>An independent student-help prototype for Deen Dayal Upadhyaya Gorakhpur University students.</p></div><div className="footer-links"><a href="#resources">Resources</a><a href="#links">Official links</a><a href="#faq">FAQs</a><a href="/admin">Admin</a><a href="/setup">Free hosting guide</a></div></div><div className="footer-bottom"><span>Made with <Heart size={13} fill="currentColor" /> for the student community.</span><span>Not affiliated with or endorsed by DDUGU. Verify important information on official websites.</span></div></footer>
        </main>
      </div>
    </div>
  );
}
