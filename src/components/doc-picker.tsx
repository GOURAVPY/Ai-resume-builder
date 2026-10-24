"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/m3";
import { api, importFile } from "@/lib/api";
import { resumeText, type Doc, type DocSummary, type ResumeData } from "@/lib/documents";

export type PickedResume = { name: string; text: string };

// Dialog listing the user's saved resumes; returns the chosen one as plain text.
export function DocPicker({ onPick, onClose }: { onPick: (r: PickedResume) => void; onClose: () => void }) {
  const [docs, setDocs] = useState<DocSummary[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ documents: DocSummary[] }>("/api/documents?type=resume")
      .then((r) => setDocs(r.documents))
      .catch((e) => setError(e.message));
  }, []);

  async function pick(summary: DocSummary) {
    const { document } = await api<{ document: Doc }>(`/api/documents/${summary.id}`);
    onPick({ name: document.name, text: resumeText(document.data as ResumeData) });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close" className="absolute inset-0 bg-black/32" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-[28px] bg-surface-container-high p-6 shadow-2xl">
        <h2 className="text-2xl text-on-surface">Choose a resume</h2>
        <div className="mt-4 max-h-80 overflow-y-auto">
          {error && <p className="text-sm text-error">{error}</p>}
          {docs === null && !error && <p className="text-sm text-on-surface-variant">Loading…</p>}
          {docs?.length === 0 && (
            <p className="text-sm text-on-surface-variant">You don&apos;t have any resumes yet. Create one on the dashboard first.</p>
          )}
          {docs?.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => pick(d).catch((e) => setError(e.message))}
              className="flex h-14 w-full items-center gap-3 rounded-full px-4 text-left text-on-surface hover:bg-on-surface/8"
            >
              <Icon name="description" className="text-on-surface-variant" />
              <span className="truncate">{d.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onClose} className="h-10 rounded-full px-4 text-sm font-medium text-primary hover:bg-primary/8">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Reads an uploaded resume file as plain text (no AI parsing).
export async function fileToResume(file: File): Promise<PickedResume> {
  const form = new FormData();
  form.append("file", file);
  form.append("type", "resume");
  const r = await api<{ name: string; text: string }>("/api/import?parse=0", { method: "POST", body: form });
  return { name: r.name, text: r.text };
}

export { importFile };
