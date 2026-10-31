"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatMoney, getProduct } from "@/features/shared/game-state";
import { GameLoading, TopBar } from "@/features/shared/top-bar";
import { readGame, resetGame, useGame, writeGame } from "@/features/shared/use-game";
import { MAX_QUEUE, runTick, type Customer } from "./simulation";
import { StoreScene, type LeavingCustomer } from "./store-scene";

const TICK_MS = 1000;
const LOG_SIZE = 6;
const LEAVE_MS = 3000; // how long a paid customer stays visible walking out

export default function SalesFloor() {
  const game = useGame();
  const [open, setOpen] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leaving, setLeaving] = useState<LeavingCustomer[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const queueRef = useRef<Customer[]>([]);
  const nextIdRef = useRef(1);

  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => {
      const previous = queueRef.current;
      const result = runTick(readGame(), previous, nextIdRef.current);
      nextIdRef.current += 1;
      queueRef.current = result.queue;
      writeGame(result.game);
      setCustomers(result.queue);

      // Customers who just paid walk to the exit before disappearing.
      const now = Date.now();
      const paid = previous
        .map((customer, counterIndex) => ({ id: customer.id, counterIndex, until: now + LEAVE_MS }))
        .filter((c) => !result.queue.some((q) => q.id === c.id));
      setLeaving((prev) => [...prev.filter((l) => l.until > now), ...paid]);

      if (result.events.length > 0) {
        setLog((prev) => [...result.events.reverse(), ...prev].slice(0, LOG_SIZE));
      }
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [open]);

  function handleReset() {
    if (!window.confirm("Start over? All money, stock and upgrades will be lost.")) return;
    queueRef.current = [];
    setCustomers([]);
    setLeaving([]);
    setLog([]);
    resetGame();
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <TopBar />
      {!game ? (
        <GameLoading />
      ) : (
        <main className="mx-auto w-full max-w-6xl space-y-6 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Sales Floor</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Customers take products from the shelves and pay at the checkout.
              </p>
            </div>
            <button
              onClick={() => setOpen((o) => !o)}
              className={`rounded-xl px-5 py-2.5 font-semibold text-white ${
                open ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {open ? "⏸ Close store" : "▶ Open store"}
            </button>
          </div>

          <section className="relative h-[520px] overflow-hidden rounded-2xl shadow-sm">
            <StoreScene
              shelves={game.shelves}
              prices={game.prices}
              checkouts={game.checkouts}
              customers={customers}
              leaving={leaving}
            />
            <p className="pointer-events-none absolute bottom-2 left-3 rounded bg-white/80 px-2 py-1 text-xs text-zinc-600">
              Drag to rotate · scroll to zoom · right-drag to move
            </p>
            {game.shelves.some((shelf) => shelf.quantity === 0) && (
              <Link
                href="/stock-order"
                className="absolute right-3 top-3 rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-rose-600"
              >
                Empty shelves! Restock in Stock Order →
              </Link>
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm lg:col-span-2 dark:bg-zinc-900">
              <h2 className="mb-3 font-semibold">
                Checkout ({game.checkouts} {game.checkouts === 1 ? "counter" : "counters"})
              </h2>
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: game.checkouts }, (_, i) => {
                  const customer = customers[i];
                  return (
                    <div
                      key={i}
                      className="flex w-36 flex-col items-center rounded-xl border-2 border-dashed border-emerald-300 p-3 text-center dark:border-emerald-800"
                    >
                      <span className="text-xs text-zinc-500">Counter {i + 1}</span>
                      <span className="my-1 text-3xl">{customer ? customer.emoji : "🧾"}</span>
                      <span className="min-h-5 text-sm">
                        {customer
                          ? customer.basket.map((b) => getProduct(b.productId).emoji).join("")
                          : "Free"}
                      </span>
                      {customer && (
                        <span className="text-sm font-semibold text-emerald-600">
                          {formatMoney(customer.total)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-zinc-500">
                Waiting in line: {Math.max(0, customers.length - game.checkouts)}/
                {MAX_QUEUE - game.checkouts}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
              <h2 className="mb-3 font-semibold">Store activity</h2>
              {log.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  {open ? "Waiting for customers…" : "The store is closed."}
                </p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {log.map((entry, i) => (
                    <li key={`${i}-${entry}`} className={i === 0 ? "font-medium" : "text-zinc-500"}>
                      {entry}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <div className="text-right">
            <button onClick={handleReset} className="text-sm text-zinc-500 hover:text-rose-600 hover:underline">
              Start a new game
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
