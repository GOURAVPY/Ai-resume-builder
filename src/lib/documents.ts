// Shared shapes for saved documents; used by both the API routes and the UI.

export const docTypes = ["resume", "cover", "resignation"] as const;
export type DocType = (typeof docTypes)[number];

export type Experience = { role: string; company: string; location: string; start: string; end: string; bullets: string };
export type Education = { school: string; degree: string; start: string; end: string; details: string };

export type ResumeData = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string;
  experienceLevel?: string;
  language?: string;
  targetJob?: string;
};

export type LetterData = {
  fullName: string;
  recipient: string;
  company: string;
  role: string;
  body: string;
};

export type DocSummary = {
  id: string;
  type: DocType;
  sectionId: string | null;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type Doc = DocSummary & { data: ResumeData | LetterData };

export type Section = { id: string; type: DocType; name: string };

export const emptyExperience = (): Experience => ({ role: "", company: "", location: "", start: "", end: "", bullets: "" });
export const emptyEducation = (): Education => ({ school: "", degree: "", start: "", end: "", details: "" });

export function emptyResume(): ResumeData {
  return {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    links: "",
    summary: "",
    experience: [emptyExperience()],
    education: [emptyEducation()],
    skills: "",
  };
}

export function emptyLetter(): LetterData {
  return { fullName: "", recipient: "", company: "", role: "", body: "" };
}

export const isResume = (type: DocType) => type === "resume";
