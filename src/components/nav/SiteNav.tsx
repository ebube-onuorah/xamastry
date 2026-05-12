"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/exam/practice", label: "Practice" },
  { href: "/labs",          label: "Labs" },
  { href: "/dashboard",     label: "Dashboard" },
] as const;

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b-2 border-black bg-[#fafafa]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-8">

        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-7 place-items-center bg-black font-mono text-sm font-bold text-white">
            X
          </span>
          <span className="font-mono text-sm font-bold uppercase tracking-widest text-black">
            Xamastry
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 font-mono text-xs uppercase tracking-widest text-zinc-500 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-black transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/exam/practice"
            className="hidden sm:block bg-black px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-600"
          >
            Start free
          </Link>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid place-items-center md:hidden p-1 text-black"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t-2 border-black md:hidden">
          <div className="mx-auto max-w-7xl px-6 py-4 sm:px-8 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-mono text-xs uppercase tracking-widest text-zinc-600 hover:text-black transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/exam/practice"
              onClick={() => setOpen(false)}
              className="mt-1 w-full bg-black px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-white text-center hover:bg-red-600 transition-colors"
            >
              Start free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
