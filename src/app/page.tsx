import AuthShell from "./auth-shell";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue building your resume.">
      <LoginForm />
    </AuthShell>
  );
}
