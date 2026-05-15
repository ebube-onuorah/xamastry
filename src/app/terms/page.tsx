import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/nav/SiteNav";

export const metadata: Metadata = {
  title: "Terms | Xamastry",
  description: "Basic terms and learning-use disclaimer for Xamastry.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-black">
      <SiteNav />
      <section className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Terms</p>
        <h1 className="font-playfair mt-2 text-4xl font-extrabold text-black">Terms of use.</h1>
        <div className="mt-8 space-y-6 border-2 border-black p-6 text-sm leading-7 text-zinc-600">
          <section>
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-black">Learning Tool</h2>
            <p className="mt-2">
              Xamastry is an independent study tool for CCNA-style practice. It is not affiliated with Cisco and does
              not guarantee exam results.
            </p>
          </section>
          <section>
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-black">Lab Simulator</h2>
            <p className="mt-2">
              Browser labs simulate selected IOS-style commands and validate configuration state. They are not a
              replacement for production network testing or a full hardware emulator.
            </p>
          </section>
          <section>
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-black">Use Responsibly</h2>
            <p className="mt-2">
              Verify critical networking concepts with official documentation, textbooks, or lab equipment before using
              them in production environments.
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
