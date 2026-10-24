"use client";

import { useState } from "react";
import { Chip, Icon, Segmented, TextField } from "@/components/m3";

const categories = ["Pro", "Business", "Programming", "Engineering", "Marketing", "Design", "Student", "Medical", "Finance", "Education", "Legal", "Other"];

const samples = [
  { id: "1", role: "Project Manager", category: "Business", pro: true },
  { id: "2", role: "Senior Business Analyst", category: "Business", pro: true },
  { id: "3", role: "Software Engineer", category: "Programming", pro: false },
  { id: "4", role: "Front-End Engineer", category: "Programming", pro: true },
  { id: "5", role: "Data Engineer", category: "Programming", pro: true },
  { id: "6", role: "Embedded Software Developer", category: "Engineering", pro: false },
  { id: "7", role: "IT Security Architect", category: "Engineering", pro: true },
  { id: "8", role: "Digital Marketing Specialist", category: "Marketing", pro: false },
  { id: "9", role: "Creative Producer", category: "Design", pro: true },
  { id: "10", role: "UX Designer", category: "Design", pro: false },
  { id: "11", role: "Software Engineering Intern", category: "Student", pro: false },
  { id: "12", role: "Registered Nurse", category: "Medical", pro: false },
  { id: "13", role: "Financial Analyst", category: "Finance", pro: true },
  { id: "14", role: "High School Teacher", category: "Education", pro: false },
  { id: "15", role: "Paralegal", category: "Legal", pro: false },
  { id: "16", role: "Customer Service Representative", category: "Other", pro: false },
];

export default function SamplesPage() {
  const [view, setView] = useState<"all" | "saved">("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>();
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const shown = samples.filter((s) => {
    if (view === "saved" && !saved.has(s.id)) return false;
    if (category === "Pro" && !s.pro) return false;
    if (category && category !== "Pro" && s.category !== category) return false;
    return s.role.toLowerCase().includes(query.trim().toLowerCase());
  });

  return (
    <div className="mx-auto max-w-6xl">
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: "all", label: "All samples" },
          { value: "saved", label: "Saved", count: saved.size },
        ]}
      />

      <div
        className="mt-6 rounded-3xl bg-surface-container-low p-4 sm:p-6"
        style={{ "--field-bg": "var(--color-surface-container-low)" } as React.CSSProperties}
      >
        <TextField
          label="Search resume and cover letter samples by role or skill"
          leadingIcon="search"
          value={query}
          onChange={setQuery}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Chip key={c} selected={category === c} onClick={() => setCategory(category === c ? undefined : c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-3xl bg-surface-container-low p-6 text-center text-on-surface-variant">
          No samples match your search.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((s) => (
            <article key={s.id} className="group overflow-hidden rounded-xl bg-surface-container-low transition-shadow hover:shadow-md">
              <div className="relative bg-surface-container p-4 pb-0">
                <SamplePreview role={s.role} />
                <button
                  type="button"
                  aria-label={saved.has(s.id) ? "Unsave sample" : "Save sample"}
                  aria-pressed={saved.has(s.id)}
                  onClick={() => {
                    const next = new Set(saved);
                    if (next.has(s.id)) next.delete(s.id);
                    else next.add(s.id);
                    setSaved(next);
                  }}
                  className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-primary opacity-0 transition-opacity hover:bg-surface group-hover:opacity-100 aria-pressed:opacity-100"
                >
                  <Icon name="bookmark" filled={saved.has(s.id)} />
                </button>
              </div>
              <div className="flex items-center gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-on-surface-variant">{s.category}</p>
                  <h2 className="truncate font-medium text-on-surface">{s.role}</h2>
                </div>
                {s.pro && (
                  <span className="rounded-lg bg-tertiary-container px-2 py-1 text-xs font-medium text-tertiary">Pro</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// A miniature, generic resume page drawn with CSS.
function SamplePreview({ role }: { role: string }) {
  return (
    <div className="h-40 overflow-hidden rounded-t-md bg-white px-4 pt-4 shadow-sm">
      <p className="text-center font-serif text-[10px] text-neutral-800">Alex Morgan</p>
      <p className="text-center text-[6px] text-neutral-500">{role}</p>
      {["Summary", "Experience", "Education"].map((h) => (
        <div key={h} className="mt-2">
          <p className="border-b border-neutral-300 text-[6px] font-medium uppercase text-neutral-700">{h}</p>
          <div className="mt-1 space-y-0.5">
            <div className="h-[3px] w-full rounded bg-neutral-200" />
            <div className="h-[3px] w-11/12 rounded bg-neutral-200" />
            <div className="h-[3px] w-4/5 rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
