"use client";

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
}: {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer h-14 w-full rounded-[4px] border border-outline bg-transparent px-4 pr-14 text-base text-on-surface outline-none transition-colors hover:border-on-surface focus:border-2 focus:border-primary focus:px-[15px]"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-surface px-1 text-xs text-on-surface-variant transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs peer-focus:text-primary"
      >
        {label}
      </label>
      {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
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

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    // TODO: connect to the real sign-in once the auth details are decided.
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <TextField id="email" label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
        <TextField
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
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

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-on-surface">
            <input type="checkbox" className="h-[18px] w-[18px] accent-primary" />
            Keep me signed in
          </label>
          <a href="#" className="rounded-full px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/8">
            Forgot password?
          </a>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="h-12 w-full rounded-full bg-primary text-sm font-medium tracking-[0.1px] text-on-primary transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 active:shadow-none"
        >
          Sign in
        </button>
      </form>

      <div className="my-6 flex items-center gap-4 text-sm text-on-surface-variant">
        <span className="h-px flex-1 bg-outline-variant" />
        or
        <span className="h-px flex-1 bg-outline-variant" />
      </div>

      <button
        type="button"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-outline text-sm font-medium text-primary transition-colors hover:bg-primary/8"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" />
        </svg>
        Continue with Google
      </button>

      <p className="mt-8 text-center text-sm text-on-surface-variant">
        Don&apos;t have an account?{" "}
        <a href="#" className="font-medium text-primary hover:underline">
          Create one
        </a>
      </p>
    </div>
  );
}
