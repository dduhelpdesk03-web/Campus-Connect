export type SiteLink = { id: number; title: string; subtitle: string; url: string; icon: string; shortcut: string; official?: boolean };
export type SiteFaq = { id: number; question: string; answer: string };
export type SiteEvent = { id: number; title: string; description: string; eventDate: string; location: string; sourceUrl: string };
export type SiteSettings = { id: number; welcomeTitle: string; welcomeDescription: string; heroLine1: string; heroLine2: string; heroDescription: string; showDemoContent: boolean };

export const defaultSettings: SiteSettings = {
  id: 1,
  welcomeTitle: "Welcome to your student hub",
  welcomeDescription: "Everything you need for college life, all in one place.",
  heroLine1: "College life,",
  heroLine2: "made a little easier.",
  heroDescription: "From study resources to the right answers, find what you need to make the most of your journey at DDU.",
  showDemoContent: true,
};

export const defaultLinks: Omit<SiteLink, "id" | "official">[] = [
  { title: "University website", subtitle: "DDUGU official website", url: "https://ddugu.ac.in/", icon: "university", shortcut: "none" },
  { title: "Examination portal", subtitle: "Student ERP login", url: "https://erp.ddugu.ac.in/", icon: "examination", shortcut: "none" },
  { title: "Results", subtitle: "Official results page", url: "https://erp.ddugu.ac.in/all_result.aspx", icon: "results", shortcut: "results" },
  { title: "Scholarship portal", subtitle: "Uttar Pradesh government", url: "https://scholarship.up.gov.in/", icon: "scholarship", shortcut: "scholarships" },
  { title: "Admissions", subtitle: "Official admission portal", url: "https://dduguadm.samarth.edu.in/", icon: "admission", shortcut: "none" },
];

export const defaultFaqs: Omit<SiteFaq, "id">[] = [
  { question: "Is CampusConnect an official university website?", answer: "No. CampusConnect is an independent student-help prototype, not an official DDUGU website. Always confirm notices, dates, eligibility, results and other important information on the linked official portals." },
  { question: "How do I find notes or a syllabus?", answer: "Use the resource search to filter by keyword, subject, semester and category. Listings marked Demo are examples only and do not contain downloadable files. Shared resources should be checked against your course's official syllabus." },
  { question: "How can I check my question?", answer: "After submitting, save the private reference code shown on screen. Enter it in Track your question to see whether it has been received, is in progress or has been answered. Anyone with the code can see the response, so keep it private." },
  { question: "When will my question be answered?", answer: "Responses depend on the availability of the administrators running this prototype. There is no guaranteed response time. For urgent or official matters, please contact the university directly." },
  { question: "Does it cost anything to use?", answer: "This student-help prototype is free to use and does not require an account. Official university or government portals may have their own fees and requirements." },
];
