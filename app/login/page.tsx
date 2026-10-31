import type { Metadata } from "next";
import AuthForm from "../auth/auth-form";
import { login } from "../auth/actions";

export const metadata: Metadata = { title: "Log in | Supermarket Simulator" };

export default function LoginPage() {
  return (
    <AuthForm
      title="Log in"
      submitLabel="Log in"
      passwordAutoComplete="current-password"
      action={login}
      footer={{ text: "No account yet?", linkLabel: "Sign up", href: "/signup" }}
    />
  );
}
