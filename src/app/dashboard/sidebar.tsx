"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const CREATE_RESUME_EVENT = "create-resume";

export const navItems = [
  { href: "/dashboard", label: "My Dashboard", icon: "dashboard" },
  { href: "/dashboard/ai-agent", label: "AI Resume Agent", icon: "auto_awesome", isNew: true },
  { href: "/dashboard/ai-interview", label: "AI Interview", icon: "video_chat", isNew: true },
  { href: "/dashboard/jobs", label: "Job Search", icon: "work" },
  { href: "/dashboard/samples", label: "Sample Library", icon: "library_books" },
  { href: "/dashboard/review", label: "Review My Resume", icon: "fact_check" },
];

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-on-primary">
        <span className="icon icon-filled text-[22px]">description</span>
      </span>
      <span className="text-[22px] font-medium text-on-surface">ResumeAI</span>
    </Link>
  );
}

function DrawerContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex h-full flex-col gap-1 px-3 py-6">
      <Logo />
      <Link
        href="/dashboard?new=resume"
        onClick={(e) => {
          if (pathname === "/dashboard") {
            e.preventDefault();
            window.dispatchEvent(new Event(CREATE_RESUME_EVENT));
          }
          onNavigate?.();
        }}
        className="mx-1 mb-4 mt-8 flex h-14 items-center gap-3 rounded-2xl bg-primary-container px-4 font-medium text-on-primary-container shadow-sm transition-[border-radius,box-shadow] hover:shadow-md active:rounded-xl"
      >
        <span className="icon">note_add</span>
        Create new resume
      </Link>
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex h-14 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors ${
              active
                ? "bg-secondary-container text-on-secondary-container"
                : "text-on-surface-variant hover:bg-on-surface/8"
            }`}
          >
            <span className={`icon ${active ? "icon-filled" : ""}`}>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.isNew && (
              <span className="rounded-full bg-tertiary-container px-2 py-0.5 text-[11px] font-medium text-tertiary">
                New
              </span>
            )}
          </Link>
        );
      })}
      <AccountRow />
    </nav>
  );
}

function AccountRow() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    api<{ user: { name: string; email: string } }>("/api/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => {});
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="mt-auto flex items-center gap-3 border-t border-outline-variant px-2 pt-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
        {user?.name[0]?.toUpperCase() ?? ""}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-on-surface">{user?.name ?? " "}</span>
        <span className="block truncate text-xs text-on-surface-variant">{user?.email ?? " "}</span>
      </span>
      <button
        type="button"
        aria-label="Sign out"
        title="Sign out"
        onClick={signOut}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/8"
      >
        <span className="icon">logout</span>
      </button>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="hidden w-[300px] shrink-0 bg-surface-container-low lg:block">
        <div className="sticky top-0 h-screen">
          <DrawerContent />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 bg-surface px-2 lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/8"
        >
          <span className="icon">menu</span>
        </button>
        <span className="text-[22px] font-medium text-on-surface">ResumeAI</span>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/32" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] rounded-r-2xl bg-surface-container-low shadow-xl">
            <DrawerContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
