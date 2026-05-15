import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Playfair_Display } from "next/font/google";
import UidInit from "@/components/UidInit";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Xamastry | Free CCNA Practice Platform",
  description:
    "Xamastry is a free CCNA 200-301 practice platform with adaptive questions, IOS CLI labs, topology practice, and AI explanations powered by Groq.",
  openGraph: {
    title: "Xamastry | Free CCNA Practice Platform",
    description:
      "CCNA 200-301 practice with adaptive questions, browser-based IOS-style CLI labs, state grading, and AI explanations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("xamastry-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch{}`,
          }}
        />
        <UidInit />
        {children}
      </body>
    </html>
  );
}
