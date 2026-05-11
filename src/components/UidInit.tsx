"use client";

import { useEffect } from "react";
import { nanoid } from "nanoid";

// Generates a stable anonymous user ID in localStorage and mirrors it to a
// cookie so server components can read it on subsequent navigations.
export default function UidInit() {
  useEffect(() => {
    let uid = localStorage.getItem("xamastry-uid");
    if (!uid) {
      uid = nanoid();
      localStorage.setItem("xamastry-uid", uid);
    }
    // 1-year cookie so the server can read it
    document.cookie = `xamastry-uid=${uid}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }, []);

  return null;
}
