import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/nav/SiteNav";

export const metadata: Metadata = {
  title: "Privacy | Xamastry",
  description: "How Xamastry stores progress, lab attempts, and AI explanation usage.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-black">
      <SiteNav />
      <section className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Privacy</p>
        <h1 className="font-playfair mt-2 text-4xl font-extrabold text-black">Privacy policy.</h1>
        <div className="mt-8 space-y-6 border-2 border-black p-6 text-sm leading-7 text-zinc-600">
          <section>
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-black">Progress Data</h2>
            <p className="mt-2">
              Xamastry uses a browser-generated ID to save practice sessions, answers, lab checks, streaks, and review
              scheduling without forcing account creation.
            </p>
          </section>
          <section>
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-black">AI Explanations</h2>
            <p className="mt-2">
              When you request an explanation, question context and your selected answer may be sent to the configured
              AI provider. Do not enter personal secrets into explanation prompts.
            </p>
          </section>
          <section>
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-black">Local Storage</h2>
            <p className="mt-2">
              Theme preference and anonymous progress identity are stored in your browser. Clearing browser data may
              reset local progress unless you saved a backup code from the dashboard.
            </p>
          </section>
        </div>
        <Link href="/" className="mt-8 inline-block font-mono text-xs font-bold uppercase tracking-widest text-red-600">
          Back home
        </Link>
      </section>
    </main>
  );
}
