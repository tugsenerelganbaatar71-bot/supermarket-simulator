"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "./actions";

type Props = {
  title: string;
  submitLabel: string;
  passwordAutoComplete: "current-password" | "new-password";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  footer: { text: string; linkLabel: string; href: string };
};

export default function AuthForm({
  title,
  submitLabel,
  passwordAutoComplete,
  action,
  footer,
}: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <form
        action={formAction}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-900"
      >
        <h1 className="text-2xl font-semibold">{title}</h1>

        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={passwordAutoComplete}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.message && (
          <p className="text-sm text-green-600">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "Please wait..." : submitLabel}
        </button>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          {footer.text}{" "}
          <Link
            href={footer.href}
            className="font-medium text-emerald-600 hover:underline"
          >
            {footer.linkLabel}
          </Link>
        </p>
      </form>
    </main>
  );
}
