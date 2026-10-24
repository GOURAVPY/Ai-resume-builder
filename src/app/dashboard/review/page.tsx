"use client";

import { useState } from "react";
import { Button, FileField, Icon, Segmented, TextField } from "@/components/m3";

const speeds = [
  { id: "standard", title: "Standard", detail: "Within 5 business days" },
  { id: "express", title: "Express", detail: "Within 2 business days" },
  { id: "rush", title: "Rush", detail: "Within 24 hours" },
];

type Review = { id: string; file: string; speed: string; submitted: number };

export default function ReviewPage() {
  const [view, setView] = useState<"options" | "mine">("options");
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [linkedIn, setLinkedIn] = useState("");
  const [file, setFile] = useState<string>();
  const [speed, setSpeed] = useState("standard");
  const [notes, setNotes] = useState("");
  const [preserve, setPreserve] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  const source = file ?? (linkedIn.trim() ? "LinkedIn profile" : undefined);

  function submit() {
    if (!source) return;
    // TODO: send to the review service once it exists.
    setReviews((r) => [{ id: crypto.randomUUID(), file: source, speed, submitted: Date.now() }, ...r]);
    setFile(undefined);
    setLinkedIn("");
    setNotes("");
    setView("mine");
  }

  return (
    <div className="mx-auto max-w-6xl" style={{ "--field-bg": "var(--color-surface-container-low)" } as React.CSSProperties}>
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: "options", label: "Review options" },
          { value: "mine", label: "My reviews", count: reviews.length },
        ]}
      />

      {view === "mine" ? (
        <div className="mt-6 rounded-3xl bg-surface-container-low p-6">
          {reviews.length === 0 ? (
            <p className="text-center text-on-surface-variant">You haven&apos;t requested any reviews yet.</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {reviews.map((r) => (
                <li key={r.id} className="flex items-center gap-4 py-4">
                  <Icon name="description" className="text-on-surface-variant" />
                  <div className="flex-1">
                    <p className="font-medium text-on-surface">{r.file}</p>
                    <p className="text-sm text-on-surface-variant">
                      {speeds.find((s) => s.id === r.speed)?.title} · requested{" "}
                      {new Date(r.submitted).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-lg bg-secondary-container px-3 py-1 text-xs font-medium text-on-secondary-container">
                    Pending
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="space-y-6 rounded-3xl bg-surface-container-low p-6"
          >
            <div>
              <h1 className="text-[22px] text-on-surface">Select resume for review *</h1>
              <button
                type="button"
                onClick={() => setShowLinkedIn((v) => !v)}
                className="mt-4 flex items-center gap-1 text-sm font-medium text-on-surface"
              >
                Import from LinkedIn
                <Icon name={showLinkedIn ? "expand_less" : "expand_more"} className="text-[20px]" />
              </button>
              {showLinkedIn && (
                <TextField className="mt-3" label="LinkedIn profile URL" leadingIcon="link" value={linkedIn} onChange={setLinkedIn} />
              )}
              <p className="mt-4 text-sm font-medium text-on-surface">Import your existing resume</p>
              <div className="mt-3">
                <FileField fileName={file} onFile={(f) => setFile(f.name)} />
              </div>
            </div>

            <fieldset>
              <legend className="text-base font-medium text-on-surface">How fast do you need your review?</legend>
              <div className="mt-3 space-y-2">
                {speeds.map((s) => (
                  <label
                    key={s.id}
                    className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors ${
                      speed === s.id ? "border-primary bg-primary/8" : "border-outline-variant hover:bg-on-surface/8"
                    }`}
                  >
                    <input
                      type="radio"
                      name="speed"
                      value={s.id}
                      checked={speed === s.id}
                      onChange={() => setSpeed(s.id)}
                      className="h-5 w-5 accent-primary"
                    />
                    <span>
                      <span className="block font-medium text-on-surface">{s.title}</span>
                      <span className="block text-sm text-on-surface-variant">{s.detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <TextField multiline label="Notes for reviewer" placeholder="Explain anything you'd like us to know" value={notes} onChange={setNotes} />

            <label className="flex cursor-pointer items-center gap-3 text-sm text-on-surface">
              <input type="checkbox" checked={preserve} onChange={(e) => setPreserve(e.target.checked)} className="h-[18px] w-[18px] accent-primary" />
              Preserve resume formatting
            </label>

            <Button type="submit" className="h-12 w-full" disabled={!source}>
              Continue
            </Button>
          </form>

          <div className="flex min-h-96 flex-col items-center justify-center rounded-3xl bg-surface-container p-6 text-center">
            {source ? (
              <>
                <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-container text-on-primary-container">
                  <Icon name="description" filled className="text-[32px]" />
                </span>
                <p className="mt-4 font-medium text-on-surface">{source}</p>
                <p className="mt-1 text-sm text-on-surface-variant">A preview will show here once file previews are added.</p>
              </>
            ) : (
              <>
                <Icon name="fact_check" className="text-[48px] text-on-surface-variant" />
                <p className="mt-4 max-w-xs text-on-surface-variant">
                  Upload a resume to have an expert review it and send back suggestions.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
