"use client";

import { useState } from "react";
import { Button, ButtonLink, Chip, Icon, Segmented, TextField } from "@/components/m3";

// Sample data with made-up companies; replace with a real jobs API later.
const sampleJobs = [
  { id: "1", title: "Full Stack Software Engineer", company: "Northwind Labs", posted: "2 days ago", type: "Full-time", remote: true },
  { id: "2", title: "Frontend Engineer (React)", company: "Bluepeak Software", posted: "5 days ago", type: "Full-time", remote: false },
  { id: "3", title: "Backend Engineer (Node.js)", company: "Cobalt Systems", posted: "1 week ago", type: "Full-time", remote: true },
  { id: "4", title: "AI Engineer", company: "Lumen Analytics", posted: "3 days ago", type: "Full-time", remote: false },
  { id: "5", title: "Product Designer", company: "Fernway Studio", posted: "1 day ago", type: "Contract", remote: true },
  { id: "6", title: "Data Analyst", company: "Quarry Finance", posted: "2 weeks ago", type: "Full-time", remote: false },
  { id: "7", title: "Software Engineering Intern", company: "Harbor Tech", posted: "4 days ago", type: "Internship", remote: false },
  { id: "8", title: "Marketing Manager", company: "Brightleaf", posted: "6 days ago", type: "Full-time", remote: true },
];
type Job = (typeof sampleJobs)[number];

type Status = "all" | "saved" | "matched" | "applied" | "interviewing" | "rejected";

export default function JobsPage() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("India");
  const [searched, setSearched] = useState<{ title: string; location: string } | null>(null);
  const [status, setStatus] = useState<Status>("all");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string>();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Set<string>>(new Set());

  const words = (searched?.title ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const results = sampleJobs.filter((job) => {
    if (status === "saved" && !saved.has(job.id)) return false;
    if (status === "applied" && !applied.has(job.id)) return false;
    if (status === "matched" || status === "interviewing" || status === "rejected") return false;
    if (filters.has("Remote") && !job.remote) return false;
    for (const f of ["Full-time", "Contract", "Internship"]) if (filters.has(f) && job.type !== f) return false;
    return status !== "all" || words.some((w) => job.title.toLowerCase().includes(w));
  });
  const selected = results.find((j) => j.id === selectedId) ?? results[0];
  const showResults = status !== "all" || searched;

  function toggle(set: Set<string>, id: string, update: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update(next);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap gap-3">
        <Segmented
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All jobs" },
            { value: "saved", label: "Saved", count: saved.size },
            { value: "matched", label: "Matched", count: 0 },
          ]}
        />
        <Segmented
          value={status}
          onChange={setStatus}
          options={[
            { value: "applied", label: "Applied", count: applied.size },
            { value: "interviewing", label: "Interviewing", count: 0 },
            { value: "rejected", label: "Rejected", count: 0 },
          ]}
        />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setStatus("all");
          setSearched({ title, location });
          setSelectedId(undefined);
        }}
        className="mt-6 rounded-3xl bg-surface-container-low p-4"
        style={{ "--field-bg": "var(--color-surface-container-low)" } as React.CSSProperties}
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <TextField className="flex-1" label="Job title" leadingIcon="work" value={title} onChange={setTitle} />
          <TextField className="flex-1" label="Location" leadingIcon="location_on" value={location} onChange={setLocation} />
          <div className="flex gap-2">
            <Button variant="outlined" icon="tune" className="h-14" onClick={() => setShowFilters((v) => !v)}>
              Filter
            </Button>
            <button type="submit" className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-medium text-on-primary transition-[border-radius] active:rounded-xl md:flex-none">
              <Icon name="search" />
              Search
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {["Remote", "Full-time", "Contract", "Internship"].map((f) => (
              <Chip key={f} selected={filters.has(f)} onClick={() => toggle(filters, f, setFilters)}>
                {f}
              </Chip>
            ))}
          </div>
        )}
      </form>

      {!showResults ? (
        <p className="mt-4 rounded-3xl bg-surface-container-low p-6 text-center text-on-surface-variant">
          Enter a job title and location to start your search.
        </p>
      ) : results.length === 0 ? (
        <p className="mt-4 rounded-3xl bg-surface-container-low p-6 text-center text-on-surface-variant">
          No jobs here yet.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="overflow-hidden rounded-3xl bg-surface-container-low">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-lg text-on-surface">{results.length} jobs</h2>
              <span className="text-sm text-on-surface-variant">Best match</span>
            </div>
            <ul>
              {results.map((job) => (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(job.id)}
                    className={`flex w-full gap-4 px-5 py-4 text-left transition-colors ${
                      selected?.id === job.id ? "bg-secondary-container" : "hover:bg-on-surface/8"
                    }`}
                  >
                    <CompanyAvatar name={job.company} />
                    <span className="min-w-0">
                      <span className="block font-medium text-on-surface">{job.title}</span>
                      <span className="block text-sm text-on-surface-variant">
                        {job.company} · {searched?.location || "Anywhere"}
                      </span>
                      <span className="mt-1 block text-xs text-on-surface-variant">{job.posted}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {selected && (
            <JobDetail
              job={selected}
              location={searched?.location || "Anywhere"}
              saved={saved.has(selected.id)}
              applied={applied.has(selected.id)}
              onSave={() => toggle(saved, selected.id, setSaved)}
              onApply={() => setApplied(new Set(applied).add(selected.id))}
            />
          )}
        </div>
      )}
    </div>
  );
}

function CompanyAvatar({ name }: { name: string }) {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tertiary-container font-medium text-tertiary">
      {name[0]}
    </span>
  );
}

function JobDetail({
  job,
  location,
  saved,
  applied,
  onSave,
  onApply,
}: {
  job: Job;
  location: string;
  saved: boolean;
  applied: boolean;
  onSave: () => void;
  onApply: () => void;
}) {
  return (
    <article className="rounded-3xl bg-surface-container-low p-6 lg:sticky lg:top-8 lg:self-start">
      <div className="flex items-start gap-4">
        <CompanyAvatar name={job.company} />
        <div className="flex-1">
          <h2 className="text-[22px] text-on-surface">{job.title}</h2>
          <p className="text-on-surface-variant">
            {job.company} · {location} · {job.type}
            {job.remote && " · Remote"}
          </p>
        </div>
        <button
          type="button"
          aria-label={saved ? "Unsave job" : "Save job"}
          aria-pressed={saved}
          onClick={onSave}
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-primary/8"
        >
          <Icon name="favorite" filled={saved} />
        </button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button icon={applied ? "check" : "send"} disabled={applied} onClick={onApply}>
          {applied ? "Applied" : "Apply now"}
        </Button>
        <ButtonLink href="/dashboard?new=resume" variant="outlined" icon="my_location">
          Target resume
        </ButtonLink>
      </div>
      <h3 className="mt-6 font-medium text-on-surface">About the role</h3>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">
        This is sample job data. Once a jobs source is connected, the full description, responsibilities and
        requirements for each role will show here.
      </p>
    </article>
  );
}
