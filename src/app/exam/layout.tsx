import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exam Practice | Xamastry",
  description:
    "Adaptive CCNA 200-301 practice with 400+ questions, SM-2 spaced repetition, and AI-powered explanations. Full 120-question timed exams available.",
};

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
