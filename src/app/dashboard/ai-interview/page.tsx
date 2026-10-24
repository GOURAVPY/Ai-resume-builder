"use client";

import { useState } from "react";
import { Button, Card, FileField, Icon, TextField } from "@/components/m3";

const steps = ["Resume", "Job description", "AI interview"] as const;

// General practice questions until the AI generates ones from the resume and job.
const practiceQuestions = [
  "Tell me about yourself and your most relevant experience.",
  "Describe a project you're proud of. What was your role?",
  "Tell me about a time you handled a difficult problem at work.",
  "Why are you interested in this role?",
];

export default function AiInterviewPage() {
  const [step, setStep] = useState(0);
  const [resume, setResume] = useState<string>();
  const [jobDescription, setJobDescription] = useState("");
  const [question, setQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(practiceQuestions.map(() => ""));

  return (
    <div className="mx-auto max-w-6xl" style={{ "--field-bg": "var(--color-surface-container-low)" } as React.CSSProperties}>
      <ol className="flex flex-wrap items-center gap-2">
        {steps.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-8 items-center gap-2 rounded-full px-3 text-sm font-medium ${
                i === step
                  ? "bg-primary text-on-primary"
                  : i < step
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface/38"
              }`}
            >
              {i < step ? <Icon name="check" className="text-[18px]" /> : <span>{i + 1}</span>}
              {label}
            </span>
            {i < steps.length - 1 && <span className="h-px w-6 bg-outline-variant" />}
          </li>
        ))}
      </ol>

      <Card className="mt-6">
        {step === 0 && (
          <>
            <h1 className="text-[22px] text-on-surface">Add a resume</h1>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <AgentNote text="Interview questions will be based on your resume — your skills, experience and education." />
              <div className="flex flex-col gap-4">
                <h2 className="font-medium text-on-surface">How would you like to add your resume?</h2>
                <FileField fileName={resume} onFile={(f) => setResume(f.name)} />
                <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                  <span className="h-px flex-1 bg-outline-variant" />
                  or
                  <span className="h-px flex-1 bg-outline-variant" />
                </div>
                <Button variant="outlined" icon="note_add" className="h-14 rounded-[4px]" onClick={() => setResume("Resume from dashboard")}>
                  Add from dashboard
                </Button>
                <Button className="mt-auto h-12" disabled={!resume} onClick={() => setStep(1)}>
                  Continue
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-[22px] text-on-surface">Add the job description</h1>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <AgentNote text="Paste the job you're interviewing for so the questions match what the employer is looking for." />
              <div className="flex flex-col gap-4">
                <TextField multiline label="Job description" placeholder="Paste the job description" value={jobDescription} onChange={setJobDescription} />
                <div className="mt-auto flex gap-2">
                  <Button variant="text" onClick={() => setStep(0)}>
                    Back
                  </Button>
                  <Button className="h-12 flex-1" disabled={!jobDescription.trim()} onClick={() => setStep(2)}>
                    Start interview
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-[22px] text-on-surface">AI interview</h1>
              <span className="text-sm text-on-surface-variant">
                Question {question + 1} of {practiceQuestions.length}
              </span>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <AgentNote text={practiceQuestions[question]} />
              <div className="flex flex-col gap-4">
                <TextField
                  multiline
                  label="Your answer"
                  value={answers[question]}
                  onChange={(v) => setAnswers((a) => a.map((x, i) => (i === question ? v : x)))}
                />
                <p className="text-xs text-on-surface-variant">
                  AI feedback on your answers will appear here once the AI is connected.
                </p>
                <div className="mt-auto flex gap-2">
                  <Button variant="text" disabled={question === 0} onClick={() => setQuestion((q) => q - 1)}>
                    Previous
                  </Button>
                  <Button
                    className="h-12 flex-1"
                    onClick={() => (question < practiceQuestions.length - 1 ? setQuestion((q) => q + 1) : setStep(0))}
                  >
                    {question < practiceQuestions.length - 1 ? "Next question" : "Finish"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function AgentNote({ text }: { text: string }) {
  return (
    <div className="flex min-h-64 items-center gap-3 rounded-2xl bg-surface-container p-6">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-tertiary text-on-primary">
        <Icon name="smart_toy" className="text-[20px]" />
      </span>
      <p className="rounded-2xl rounded-tl-sm bg-surface-container-high px-4 py-3 text-sm text-on-surface">{text}</p>
    </div>
  );
}
