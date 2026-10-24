"use client";

import { useState } from "react";
import { DocPicker, fileToResume, type PickedResume } from "@/components/doc-picker";
import { Button, Card, FileField, Icon, TextField } from "@/components/m3";
import { api } from "@/lib/api";

const steps = ["Resume", "Job description", "AI interview"] as const;

type Feedback = { score: number; strengths: string; improvements: string; betterAnswer: string };

export default function AiInterviewPage() {
  const [step, setStep] = useState(0);
  const [resume, setResume] = useState<PickedResume>();
  const [picking, setPicking] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [question, setQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<(Feedback | undefined)[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function run<T>(label: string, task: () => Promise<T>) {
    setBusy(label);
    setError("");
    try {
      return await task();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy("");
    }
  }

  async function startInterview() {
    const r = await run("Writing your questions…", () =>
      api<{ questions: string[] }>("/api/ai/interview", {
        method: "POST",
        json: { action: "questions", resume: resume?.text, job: jobDescription },
      }),
    );
    if (!r) return;
    setQuestions(r.questions);
    setAnswers(r.questions.map(() => ""));
    setFeedback([]);
    setQuestion(0);
    setStep(2);
  }

  async function getFeedback() {
    const r = await run("Reviewing your answer…", () =>
      api<Feedback>("/api/ai/interview", {
        method: "POST",
        json: { action: "feedback", resume: resume?.text, job: jobDescription, question: questions[question], answer: answers[question] },
      }),
    );
    if (r) setFeedback((f) => Object.assign([...f], { [question]: r }));
  }

  const current = feedback[question];

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

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      )}

      <Card className="mt-6">
        {step === 0 && (
          <>
            <h1 className="text-[22px] text-on-surface">Add a resume</h1>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <AgentNote text="Interview questions will be based on your resume — your skills, experience and education." />
              <div className="flex flex-col gap-4">
                <h2 className="font-medium text-on-surface">How would you like to add your resume?</h2>
                <FileField
                  fileName={busy ? "Reading file…" : resume?.name}
                  onFile={async (f) => {
                    const r = await run("Reading file…", () => fileToResume(f));
                    if (r) setResume(r);
                  }}
                />
                <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                  <span className="h-px flex-1 bg-outline-variant" />
                  or
                  <span className="h-px flex-1 bg-outline-variant" />
                </div>
                <Button variant="outlined" icon="note_add" className="h-14 rounded-[4px]" onClick={() => setPicking(true)}>
                  Add from dashboard
                </Button>
                <Button className="mt-auto h-12" disabled={!resume || !!busy} onClick={() => setStep(1)}>
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
                  <Button className="h-12 flex-1" disabled={!jobDescription.trim() || !!busy} onClick={startInterview}>
                    {busy || "Start interview"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && questions.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-[22px] text-on-surface">AI interview</h1>
              <span className="text-sm text-on-surface-variant">
                Question {question + 1} of {questions.length}
              </span>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <AgentNote text={questions[question]} />
                {current && (
                  <div className="space-y-3 rounded-2xl bg-surface-container p-5 text-sm text-on-surface">
                    <p className="flex items-center gap-2 text-base font-medium">
                      <Icon name="grade" filled className="text-primary" />
                      Score: {current.score}/10
                    </p>
                    <p>
                      <strong>What worked: </strong>
                      {current.strengths}
                    </p>
                    <p>
                      <strong>To improve: </strong>
                      {current.improvements}
                    </p>
                    <p className="rounded-xl bg-surface-container-high p-3">
                      <strong>A stronger answer: </strong>
                      {current.betterAnswer}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <TextField
                  multiline
                  label="Your answer"
                  value={answers[question] ?? ""}
                  onChange={(v) => setAnswers((a) => a.map((x, i) => (i === question ? v : x)))}
                />
                <Button variant="tonal" icon="rate_review" disabled={!answers[question]?.trim() || !!busy} onClick={getFeedback}>
                  {busy || "Get feedback"}
                </Button>
                <div className="mt-auto flex gap-2">
                  <Button variant="text" disabled={question === 0} onClick={() => setQuestion((q) => q - 1)}>
                    Previous
                  </Button>
                  <Button
                    className="h-12 flex-1"
                    onClick={() => (question < questions.length - 1 ? setQuestion((q) => q + 1) : setStep(0))}
                  >
                    {question < questions.length - 1 ? "Next question" : "Finish"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

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

function AgentNote({ text }: { text: string }) {
  return (
    <div className="flex min-h-48 items-center gap-3 rounded-2xl bg-surface-container p-6">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-tertiary text-on-primary">
        <Icon name="smart_toy" className="text-[20px]" />
      </span>
      <p className="rounded-2xl rounded-tl-sm bg-surface-container-high px-4 py-3 text-sm text-on-surface">{text}</p>
    </div>
  );
}
