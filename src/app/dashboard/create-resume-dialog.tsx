"use client";

import { useState } from "react";
import { Button, ButtonLink, FileField, Icon, Select, Switch, TextField } from "@/components/m3";

const experienceLevels = ["Student / Intern", "Entry level (0–2 years)", "Mid level (3–5 years)", "Senior (6–10 years)", "Executive (10+ years)"];
export type NewResumeOptions = {
  name: string;
  experienceLevel: string;
  language: string;
  targetJob: string;
  file?: File;
};

const languages = ["English", "Hindi", "Spanish", "French", "German", "Japanese"];

export default function CreateResumeDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (options: NewResumeOptions) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [file, setFile] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showImport, setShowImport] = useState(true);
  const [showLanguage, setShowLanguage] = useState(false);
  const [language, setLanguage] = useState("English");
  const [targeted, setTargeted] = useState(false);
  const [jobDescription, setJobDescription] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close dialog" className="absolute inset-0 bg-black/32" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-resume-title"
        style={{ "--field-bg": "var(--color-surface-container-high)" } as React.CSSProperties}
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-[28px] bg-surface-container-high shadow-2xl"
      >
        <div className="flex items-center gap-4 px-6 pt-6">
          <Icon name="note_add" className="text-primary" />
          <h2 id="create-resume-title" className="flex-1 text-2xl text-on-surface">
            Create a resume
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/8"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="mt-4 space-y-6 overflow-y-auto px-6 py-2">
          <TextField label="Resume name" required placeholder="First Last – Job Title" value={name} onChange={setName} />
          <Select label="Experience" value={experience} onChange={setExperience} options={experienceLevels} />

          <div>
            <button
              type="button"
              onClick={() => setShowImport((v) => !v)}
              className="flex items-center gap-1 text-sm font-medium text-on-surface"
            >
              Import your existing resume
              <Icon name={showImport ? "expand_less" : "expand_more"} className="text-[20px]" />
            </button>
            {showImport && (
              <div className="mt-3">
                <FileField fileName={file?.name} onFile={setFile} />
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowLanguage((v) => !v)}
              className="flex items-center gap-1 text-sm font-medium text-on-surface"
            >
              Language
              <Icon name={showLanguage ? "expand_less" : "expand_more"} className="text-[20px]" />
            </button>
            {showLanguage && (
              <div className="mt-3">
                <Select label="Resume language" value={language} onChange={setLanguage} options={languages} />
              </div>
            )}
          </div>

          <div className="border-t border-outline-variant pt-5">
            <div className="flex items-center gap-4">
              <h3 className="flex-1 text-base font-medium text-on-surface">Target your resume</h3>
              <Switch label="Target your resume" checked={targeted} onChange={setTargeted} />
            </div>
            <p className="mt-2 flex gap-2 text-sm text-on-surface-variant">
              <Icon name="info" className="text-[18px] text-primary" />
              A targeted resume is tailored to a specific job opening. You have a better chance of an interview when
              it&apos;s clear you have the experience the job asks for.
            </p>
            {targeted && (
              <TextField
                className="mt-4"
                multiline
                label="Job description"
                placeholder="Paste the job description here"
                value={jobDescription}
                onChange={setJobDescription}
              />
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="mx-6 mt-3 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-end gap-2 px-6 pb-6 pt-4">
          <Button variant="text" onClick={onClose} className="mr-auto">
            Cancel
          </Button>
          <ButtonLink href="/dashboard/ai-agent" variant="outlined" icon="auto_awesome">
            Use AI Resume Agent
          </ButtonLink>
          <Button
            disabled={!name.trim() || busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                await onCreate({
                  name: name.trim(),
                  experienceLevel: experience,
                  language,
                  targetJob: targeted ? jobDescription.trim() : "",
                  file,
                });
              } catch (e) {
                setError(e instanceof Error ? e.message : "Couldn't create the resume.");
                setBusy(false);
              }
            }}
          >
            {busy ? (file ? "Importing…" : "Creating…") : "Create resume"}
          </Button>
        </div>
      </div>
    </div>
  );
}
