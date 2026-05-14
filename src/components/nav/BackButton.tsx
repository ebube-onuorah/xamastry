"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export default function BackButton({
  fallbackHref = "/",
  label = "Back",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest transition-colors ${className}`}
    >
      <ChevronLeft size={14} />
      {label}
    </button>
  );
}
