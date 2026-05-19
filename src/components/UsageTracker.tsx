"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const UID_PATTERN = /^[A-Za-z0-9_-]{8,80}$/;

function getUid() {
  try {
    let uid = localStorage.getItem("xamastry-uid");
    if (!uid || !UID_PATTERN.test(uid)) {
      uid = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
      localStorage.setItem("xamastry-uid", uid);
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `xamastry-uid=${uid}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secure}`;
    }
    return uid;
  } catch {
    return null;
  }
}

export function trackUsage(event: string, metadata?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/usage")) return;

  const utm = Object.fromEntries(
    new URLSearchParams(window.location.search)
      .entries()
      .filter(([key]) => key.startsWith("utm_")),
  );

  const payload = JSON.stringify({
    event,
    path: window.location.pathname,
    metadata: { ...utm, ...metadata },
  });

  const uid = getUid();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (uid) headers["x-uid"] = uid;

  fetch("/api/usage", {
    method: "POST",
    headers,
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Usage analytics should never interrupt learning.
  });
}

export default function UsageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackUsage("page_view");
  }, [pathname]);

  return null;
}
