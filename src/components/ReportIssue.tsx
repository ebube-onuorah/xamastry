"use client";

import { useState } from "react";

type ReportIssueProps = {
  contentType: "question" | "lab";
  contentId: string;
  label?: string;
  tone?: "light" | "dark";
};

export default function ReportIssue({
  contentType,
  contentId,
  label = "Report issue",
  tone = "light",
}: ReportIssueProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit() {
    if (message.trim().length < 5 || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          message: message.trim(),
          path: window.location.pathname,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
      setMessage("");
      setTimeout(() => setOpen(false), 1200);
    } catch {
      setStatus("error");
    }
  }

  const isDark = tone === "dark";
  const muted = isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-black";
  const panel = isDark
    ? "border-zinc-800 bg-zinc-950 text-zinc-200"
    : "border-zinc-300 bg-white text-black";

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`font-mono text-[10px] uppercase tracking-widest transition-colors ${muted}`}
      >
        {label}
      </button>
      {open && (
        <div className={`mt-2 border p-3 ${panel}`}>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, 800))}
            rows={3}
            placeholder="What looks wrong or confusing?"
            className={`w-full resize-none border bg-transparent p-2 text-sm outline-none ${
              isDark ? "border-zinc-800 text-zinc-200 placeholder:text-zinc-600" : "border-zinc-300 text-black"
            }`}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {status === "sent" ? "Sent. Thank you." : status === "error" ? "Could not send." : `${message.length}/800`}
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={message.trim().length < 5 || status === "sending" || status === "sent"}
              className={`px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-40 ${
                isDark ? "bg-teal-500 text-black" : "bg-black text-white"
              }`}
            >
              {status === "sending" ? "Sending" : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
