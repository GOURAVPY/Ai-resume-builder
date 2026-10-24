import LoginForm from "./login-form";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth={2}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M9 13h6M9 17h4" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-lg font-semibold tracking-tight">ResumeAI</span>
    </div>
  );
}

function ResumePreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="rotate-[-3deg] rounded-2xl bg-white p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-200 to-violet-300" />
          <div className="space-y-1.5">
            <div className="h-2.5 w-28 rounded bg-slate-800" />
            <div className="h-2 w-20 rounded bg-slate-300" />
          </div>
        </div>
        {[0, 1].map((s) => (
          <div key={s} className="mt-5 space-y-2">
            <div className="h-2 w-16 rounded bg-indigo-500" />
            <div className="h-2 w-full rounded bg-slate-200" />
            <div className="h-2 w-11/12 rounded bg-slate-200" />
            <div className="h-2 w-4/5 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="absolute -right-4 top-16 rounded-xl bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
        <p className="text-xs font-medium text-slate-500">ATS score</p>
        <p className="text-2xl font-bold text-emerald-600">94%</p>
      </div>
      <div className="absolute -left-6 bottom-10 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs text-violet-600">✦</span>
        <p className="text-xs font-medium text-slate-700">Bullet rewritten by AI</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="grid flex-1 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/30 blur-3xl" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative py-12">
          <ResumePreview />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Land interviews with a resume written alongside AI.
          </h2>
          <p className="mt-3 text-slate-400">
            Tailor every application to the job, beat applicant tracking systems, and export a polished PDF in minutes.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-white px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-slate-900 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-2 text-slate-500">Sign in to continue building your resume.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
