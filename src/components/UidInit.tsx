"use client";

import { useEffect } from "react";
import { nanoid } from "nanoid";

const UID_PATTERN = /^[A-Za-z0-9_-]{8,80}$/;

// Generates a stable anonymous user ID in localStorage and mirrors it to a
// cookie so server components can read it on subsequent navigations.
export default function UidInit() {
  useEffect(() => {
    let uid = localStorage.getItem("xamastry-uid");
    if (!uid || !UID_PATTERN.test(uid)) {
      uid = nanoid();
      localStorage.setItem("xamastry-uid", uid);
    }
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `xamastry-uid=${uid}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secure}`;
  }, []);

  return null;
}
