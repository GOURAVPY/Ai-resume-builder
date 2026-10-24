"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Icon, TextField } from "@/components/m3";
import { api } from "@/lib/api";
import {
  emptyEducation,
  emptyExperience,
  type Doc,
  type LetterData,
  resumeText,
  type ResumeData,
} from "@/lib/documents";
import { LetterPreview, ResumePreview } from "./preview";

type SaveState = "saved" | "saving" | "unsaved" | "error";

export default function DocumentEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const firstLoad = useRef(true);

  useEffect(() => {
    api<{ document: Doc }>(`/api/documents/${id}`)
      .then((r) => setDoc(r.document))
      .catch((e) => setLoadError(e.message));
  }, [id]);

  // Autosave a moment after the last change.
  useEffect(() => {
    if (!doc) return;
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      setSaveState("saving");
      try {
        await api(`/api/documents/${id}`, { method: "PATCH", json: { name: doc.name, data: doc.data } });
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [doc, id]);

  function update(patch: Partial<Doc>) {
    setSaveState("unsaved");
    setDoc((d) => (d ? { ...d, ...patch } : d));
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl bg-surface-container-low p-8 text-center">
        <p className="text-on-surface">{loadError}</p>
        <Link href="/dashboard" className="mt-4 inline-block font-medium text-primary">
          Back to dashboard
        </Link>
      </div>
    );
  }
  if (!doc) return <div className="mx-auto h-96 max-w-6xl animate-pulse rounded-3xl bg-surface-container-low" />;

  const isResume = doc.type === "resume";

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/8"
        >
          <Icon name="arrow_back" />
        </Link>
        <input
          value={doc.name}
          onChange={(e) => update({ name: e.target.value })}
          aria-label="Document name"
          className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1 text-[22px] text-on-surface outline-none hover:bg-on-surface/8 focus:bg-surface-container"
        />
        <span className="flex items-center gap-1 text-sm text-on-surface-variant" aria-live="polite">
          <Icon
            name={saveState === "error" ? "error" : saveState === "saved" ? "cloud_done" : "sync"}
            className={`text-[18px] ${saveState === "error" ? "text-error" : ""}`}
          />
          {saveState === "error" ? "Couldn't save" : saveState === "saved" ? "Saved" : "Saving…"}
        </span>
        <Button icon="download" onClick={() => window.print()}>
          Download PDF
        </Button>
      </div>

      <div className="mt-4 flex gap-2 lg:hidden print:hidden">
        {(["edit", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setMobileTab(t)}
            className={`h-10 flex-1 rounded-full text-sm font-medium ${
              mobileTab === t ? "bg-secondary-container text-on-secondary-container" : "border border-outline text-on-surface"
            }`}
          >
            {t === "edit" ? "Edit" : "Preview"}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div
          className={`space-y-6 print:hidden ${mobileTab === "preview" ? "hidden lg:block" : ""}`}
          style={{ "--field-bg": "var(--color-surface-container-low)" } as React.CSSProperties}
        >
          {isResume ? (
            <ResumeForm data={doc.data as ResumeData} onChange={(data) => update({ data })} />
          ) : (
            <LetterForm type={doc.type} data={doc.data as LetterData} onChange={(data) => update({ data })} />
          )}
        </div>
        <div className={`${mobileTab === "edit" ? "hidden lg:block" : ""}`}>
          <div id="print-area" className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-xl shadow-lg print:rounded-none print:shadow-none">
              {isResume ? <ResumePreview data={doc.data as ResumeData} /> : <LetterPreview data={doc.data as LetterData} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-surface-container-low p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <h2 className="flex-1 text-lg text-on-surface">{title}</h2>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

// Asks the AI to rewrite a piece of text; shows a small inline error if it fails.
function AiButton({ label = "Improve with AI", run }: { label?: string; run: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <span className="flex items-center gap-2">
      {error && <span className="max-w-48 text-xs text-error">{error}</span>}
      <Button
        variant="tonal"
        icon="auto_awesome"
        disabled={busy}
        className="h-9 px-4"
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await run();
          } catch (e) {
            setError(e instanceof Error ? e.message : "AI request failed");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Working…" : label}
      </Button>
    </span>
  );
}

async function improve(kind: "summary" | "bullets", text: string, context: Record<string, string | undefined>) {
  const r = await api<{ text: string }>("/api/ai/improve", { method: "POST", json: { kind, text, context } });
  return r.text;
}

function ResumeForm({ data, onChange }: { data: ResumeData; onChange: (d: ResumeData) => void }) {
  const set = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => onChange({ ...data, [key]: value });
  const context = { title: data.title, targetJob: data.targetJob, experienceLevel: data.experienceLevel };

  return (
    <>
      <FormCard title="Personal details">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Full name" value={data.fullName} onChange={(v) => set("fullName", v)} />
          <TextField label="Job title" value={data.title} onChange={(v) => set("title", v)} />
          <TextField label="Email" value={data.email} onChange={(v) => set("email", v)} />
          <TextField label="Phone" value={data.phone} onChange={(v) => set("phone", v)} />
          <TextField label="Location" value={data.location} onChange={(v) => set("location", v)} />
          <TextField label="LinkedIn / website" value={data.links} onChange={(v) => set("links", v)} />
        </div>
      </FormCard>

      {data.targetJob !== undefined && data.targetJob !== "" && (
        <FormCard title="Target job">
          <TextField multiline label="Job description" value={data.targetJob} onChange={(v) => set("targetJob", v)} />
          <p className="text-xs text-on-surface-variant">AI suggestions are tailored to this job.</p>
        </FormCard>
      )}

      <FormCard
        title="Summary"
        action={
          <AiButton
            label={data.summary ? "Improve with AI" : "Write with AI"}
            run={async () => set("summary", await improve("summary", data.summary, { ...context, resume: resumeText(data) }))}
          />
        }
      >
        <TextField multiline label="Professional summary" value={data.summary} onChange={(v) => set("summary", v)} />
      </FormCard>

      <FormCard
        title="Experience"
        action={
          <Button variant="text" icon="add" onClick={() => set("experience", [...data.experience, emptyExperience()])}>
            Add
          </Button>
        }
      >
        {data.experience.map((exp, i) => {
          const setExp = (patch: Partial<typeof exp>) =>
            set(
              "experience",
              data.experience.map((e, j) => (j === i ? { ...e, ...patch } : e)),
            );
          return (
            <div key={i} className="space-y-4 rounded-2xl border border-outline-variant p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Role" value={exp.role} onChange={(v) => setExp({ role: v })} />
                <TextField label="Company" value={exp.company} onChange={(v) => setExp({ company: v })} />
                <TextField label="Start" placeholder="Jan 2022" value={exp.start} onChange={(v) => setExp({ start: v })} />
                <TextField label="End" placeholder="Present" value={exp.end} onChange={(v) => setExp({ end: v })} />
              </div>
              <TextField label="Location" value={exp.location} onChange={(v) => setExp({ location: v })} />
              <TextField
                multiline
                label="What you did (one point per line)"
                value={exp.bullets}
                onChange={(v) => setExp({ bullets: v })}
              />
              <div className="flex flex-wrap justify-between gap-2">
                <Button
                  variant="text"
                  icon="delete"
                  onClick={() => set("experience", data.experience.filter((_, j) => j !== i))}
                >
                  Remove
                </Button>
                <AiButton
                  label={exp.bullets ? "Improve points" : "Write points"}
                  run={async () =>
                    setExp({ bullets: await improve("bullets", exp.bullets, { ...context, role: exp.role, company: exp.company }) })
                  }
                />
              </div>
            </div>
          );
        })}
      </FormCard>

      <FormCard
        title="Education"
        action={
          <Button variant="text" icon="add" onClick={() => set("education", [...data.education, emptyEducation()])}>
            Add
          </Button>
        }
      >
        {data.education.map((edu, i) => {
          const setEdu = (patch: Partial<typeof edu>) =>
            set(
              "education",
              data.education.map((e, j) => (j === i ? { ...e, ...patch } : e)),
            );
          return (
            <div key={i} className="space-y-4 rounded-2xl border border-outline-variant p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="School" value={edu.school} onChange={(v) => setEdu({ school: v })} />
                <TextField label="Degree" value={edu.degree} onChange={(v) => setEdu({ degree: v })} />
                <TextField label="Start" value={edu.start} onChange={(v) => setEdu({ start: v })} />
                <TextField label="End" value={edu.end} onChange={(v) => setEdu({ end: v })} />
              </div>
              <TextField label="Details (optional)" value={edu.details} onChange={(v) => setEdu({ details: v })} />
              <Button variant="text" icon="delete" onClick={() => set("education", data.education.filter((_, j) => j !== i))}>
                Remove
              </Button>
            </div>
          );
        })}
      </FormCard>

      <FormCard title="Skills">
        <TextField multiline label="Skills, separated by commas" value={data.skills} onChange={(v) => set("skills", v)} />
      </FormCard>
    </>
  );
}

function LetterForm({ type, data, onChange }: { type: string; data: LetterData; onChange: (d: LetterData) => void }) {
  const set = <K extends keyof LetterData>(key: K, value: LetterData[K]) => onChange({ ...data, [key]: value });
  const [notes, setNotes] = useState("");
  const resignation = type === "resignation";

  return (
    <>
      <FormCard title="Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Your name" value={data.fullName} onChange={(v) => set("fullName", v)} />
          <TextField label={resignation ? "Your current role" : "Role you're applying for"} value={data.role} onChange={(v) => set("role", v)} />
          <TextField label={resignation ? "Manager's name" : "Hiring manager"} value={data.recipient} onChange={(v) => set("recipient", v)} />
          <TextField label="Company" value={data.company} onChange={(v) => set("company", v)} />
        </div>
        <TextField
          multiline
          label={resignation ? "Notes for the AI (last day, reason, tone)" : "Notes for the AI (job description, your strengths)"}
          value={notes}
          onChange={setNotes}
        />
        <div className="flex justify-end">
          <AiButton
            label={data.body ? "Rewrite with AI" : "Write with AI"}
            run={async () => {
              const r = await api<{ text: string }>("/api/ai/letter", { method: "POST", json: { type, data, notes } });
              set("body", r.text);
            }}
          />
        </div>
      </FormCard>
      <FormCard title="Letter">
        <TextField multiline label="Letter text" value={data.body} onChange={(v) => set("body", v)} />
      </FormCard>
    </>
  );
}
