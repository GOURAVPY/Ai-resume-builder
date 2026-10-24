"use client";

import { useEffect, useState } from "react";
import { DocPicker, fileToResume, type PickedResume } from "@/components/doc-picker";
import { Button, FileField, Icon, Segmented, TextField } from "@/components/m3";
import { Markdown } from "@/components/markdown";
import { api } from "@/lib/api";

const depths = [
  { id: "detailed", title: "Detailed", detail: "Deepest review; takes about a minute" },
  { id: "standard", title: "Standard", detail: "Focused review; about 30 seconds" },
  { id: "quick", title: "Quick", detail: "Top fixes only; a few seconds" },
];

type Review = { id: string; source: string; speed: string; result: string; createdAt: number };

export default function ReviewPage() {
  const [view, setView] = useState<"options" | "mine">("options");
  const [resume, setResume] = useState<PickedResume>();
  const [picking, setPicking] = useState(false);
  const [speed, setSpeed] = useState("standard");
  const [notes, setNotes] = useState("");
  const [preserve, setPreserve] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [openId, setOpenId] = useState<string>();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ reviews: Review[] }>("/api/ai/review")
      .then((r) => setReviews(r.reviews))
      .catch(() => {});
  }, []);

  async function readFile(file: File) {
    setBusy("Reading file…");
    setError("");
    try {
      setResume(await fileToResume(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file.");
    } finally {
      setBusy("");
    }
  }

  async function submit() {
    if (!resume) return;
    setBusy("Reviewing your resume…");
    setError("");
    try {
      const { review } = await api<{ review: Review }>("/api/ai/review", {
        method: "POST",
        json: { source: resume.name, text: resume.text, speed, notes, preserveFormatting: preserve },
      });
      setReviews((r) => [review, ...r]);
      setOpenId(review.id);
      setResume(undefined);
      setNotes("");
      setView("mine");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The review failed.");
    } finally {
      setBusy("");
    }
  }

  const open = reviews.find((r) => r.id === openId);

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

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      )}

      {view === "mine" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="rounded-3xl bg-surface-container-low p-4">
            {reviews.length === 0 ? (
              <p className="p-4 text-center text-on-surface-variant">You haven&apos;t requested any reviews yet.</p>
            ) : (
              <ul className="space-y-1">
                {reviews.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(r.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ${
                        r.id === open?.id ? "bg-secondary-container" : "hover:bg-on-surface/8"
                      }`}
                    >
                      <Icon name="description" className="text-on-surface-variant" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-on-surface">{r.source}</span>
                        <span className="block text-sm text-on-surface-variant">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-3xl bg-surface-container-low p-6 text-sm leading-6 text-on-surface">
            {open ? (
              <Markdown text={open.result} />
            ) : (
              <p className="text-on-surface-variant">Choose a review to read it.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="space-y-6 rounded-3xl bg-surface-container-low p-6"
          >
            <div>
              <h1 className="text-[22px] text-on-surface">Select resume for review *</h1>
              <p className="mt-4 text-sm font-medium text-on-surface">Upload your existing resume</p>
              <div className="mt-3">
                <FileField fileName={busy === "Reading file…" ? busy : resume?.name} onFile={readFile} />
              </div>
              <Button variant="text" icon="note_add" className="mt-2 px-3" onClick={() => setPicking(true)}>
                Or choose one from your dashboard
              </Button>
            </div>

            <fieldset>
              <legend className="text-base font-medium text-on-surface">How detailed should the review be?</legend>
              <div className="mt-3 space-y-2">
                {depths.map((s) => (
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

            <TextField multiline label="Notes for reviewer" placeholder="E.g. the roles you're applying for" value={notes} onChange={setNotes} />

            <label className="flex cursor-pointer items-center gap-3 text-sm text-on-surface">
              <input type="checkbox" checked={preserve} onChange={(e) => setPreserve(e.target.checked)} className="h-[18px] w-[18px] accent-primary" />
              Preserve resume formatting
            </label>

            <Button type="submit" className="h-12 w-full" disabled={!resume || !!busy}>
              {busy === "Reviewing your resume…" ? busy : "Continue"}
            </Button>
          </form>

          <div className="flex min-h-96 flex-col rounded-3xl bg-surface-container p-6">
            {resume ? (
              <>
                <p className="flex items-center gap-2 font-medium text-on-surface">
                  <Icon name="description" filled className="text-primary" />
                  {resume.name}
                </p>
                <pre className="mt-4 max-h-[32rem] flex-1 overflow-auto whitespace-pre-wrap font-sans text-sm text-on-surface-variant">
                  {resume.text}
                </pre>
              </>
            ) : (
              <div className="m-auto text-center">
                <Icon name="fact_check" className="text-[48px] text-on-surface-variant" />
                <p className="mt-4 max-w-xs text-on-surface-variant">
                  Upload a resume and the AI reviewer will score it and suggest specific fixes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {picking && (
        <DocPicker
          onClose={() => setPicking(false)}
          onPick={(r) => {
            setResume(r);
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}
