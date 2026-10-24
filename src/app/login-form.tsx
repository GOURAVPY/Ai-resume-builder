"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Material 3 outlined text field with a floating label.
function TextField({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
  trailing,
  error,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: React.ReactNode;
  error?: string;
}) {
  const border = error
    ? "border-error hover:border-on-error-container focus:border-error"
    : "border-outline hover:border-on-surface focus:border-primary";
  const labelColor = error ? "text-error peer-focus:text-error" : "text-on-surface-variant peer-focus:text-primary";
  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder=" "
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`peer h-14 w-full rounded-[4px] border bg-transparent px-4 pr-14 text-base text-on-surface caret-primary outline-none transition-colors focus:border-2 focus:px-[15px] ${border}`}
        />
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-surface px-1 text-xs transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs ${labelColor}`}
        >
          {label}
        </label>
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="px-4 pt-1 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-6 w-6">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

export default function LoginForm({ mode = "login" }: { mode?: "login" | "signup" }) {
  const signup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = {
      name: signup && !name.trim() ? "Enter your name" : undefined,
      email: /^\S+@\S+\.\S+$/.test(email) ? undefined : "Enter a valid email address",
      password: password.length >= 8 ? undefined : "Password must be at least 8 characters",
    };
    setErrors(next);
    if (next.name || next.email || next.password) return;

    setBusy(true);
    const res = await fetch(signup ? "/api/auth/signup" : "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }
    const { error } = await res.json().catch(() => ({ error: "Something went wrong. Please try again." }));
    setErrors({ form: error });
    setBusy(false);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {signup && (
          <TextField id="name" label="Full name" type="text" autoComplete="name" value={name} onChange={setName} error={errors.name} />
        )}
        <TextField id="email" label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} error={errors.email} />
        <TextField
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete={signup ? "new-password" : "current-password"}
          value={password}
          onChange={setPassword}
          error={errors.password}
          trailing={
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-surface/8"
            >
              <EyeIcon off={showPassword} />
            </button>
          }
        />

        {errors.form && (
          <p role="alert" className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="h-14 w-full rounded-full bg-primary text-base font-medium text-on-primary transition-[border-radius,box-shadow] duration-150 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 active:rounded-xl active:shadow-none disabled:opacity-60"
        >
          {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-on-surface-variant">
        {signup ? "Already have an account? " : "Don't have an account? "}
        <Link href={signup ? "/" : "/signup"} className="font-medium text-primary hover:underline">
          {signup ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
