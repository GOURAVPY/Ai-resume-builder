import AuthShell from "../auth-shell";
import LoginForm from "../login-form";

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" subtitle="Start building your resume in minutes.">
      <LoginForm mode="signup" />
    </AuthShell>
  );
}
