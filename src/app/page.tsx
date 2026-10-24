import LoginForm from "./login-form";

// Material 3 expressive "cookie" shape: a circle with soft scalloped edges.
function scallopPath(lobes: number, radius: number, depth: number) {
  const points = [];
  for (let i = 0; i <= 360; i += 2) {
    const a = (i * Math.PI) / 180;
    const r = radius + depth * Math.cos(lobes * a);
    points.push(`${(100 + r * Math.cos(a)).toFixed(2)},${(100 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${points.join("L")}Z`;
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-on-primary">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M9 13h6M9 17h4" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-[22px] font-medium text-on-surface">ResumeAI</span>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex flex-1 bg-surface lg:p-4">
      <section className="relative hidden flex-1 overflow-hidden rounded-[28px] bg-[#e6b8ff] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <svg viewBox="0 0 200 200" className="absolute -right-40 -top-24 h-[34rem] w-[34rem] text-[#6c2bd9]">
          <path d={scallopPath(10, 82, 8)} fill="currentColor" />
        </svg>
        <svg viewBox="0 0 200 200" className="absolute -bottom-28 right-24 h-[22rem] w-[22rem] text-[#4a148c]">
          <path d={scallopPath(6, 80, 12)} fill="currentColor" />
        </svg>
        <svg viewBox="0 0 200 200" className="absolute bottom-40 -left-16 h-40 w-40 text-[#c58af9]">
          <path d={scallopPath(8, 80, 10)} fill="currentColor" />
        </svg>

        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-lg">
          <h2 className="text-[57px] font-normal leading-[64px] tracking-[-0.25px] text-on-primary-container">
            Build a resume that gets you hired.
          </h2>
          <p className="mt-6 max-w-md text-base leading-6 text-on-primary-container/80">
            Write with AI, tailor to every job, and export a polished PDF in minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["AI writing", "ATS check", "PDF export"].map((chip) => (
              <span
                key={chip}
                className="rounded-lg border border-on-primary-container/30 bg-white/40 px-4 py-1.5 text-sm font-medium text-on-primary-container backdrop-blur"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8 lg:max-w-xl">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-[32px] font-normal leading-10 text-on-surface">Welcome back</h1>
          <p className="mt-2 text-base text-on-surface-variant">Sign in to continue building your resume.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
