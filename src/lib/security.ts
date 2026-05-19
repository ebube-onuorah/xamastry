import type { NextRequest } from "next/server";

const UID_PATTERN = /^[A-Za-z0-9_-]{8,80}$/;
const ID_PATTERN = /^[A-Za-z0-9_.:-]{1,120}$/;

export function isValidUid(value: string | null | undefined): value is string {
  return typeof value === "string" && UID_PATTERN.test(value);
}

export function getRequestUid(req: NextRequest): string | null {
  const uid = req.cookies.get("xamastry-uid")?.value ?? req.headers.get("x-uid");
  return isValidUid(uid) ? uid : null;
}

export function isSafeId(value: unknown): value is string {
  return typeof value === "string" && ID_PATTERN.test(value);
}

export function isSafePath(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && value.length <= 300 && !value.includes("\0");
}

export function hasOversizedBody(req: NextRequest, maxBytes: number) {
  const length = Number(req.headers.get("content-length") ?? "0");
  return Number.isFinite(length) && length > maxBytes;
}

export function truncate(value: string | null, maxLength: number) {
  if (!value) return null;
  return value.slice(0, maxLength);
}

export function safeNumber(value: unknown, fallback: number, min: number, max: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}
