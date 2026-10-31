"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatMoney } from "./game-state";
import { useGame } from "./use-game";

const GAME_LINKS = [
  { href: "/sales-floor", label: "Sales Floor" },
  { href: "/stock-order", label: "Stock Order" },
  { href: "/store-expansion", label: "Store Expansion" },
  { href: "/profit-report", label: "Profit Report" },
];

export function TopBar() {
  const game = useGame();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="font-bold">
          🛒 Supermarket Simulator
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {GAME_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 ${
                pathname === link.href
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex gap-3 text-sm font-semibold">
          <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            💰 {game ? formatMoney(game.money) : "…"}
          </span>
          <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            ⭐ Level {game ? game.level : "…"}
          </span>
        </div>
      </div>
    </header>
  );
}

export function GameLoading() {
  return <p className="p-10 text-center text-zinc-500">Loading your store…</p>;
}
