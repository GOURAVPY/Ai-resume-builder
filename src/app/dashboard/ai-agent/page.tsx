"use client";

import { useEffect, useRef, useState } from "react";
import { DocPicker, fileToResume, type PickedResume } from "@/components/doc-picker";
import { Button, Icon } from "@/components/m3";
import { Markdown } from "@/components/markdown";

const suggestions = [
  { icon: "trending_up", text: "Improve my resume and tell me what to fix first" },
  { icon: "my_location", text: "Help me target my resume to a specific job" },
  { icon: "work", text: "What kinds of jobs match my profile?" },
];

type Message = { role: "user" | "assistant"; content: string; label?: string };

export default function AiAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<PickedResume>();
  const [attaching, setAttaching] = useState(false);
  const [picking, setPicking] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function send(text: string) {
    const body = text.trim();
    if ((!body && !attachment) || streaming) return;
    const content = attachment
      ? `${body || "Please review my resume."}\n\nMy resume (${attachment.name}):\n${attachment.text}`
      : body;
    const next: Message[] = [
      ...messages,
      { role: "user", content, label: attachment ? `${body || "Please review my resume."}\n📎 ${attachment.name}` : body },
    ];
    setMessages([...next, { role: "assistant", content: "" }]);
    setDraft("");
    setAttachment(undefined);
    setError("");
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      if (!res.ok || !res.body) {
        const { error: message } = await res.json().catch(() => ({ error: "The AI couldn't answer." }));
        throw new Error(message);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: reply }]);
      }
    } catch (e) {
      setMessages(next);
      setError(e instanceof Error ? e.message : "The AI couldn't answer.");
    } finally {
      setStreaming(false);
    }
  }

  async function attachFile(file: File) {
    setAttaching(true);
    setError("");
    try {
      setAttachment(await fileToResume(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file.");
    } finally {
      setAttaching(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl flex-col">
      <div className="flex gap-2">
        <Button icon="add" disabled={streaming} onClick={() => setMessages([])}>
          New chat
        </Button>
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
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-3xl px-5 py-3 text-sm ${
                    m.role === "user"
                      ? "whitespace-pre-wrap rounded-br-lg bg-primary text-on-primary"
                      : "rounded-bl-lg bg-surface-container-high text-on-surface"
                  }`}
                >
                  {m.role === "user" ? (
                    m.label ?? m.content
                  ) : m.content ? (
                    <Markdown text={m.content} />
                  ) : (
                    <span className="flex items-center gap-2 text-on-surface-variant">
                      <Icon name="progress_activity" className="animate-spin text-[18px]" />
                      Thinking…
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottom} />
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
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
              void send(draft);
            }
          }}
          placeholder="Attach a resume, or describe your task or question…"
          aria-label="Message"
          className="w-full resize-none bg-transparent px-3 py-2 text-base text-on-surface outline-none placeholder:text-on-surface-variant"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={attaching}
            onClick={() => fileInput.current?.click()}
            className="inline-flex h-8 max-w-full items-center gap-2 rounded-lg border border-outline px-3 text-sm font-medium text-on-surface-variant hover:bg-on-surface/8"
          >
            <Icon name={attachment ? "attach_file" : "upload_file"} className="text-[18px]" />
            <span className="truncate">{attaching ? "Reading file…" : (attachment?.name ?? "Upload resume (PDF, DOCX)")}</span>
          </button>
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-outline px-3 text-sm font-medium text-on-surface-variant hover:bg-on-surface/8"
          >
            <Icon name="note_add" className="text-[18px]" />
            Add resume from dashboard
          </button>
          {attachment && (
            <button
              type="button"
              aria-label="Remove attachment"
              onClick={() => setAttachment(undefined)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/8"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.docx"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void attachFile(file);
              e.target.value = "";
            }}
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={streaming || (!draft.trim() && !attachment)}
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

      {picking && (
        <DocPicker
          onClose={() => setPicking(false)}
          onPick={(r) => {
            setAttachment(r);
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}
