import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusConnect | Your DDU Student Hub",
  description: "A student-first hub for useful links, academic resources and questions for DDU Gorakhpur University students.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
