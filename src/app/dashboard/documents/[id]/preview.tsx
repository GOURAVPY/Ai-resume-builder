import type { LetterData, ResumeData } from "@/lib/documents";

// Print-ready pages. Plain black-on-white so the PDF looks like a normal resume.

const lines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

export function ResumePreview({ data }: { data: ResumeData }) {
  const contact = [data.email, data.phone, data.location, data.links].filter(Boolean);
  const experience = data.experience.filter((e) => e.role || e.company || e.bullets);
  const education = data.education.filter((e) => e.school || e.degree);
  const skills = data.skills
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <article className="resume-page font-serif text-[13px] leading-snug text-neutral-900">
      <header className="text-center">
        <h1 className="text-[26px] font-semibold tracking-wide">{data.fullName || "Your Name"}</h1>
        {data.title && <p className="mt-0.5 text-[14px] text-neutral-700">{data.title}</p>}
        {contact.length > 0 && <p className="mt-1 text-[12px] text-neutral-600">{contact.join("  •  ")}</p>}
      </header>

      {data.summary && (
        <PreviewSection title="Summary">
          <p>{data.summary}</p>
        </PreviewSection>
      )}

      {experience.length > 0 && (
        <PreviewSection title="Experience">
          {experience.map((e, i) => (
            <div key={i} className="mb-3 break-inside-avoid">
              <div className="flex justify-between gap-4">
                <p className="font-semibold">{[e.role, e.company].filter(Boolean).join(" — ")}</p>
                <p className="shrink-0 text-neutral-600">{[e.start, e.end].filter(Boolean).join(" – ")}</p>
              </div>
              {e.location && <p className="text-neutral-600">{e.location}</p>}
              {lines(e.bullets).length > 0 && (
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {lines(e.bullets).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </PreviewSection>
      )}

      {education.length > 0 && (
        <PreviewSection title="Education">
          {education.map((e, i) => (
            <div key={i} className="mb-2 break-inside-avoid">
              <div className="flex justify-between gap-4">
                <p className="font-semibold">{[e.degree, e.school].filter(Boolean).join(" — ")}</p>
                <p className="shrink-0 text-neutral-600">{[e.start, e.end].filter(Boolean).join(" – ")}</p>
              </div>
              {e.details && <p>{e.details}</p>}
            </div>
          ))}
        </PreviewSection>
      )}

      {skills.length > 0 && (
        <PreviewSection title="Skills">
          <p>{skills.join(" • ")}</p>
        </PreviewSection>
      )}
    </article>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="mb-1.5 border-b border-neutral-400 pb-0.5 text-[12px] font-semibold uppercase tracking-[0.12em]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function LetterPreview({ data }: { data: LetterData }) {
  const today = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  return (
    <article className="resume-page font-serif text-[13px] leading-relaxed text-neutral-900">
      <p className="text-[18px] font-semibold">{data.fullName || "Your Name"}</p>
      <p className="mt-6 text-neutral-700">{today}</p>
      {(data.recipient || data.company) && (
        <p className="mt-4 whitespace-pre-line">{[data.recipient, data.company].filter(Boolean).join("\n")}</p>
      )}
      <div className="mt-6 whitespace-pre-line">{data.body || "Your letter will appear here."}</div>
    </article>
  );
}
