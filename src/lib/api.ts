"use client";

import type { DocType, LetterData, ResumeData } from "./documents";

// Small JSON fetch helper for the browser. A 401 means the session ended, so
// it sends the user back to the login page.
export async function api<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: init?.json !== undefined ? { "Content-Type": "application/json", ...init?.headers } : init?.headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  if (res.status === 401) {
    // A full reload on purpose: drops all client state from the ended session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/";
    throw new Error("Please sign in again.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");
  return body as T;
}

// Reads a PDF or DOCX on the server and returns document data filled from it.
export async function importFile(file: File, type: DocType) {
  const form = new FormData();
  form.append("file", file);
  form.append("type", type);
  return api<{ name: string; data: Partial<ResumeData & LetterData>; text: string }>("/api/import", {
    method: "POST",
    body: form,
  });
}
