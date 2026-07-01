import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI TechStack Auditor - BNI Enterprise",
  description: "Enterprise software architecture consultant powered by AI. Conduct real-time technology stack audits, security risk assessments, migration roadmap planning, and cost optimization recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <head>
        <title>AI TechStack Auditor - BNI Enterprise</title>
        <meta name="description" content="Enterprise software architecture consultant powered by AI. Conduct real-time technology stack audits, security risk assessments, migration roadmap planning, and cost optimization recommendations." />
      </head>
      <body className="min-h-full bg-[#0a0f1d] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}
export const dynamic = 'force-dynamic';
