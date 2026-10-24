"use client";

import { useRef, useState } from "react";
import { Button, Icon } from "@/components/m3";

const suggestions = [
  { icon: "trending_up", text: "Improve my resume score" },
  { icon: "my_location", text: "Target my resume to a job" },
  { icon: "work", text: "Find a job that matches my profile" },
];

type Message = { from: "user" | "agent"; text: string };

export default function AiAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);

  function send(text: string) {
    const body = text.trim();
    if (!body && !attachment) return;
    setMessages((m) => [
      ...m,
      { from: "user", text: attachment ? `📎 ${attachment}\n${body}` : body },
      // TODO: replace with the real AI response once the AI backend is connected.
      { from: "agent", text: "The AI Resume Agent isn't connected yet. Once it is, I'll answer here." },
    ]);
    setDraft("");
    setAttachment(undefined);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl flex-col">
      <div className="flex gap-2">
        <Button icon="add" onClick={() => setMessages([])}>
          New chat
        </Button>
        <button
          type="button"
          aria-label="Chat history"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-on-surface/8"
        >
          <Icon name="history" />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center py-8">
        {messages.length === 0 ? (
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-container text-on-primary-container">
              <Icon name="auto_awesome" filled className="text-[32px]" />
            </span>
            <h1 className="mt-6 text-[28px] leading-9 text-on-surface">
              How can the AI Resume Agent help with your resume and job search?
            </h1>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[80%] whitespace-pre-wrap rounded-3xl px-5 py-3 text-sm ${
                    m.from === "user"
                      ? "rounded-br-lg bg-primary text-on-primary"
                      : "rounded-bl-lg bg-surface-container-high text-on-surface"
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="rounded-[28px] bg-surface-container-high p-3"
      >
        <textarea
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
          placeholder="Attach a resume, or describe your task or question…"
          aria-label="Message"
          className="w-full resize-none bg-transparent px-3 py-2 text-base text-on-surface outline-none placeholder:text-on-surface-variant"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-outline px-3 text-sm font-medium text-on-surface-variant hover:bg-on-surface/8"
          >
            <Icon name="upload_file" className="text-[18px]" />
            {attachment ?? "Upload resume (PDF, DOCX)"}
          </button>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-outline px-3 text-sm font-medium text-on-surface-variant hover:bg-on-surface/8"
          >
            <Icon name="note_add" className="text-[18px]" />
            Add resume from dashboard
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.docx"
            hidden
            onChange={(e) => setAttachment(e.target.files?.[0]?.name)}
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!draft.trim() && !attachment}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary disabled:bg-on-surface/12 disabled:text-on-surface/38"
          >
            <Icon name="arrow_upward" />
          </button>
        </div>
      </form>

      {messages.length === 0 && (
        <div className="mt-4 flex flex-col items-start gap-1">
          {suggestions.map((s) => (
            <button
              key={s.text}
              type="button"
              onClick={() => send(s.text)}
              className="flex h-10 items-center gap-3 rounded-full px-4 text-sm text-on-surface hover:bg-on-surface/8"
            >
              <Icon name={s.icon} className="text-[20px] text-primary" />
              {s.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
