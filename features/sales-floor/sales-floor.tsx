"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  SHELF_CAPACITY,
  formatMoney,
  getProduct,
  type Shelf,
} from "@/features/shared/game-state";
import { GameLoading, TopBar } from "@/features/shared/top-bar";
import { readGame, resetGame, useGame, writeGame } from "@/features/shared/use-game";
import { MAX_QUEUE, runTick, type Customer } from "./simulation";

const TICK_MS = 1000;
const LOG_SIZE = 6;

export default function SalesFloor() {
  const game = useGame();
  const [open, setOpen] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const queueRef = useRef<Customer[]>([]);
  const nextIdRef = useRef(1);

  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => {
      const result = runTick(readGame(), queueRef.current, nextIdRef.current);
      nextIdRef.current += 1;
      queueRef.current = result.queue;
      writeGame(result.game);
      setCustomers(result.queue);
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

          <section>
            <h2 className="mb-2 font-semibold">Shelves</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {game.shelves.map((shelf, index) => (
                <ShelfCard key={index} shelf={shelf} price={shelf.productId ? game.prices[shelf.productId] : 0} />
              ))}
            </div>
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
              <div className="mt-4">
                <p className="mb-1 text-sm text-zinc-500">
                  Waiting in line ({Math.max(0, customers.length - game.checkouts)}/
                  {MAX_QUEUE - game.checkouts})
                </p>
                <div className="flex min-h-10 flex-wrap gap-1 text-3xl">
                  {customers.slice(game.checkouts).map((c) => (
                    <span key={c.id} title={`${c.basket.length} items, ${formatMoney(c.total)}`}>
                      {c.emoji}
                    </span>
                  ))}
                </div>
              </div>
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

function ShelfCard({ shelf, price }: { shelf: Shelf; price: number }) {
  if (!shelf.productId || shelf.quantity === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 p-4 text-center dark:border-zinc-700">
        <span className="text-3xl opacity-40">{shelf.productId ? getProduct(shelf.productId).emoji : "🗄️"}</span>
        <span className="mt-1 text-sm font-medium text-rose-500">Empty shelf</span>
        <Link href="/stock-order" className="text-xs text-emerald-600 hover:underline">
          Restock in Stock Order →
        </Link>
      </div>
    );
  }

  const product = getProduct(shelf.productId);
  const fill = (shelf.quantity / SHELF_CAPACITY) * 100;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <span className="text-3xl">{product.emoji}</span>
        <span className="text-sm font-semibold text-emerald-600">{formatMoney(price)}</span>
      </div>
      <p className="mt-1 font-medium">{product.name}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className={`h-full ${shelf.quantity <= 2 ? "bg-amber-500" : "bg-emerald-500"}`}
          style={{ width: `${fill}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {shelf.quantity}/{SHELF_CAPACITY} on shelf
      </p>
    </div>
  );
}
