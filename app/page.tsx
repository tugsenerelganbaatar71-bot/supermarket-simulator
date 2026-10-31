import Link from "next/link";
import { logout } from "./auth/actions";

// Game pages from docs/plan.md. They are built one by one in Stage 1.
const GAME_PAGES = [
  { href: "/sales-floor", label: "Sales Floor" },
  { href: "/stock-order", label: "Stock Order" },
  { href: "/store-expansion", label: "Store Expansion" },
  { href: "/profit-report", label: "Profit Report" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 p-6 dark:bg-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold">🛒 Supermarket Simulator</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Sell products, earn money, and grow your store.
        </p>
      </div>

      <nav className="grid w-full max-w-md grid-cols-2 gap-3">
        {GAME_PAGES.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="rounded-xl bg-white p-4 text-center font-medium shadow-sm hover:bg-emerald-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            {page.label}
          </Link>
        ))}
      </nav>

      <div className="flex gap-4 text-sm">
        <Link href="/login" className="text-emerald-600 hover:underline">
          Log in
        </Link>
        <Link href="/signup" className="text-emerald-600 hover:underline">
          Sign up
        </Link>
        <form action={logout}>
          <button type="submit" className="text-zinc-500 hover:underline">
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
