"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, importFile } from "@/lib/api";
import type { DocSummary, DocType, Section } from "@/lib/documents";
import CreateResumeDialog, { type NewResumeOptions } from "./create-resume-dialog";
import { CREATE_RESUME_EVENT } from "./sidebar";

const tabs = [
  { id: "resume", label: "Resumes", singular: "resume", icon: "description" },
  { id: "cover", label: "Cover Letters", singular: "cover letter", icon: "mail" },
  { id: "resignation", label: "Resignation Letters", singular: "resignation letter", icon: "logout" },
] as const satisfies readonly { id: DocType; label: string; singular: string; icon: string }[];

const featureCards = [
  { href: "/dashboard/ai-agent", icon: "auto_awesome", title: "AI Resume Agent", text: "Our most powerful AI resume tool" },
  { href: "/dashboard/jobs", icon: "work", title: "Job Search", text: "Find roles sourced from company career pages" },
  { href: "/dashboard/ai-interview", icon: "video_chat", title: "AI Interview", text: "Practice interviews with instant feedback" },
];

type Sort = "created" | "name";

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<DocType>("resume");
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Section the Create a resume dialog will add to ("" = the main section); null when closed.
  const [createIn, setCreateIn] = useState<string | null>(() => (searchParams.get("new") === "resume" ? "" : null));
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<Sort>("created");
  const [sortOpen, setSortOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const current = tabs.find((t) => t.id === tab)!;

  const load = useCallback(async (type: DocType) => {
    setLoading(true);
    try {
      const res = await api<{ documents: DocSummary[]; sections: Section[] }>(`/api/documents?type=${type}`);
      setDocs(res.documents);
      setSections(res.sections);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading data for the selected tab
    void load(tab);
  }, [tab, load]);

  // The sidebar's "Create new resume" button arrives as ?new=resume from other pages
  // (handled in the initial state above) or as an event while this page is open.
  useEffect(() => {
    if (searchParams.get("new") === "resume") router.replace("/dashboard");
  }, [searchParams, router]);

  useEffect(() => {
    function onCreate() {
      setTab("resume");
      setCreateIn("");
    }
    window.addEventListener(CREATE_RESUME_EVENT, onCreate);
    return () => window.removeEventListener(CREATE_RESUME_EVENT, onCreate);
  }, []);

  async function createDoc(type: DocType, sectionId: string, name: string, data?: object) {
    const { document } = await api<{ document: DocSummary }>("/api/documents", {
      method: "POST",
      json: { type, name, sectionId: sectionId || null, data },
    });
    router.push(`/dashboard/documents/${document.id}`);
  }

  async function createResume(options: NewResumeOptions) {
    const extra = { experienceLevel: options.experienceLevel, language: options.language, targetJob: options.targetJob };
    const imported = options.file ? await importFile(options.file, "resume") : undefined;
    await createDoc("resume", createIn ?? "", options.name, { ...imported?.data, ...extra });
  }

  async function onDropFiles(sectionId: string, files: File[]) {
    setBusy(true);
    try {
      const imported = await importFile(files[0], tab);
      await createDoc(tab, sectionId, imported.name, imported.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't import that file.");
      setBusy(false);
    }
  }

  async function deleteDoc(doc: DocSummary) {
    if (!window.confirm(`Delete "${doc.name}"? This can't be undone.`)) return;
    await api(`/api/documents/${doc.id}`, { method: "DELETE" });
    setDocs((d) => d.filter((x) => x.id !== doc.id));
  }

  async function addSection() {
    const name = newSectionName?.trim();
    setNewSectionName(null);
    if (!name) return;
    const { section } = await api<{ section: Section }>("/api/sections", { method: "POST", json: { type: tab, name } });
    setSections((s) => [...s, section]);
  }

  function sorted(list: DocSummary[]) {
    return [...list].sort((a, b) => (sort === "created" ? b.createdAt - a.createdAt : a.name.localeCompare(b.name)));
  }

  const allSections = [{ id: "", name: current.label }, ...sections];
  const knownSectionIds = new Set(sections.map((s) => s.id));
  const docsIn = (sectionId: string) =>
    sorted(docs.filter((d) => (sectionId ? d.sectionId === sectionId : !d.sectionId || !knownSectionIds.has(d.sectionId))));

  return (
    <div className="mx-auto max-w-6xl">
      <div role="tablist" className="flex overflow-x-auto border-b border-outline-variant">
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`relative flex h-12 shrink-0 items-center gap-2 px-4 text-sm font-medium transition-colors hover:bg-on-surface/8 sm:px-6 ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span className={`icon text-[20px] ${active ? "icon-filled" : ""}`}>{t.icon}</span>
              {t.label}
              {active && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-primary" />}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {featureCards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex items-start gap-4 rounded-xl bg-surface-container p-5 transition-shadow hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
              <span className="icon icon-filled">{c.icon}</span>
            </span>
            <span>
              <span className="block text-base font-medium text-on-surface">{c.title}</span>
              <span className="mt-1 block text-sm text-on-surface-variant">{c.text}</span>
            </span>
            <span className="icon ml-auto self-center text-on-surface-variant transition-transform group-hover:translate-x-1">
              chevron_right
            </span>
          </Link>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      )}

      <section className="mt-6 rounded-3xl bg-surface-container-low p-4 sm:p-6" aria-busy={loading || busy}>
        {allSections.map((section, i) => (
          <div key={section.id || "main"} className={i > 0 ? "mt-10" : ""}>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="mr-auto text-[22px] text-on-surface">{section.name}</h2>
              {i === 0 && (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSortOpen((v) => !v)}
                      aria-haspopup="menu"
                      aria-expanded={sortOpen}
                      className="flex h-10 items-center gap-2 rounded-lg border border-outline-variant pl-4 pr-2 text-sm font-medium text-on-surface-variant hover:bg-on-surface-variant/8"
                    >
                      <span className="icon text-[18px]">sort</span>
                      {sort === "created" ? "Created" : "Name"}
                      <span className="icon text-[20px]">arrow_drop_down</span>
                    </button>
                    {sortOpen && (
                      <div role="menu" className="absolute right-0 z-10 mt-1 w-44 rounded-lg bg-surface-container py-2 shadow-lg">
                        {(["created", "name"] as const).map((s) => (
                          <button
                            key={s}
                            role="menuitemradio"
                            aria-checked={sort === s}
                            onClick={() => {
                              setSort(s);
                              setSortOpen(false);
                            }}
                            className="flex h-12 w-full items-center gap-3 px-3 text-sm text-on-surface hover:bg-on-surface/8"
                          >
                            <span className="icon text-[20px] text-on-surface-variant">{sort === s ? "check" : ""}</span>
                            {s === "created" ? "Date created" : "Name"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex h-10 overflow-hidden rounded-full border border-outline">
                    {(["grid", "list"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        aria-label={`${v} view`}
                        aria-pressed={view === v}
                        onClick={() => setView(v)}
                        className={`flex w-12 items-center justify-center transition-colors first:border-r first:border-outline ${
                          view === v ? "bg-secondary-container text-on-secondary-container" : "text-on-surface hover:bg-on-surface/8"
                        }`}
                      >
                        <span className={`icon text-[20px] ${view === v ? "icon-filled" : ""}`}>
                          {v === "grid" ? "grid_view" : "view_list"}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div
              className={`mt-5 ${
                view === "grid" ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "flex flex-col gap-2"
              }`}
            >
              <CreateCard
                view={view}
                busy={busy}
                label={`Create new ${current.singular}`}
                onCreate={() =>
                  tab === "resume"
                    ? setCreateIn(section.id)
                    : createDoc(tab, section.id, `Untitled ${current.singular}`).catch((e) => setError(e.message))
                }
                onDrop={(files) => onDropFiles(section.id, files)}
              />
              {loading && i === 0 && docs.length === 0 && (
                <div className={`animate-pulse rounded-xl bg-surface-container ${view === "grid" ? "aspect-[3/4]" : "h-16"}`} />
              )}
              {docsIn(section.id).map((doc) => (
                <DocCard key={doc.id} doc={doc} view={view} icon={current.icon} onDelete={() => deleteDoc(doc)} />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-8">
          {newSectionName === null ? (
            <button
              type="button"
              onClick={() => setNewSectionName("")}
              className="flex h-10 items-center gap-2 rounded-full border border-outline-variant px-4 text-sm font-medium text-on-surface-variant transition-[border-radius,background-color] hover:bg-on-surface-variant/8 active:rounded-lg"
            >
              <span className="icon text-[18px]">create_new_folder</span>
              Add section
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void addSection();
              }}
              className="flex flex-wrap items-center gap-2"
            >
              <input
                autoFocus
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Section name"
                aria-label="Section name"
                className="h-10 rounded-[4px] border border-outline bg-transparent px-3 text-sm text-on-surface caret-primary outline-none focus:border-2 focus:border-primary"
              />
              <button type="submit" className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-on-primary">
                Add
              </button>
              <button
                type="button"
                onClick={() => setNewSectionName(null)}
                className="h-10 rounded-full px-4 text-sm font-medium text-primary hover:bg-primary/8"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </section>

      {createIn !== null && <CreateResumeDialog onClose={() => setCreateIn(null)} onCreate={createResume} />}
    </div>
  );
}

function DocCard({
  doc,
  view,
  icon,
  onDelete,
}: {
  doc: DocSummary;
  view: "grid" | "list";
  icon: string;
  onDelete: () => void;
}) {
  const deleteButton = (
    <button
      type="button"
      aria-label={`Delete ${doc.name}`}
      onClick={onDelete}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant opacity-0 transition-opacity hover:bg-on-surface/8 focus:opacity-100 group-hover:opacity-100"
    >
      <span className="icon text-[20px]">delete</span>
    </button>
  );
  if (view === "list") {
    return (
      <div className="group flex h-16 items-center gap-4 rounded-xl bg-surface px-4">
        <span className="icon text-on-surface-variant">{icon}</span>
        <Link href={`/dashboard/documents/${doc.id}`} className="flex-1 truncate text-sm font-medium text-on-surface hover:underline">
          {doc.name}
        </Link>
        <p className="text-xs text-on-surface-variant">{formatDate(doc.updatedAt)}</p>
        {deleteButton}
      </div>
    );
  }
  return (
    <div className="group relative flex aspect-[3/4] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface transition-shadow hover:shadow-md">
      <Link href={`/dashboard/documents/${doc.id}`} className="flex flex-1 flex-col">
        <span className="flex-1 space-y-2 p-4">
          <span className="block h-2 w-1/2 rounded bg-on-surface/20" />
          <span className="block h-1.5 w-full rounded bg-on-surface/10" />
          <span className="block h-1.5 w-5/6 rounded bg-on-surface/10" />
          <span className="block h-1.5 w-2/3 rounded bg-on-surface/10" />
        </span>
        <span className="block border-t border-outline-variant px-3 py-2">
          <span className="block truncate text-sm font-medium text-on-surface">{doc.name}</span>
          <span className="block text-xs text-on-surface-variant">Edited {formatDate(doc.updatedAt)}</span>
        </span>
      </Link>
      <div className="absolute right-1 top-1">{deleteButton}</div>
    </div>
  );
}

function CreateCard({
  view,
  busy,
  label,
  onCreate,
  onDrop,
}: {
  view: "grid" | "list";
  busy: boolean;
  label: string;
  onCreate: () => void;
  onDrop: (files: File[]) => void;
}) {
  const [dragging, setDragging] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onCreate}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const files = [...e.dataTransfer.files];
        if (files.length) onDrop(files);
      }}
      className={`flex items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center transition-colors disabled:opacity-60 ${
        view === "grid" ? "aspect-[3/4] flex-col p-4" : "h-16 px-4"
      } ${dragging ? "border-primary bg-primary-container/60" : "border-outline-variant hover:border-primary hover:bg-primary/8"}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
        <span className="icon">{busy ? "hourglass_top" : "add"}</span>
      </span>
      <span>
        <span className="block text-sm font-medium text-on-surface">{busy ? "Importing…" : label}</span>
        <span className="block text-xs text-on-surface-variant">or drop a PDF or DOCX here</span>
      </span>
    </button>
  );
}
