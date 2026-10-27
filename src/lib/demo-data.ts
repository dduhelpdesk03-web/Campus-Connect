export type Notice = {
  id: number;
  title: string;
  summary: string;
  category: string;
  publishedDate: string;
  sourceUrl: string;
  demo?: boolean;
};

export type Resource = {
  id: number;
  title: string;
  subject: string;
  semester: string;
  category: string;
  description: string;
  url: string;
  demo?: boolean;
};

// These are interface examples, not university announcements or downloadable files.
export const demoNotices: Notice[] = [
  { id: -1, title: "Example: Examination information", summary: "Demo notice only. Check the university website for confirmed updates.", category: "Examination", publishedDate: "", sourceUrl: "https://ddugu.ac.in/", demo: true },
  { id: -2, title: "Example: Scholarship information", summary: "Demo notice only. Refer to the official portal for current details.", category: "Scholarship", publishedDate: "", sourceUrl: "https://scholarship.up.gov.in/", demo: true },
  { id: -3, title: "Example: Academic announcement", summary: "Demo notice only. Dates and details have not been announced here.", category: "Academics", publishedDate: "", sourceUrl: "https://ddugu.ac.in/", demo: true },
];

export const demoResources: Resource[] = [
  { id: -1, title: "Introduction to Computer Science", subject: "Computer Science", semester: "Semester 1", category: "Notes", description: "An example of subject notes you could find here.", url: "", demo: true },
  { id: -2, title: "Business Communication", subject: "Commerce", semester: "Semester 2", category: "Syllabus", description: "An example of a semester-wise syllabus listing.", url: "", demo: true },
  { id: -3, title: "Mathematics practice assignment", subject: "Mathematics", semester: "Semester 3", category: "Assignment", description: "An example assignment listing for your studies.", url: "", demo: true },
  { id: -4, title: "Economics question paper", subject: "Economics", semester: "Semester 2", category: "Previous papers", description: "An example of a previous-year paper listing.", url: "", demo: true },
];

export const semesters = Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`);
