import type { Metadata } from "next";
import AuthForm from "../auth/auth-form";
import { signup } from "../auth/actions";

export const metadata: Metadata = { title: "Sign up | Supermarket Simulator" };

export default function SignupPage() {
  return (
    <AuthForm
      title="Create account"
      submitLabel="Sign up"
      passwordAutoComplete="new-password"
      action={signup}
      footer={{
        text: "Already have an account?",
        linkLabel: "Log in",
        href: "/login",
      }}
    />
  );
}
