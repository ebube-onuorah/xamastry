"use client";

import { useState } from "react";

interface BackupPayload {
  version: 1;
  uid: string | null;
  theme: string | null;
  exportedAt: string;
}

export default function ProgressBackup() {
  const [message, setMessage] = useState("Your browser keeps progress automatically.");
  const [value, setValue] = useState("");

  function exportProgress() {
    const payload: BackupPayload = {
      version: 1,
      uid: localStorage.getItem("xamastry-uid"),
      theme: localStorage.getItem("xamastry-theme"),
      exportedAt: new Date().toISOString(),
    };
    const encoded = btoa(JSON.stringify(payload));
    setValue(encoded);
    void navigator.clipboard?.writeText(encoded).catch(() => null);
    setMessage("Backup code created. Keep it somewhere safe.");
  }

  function importProgress() {
    try {
      const payload = JSON.parse(atob(value.trim())) as BackupPayload;
      if (payload.version !== 1 || !payload.uid) throw new Error("Invalid backup");
      localStorage.setItem("xamastry-uid", payload.uid);
      document.cookie = `xamastry-uid=${payload.uid}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      if (payload.theme === "dark" || payload.theme === "light") {
        localStorage.setItem("xamastry-theme", payload.theme);
      }
      setMessage("Progress restored. Refreshing dashboard...");
      window.location.reload();
    } catch {
      setMessage("That backup code could not be read.");
    }
  }

  return (
    <div className="border border-zinc-300 p-4">
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-black">Move Progress</p>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        Use a backup code to continue with the same browser progress on another device.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Paste backup code"
          className="min-w-0 border border-zinc-300 bg-transparent px-3 py-2 font-mono text-xs text-black outline-none focus:border-black"
        />
        <button
          type="button"
          onClick={exportProgress}
          className="border border-black px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white"
        >
          Export
        </button>
        <button
          type="button"
          onClick={importProgress}
          className="bg-black px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-600"
        >
          Restore
        </button>
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400">{message}</p>
    </div>
  );
}
