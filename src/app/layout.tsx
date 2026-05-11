import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import UidInit from "@/components/UidInit";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xamastry | Free CCNA Practice Platform",
  description:
    "Xamastry is a free CCNA 200-301 practice platform with adaptive questions, IOS CLI labs, topology practice, and AI explanations powered by Groq.",
  openGraph: {
    title: "Xamastry | Free CCNA Practice Platform",
    description:
      "Pass the CCNA 200-301 free. 500+ adaptive questions, browser-based CLI labs, Groq AI explanations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <UidInit />
        {children}
      </body>
    </html>
  );
}
