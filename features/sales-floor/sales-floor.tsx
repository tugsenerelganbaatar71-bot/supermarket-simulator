"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatMoney, getProduct } from "@/features/shared/game-state";
import { GameLoading, TopBar } from "@/features/shared/top-bar";
import { readGame, resetGame, updateGame, useGame, writeGame } from "@/features/shared/use-game";
import { MAX_QUEUE, frontAt, payCustomer, runTick, type Customer } from "./simulation";
import { SHOPS, buyOffer, findGood, shopOffers } from "./shops";
import { StoreScene, type LeavingCustomer } from "./store-scene";

const TICK_MS = 1000;
const LOG_SIZE = 6;
const LEAVE_MS = 3000; // how long a paid customer stays visible walking out

export default function SalesFloor() {
  const game = useGame();
  const [open, setOpen] = useState(true);
  const [walking, setWalking] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leaving, setLeaving] = useState<LeavingCustomer[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [entered, setEntered] = useState<Record<number, string>>({});
  const [wrong, setWrong] = useState<number | null>(null); // customer id with a wrong total
  const [nearShop, setNearShop] = useState<string | null>(null); // shop door you are standing at
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
        .map((customer) => ({ id: customer.id, counterIndex: customer.counter, until: now + LEAVE_MS }))
        .filter((c) => !result.queue.some((q) => q.id === c.id));
      setLeaving((prev) => [...prev.filter((l) => l.until > now), ...paid]);

      if (result.events.length > 0) {
        setLog((prev) => [...result.events.reverse(), ...prev].slice(0, LOG_SIZE));
      }
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [open]);

  // In walk mode, press 1-3 at a shop door to buy a pack of that product.
  const shop = walking ? (SHOPS.find((s) => s.id === nearShop) ?? null) : null;
  useEffect(() => {
    if (!shop) return;
    const onKey = (e: KeyboardEvent) => {
      const index = Number(e.key) - 1;
      const offer = shopOffers(shop, readGame())[index];
      if (!offer) return;
      const before = readGame();
      updateGame((g) => buyOffer(g, shop, offer.id));
      const bought = readGame().money < before.money;
      const what = offer.quantity > 1 ? `${offer.quantity} ${offer.name}` : offer.name;
      setLog((prev) =>
        [
          bought
            ? `${shop.emoji} bought ${what} at the ${shop.name} for ${formatMoney(offer.price)}`
            : `Not enough money for ${offer.name}`,
          ...prev,
        ].slice(0, LOG_SIZE),
      );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shop]);

  // The player adds up the basket and types the total; a correct total rings the customer up.
  function handleCharge(customer: Customer) {
    if (Number(entered[customer.id]) !== customer.total) {
      setWrong(customer.id);
      return;
    }
    const previous = queueRef.current;
    const counterIndex = customer.counter;
    if (!previous.some((c) => c.id === customer.id)) return;
    writeGame(payCustomer(readGame(), customer));
    queueRef.current = previous.filter((c) => c.id !== customer.id);
    setCustomers(queueRef.current);
    setLeaving((prev) => [
      ...prev.filter((l) => l.until > Date.now()),
      { id: customer.id, counterIndex, until: Date.now() + LEAVE_MS },
    ]);
    setLog((prev) => [`${customer.emoji} paid ${customer.total} at the checkout`, ...prev].slice(0, LOG_SIZE));
    setWrong(null);
  }

  function handleReset() {
    if (!window.confirm("Start over? All money, stock and upgrades will be lost.")) return;
    queueRef.current = [];
    setCustomers([]);
    setLeaving([]);
    setLog([]);
    setEntered({});
    setWrong(null);
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
                Customers take products from the shelves. Add up their basket at the checkout and type the total.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setWalking((w) => !w)}
                className="rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-700"
              >
                {walking ? "🚪 Exit walk mode" : "🚶 Walk inside"}
              </button>
              <button
                onClick={() => setOpen((o) => !o)}
                className={`rounded-xl px-5 py-2.5 font-semibold text-white ${
                  open ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {open ? "⏸ Close store" : "▶ Open store"}
              </button>
            </div>
          </div>

          <section className="relative h-[520px] overflow-hidden rounded-2xl shadow-sm">
            <StoreScene
              shelves={game.shelves}
              prices={game.prices}
              checkouts={game.checkouts}
              customers={customers}
              leaving={leaving}
              walking={walking}
              onExitWalk={() => {
                setWalking(false);
                setNearShop(null);
              }}
              onNearShop={setNearShop}
            />
            {shop && (
              <div className="pointer-events-none absolute left-1/2 top-4 w-72 -translate-x-1/2 rounded-2xl bg-white/95 p-4 shadow-lg">
                <h3 className="font-bold">
                  {shop.emoji} {shop.name}
                </h3>
                <p className="text-xs text-zinc-500">
                  Press a number to buy · you have {formatMoney(game.money)}
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {shopOffers(shop, game).map((offer, i) => (
                    <li key={offer.id} className="flex justify-between gap-3">
                      <span>
                        <kbd className="rounded bg-zinc-200 px-1.5 font-mono">{i + 1}</kbd> {offer.emoji}{" "}
                        {offer.name}
                        {offer.quantity > 1 ? ` ×${offer.quantity}` : ""}
                        {shop.walkIn && game.owned[offer.id] ? ` (own ${game.owned[offer.id]})` : ""}
                      </span>
                      <span className={offer.price > game.money ? "text-rose-500" : ""}>
                        {formatMoney(offer.price)}
                      </span>
                    </li>
                  ))}
                  {shopOffers(shop, game).length === 0 && (
                    <li className="text-zinc-500">Nothing here that your store sells yet.</li>
                  )}
                </ul>
              </div>
            )}
            <p className="pointer-events-none absolute bottom-2 left-3 rounded bg-white/80 px-2 py-1 text-xs text-zinc-600">
              {walking
                ? "Click the scene to look around · W A S D to walk · Shift to run · walk to a shop on the street to buy (go inside the Fashion and Game stores) · Esc to exit"
                : "Drag to rotate · scroll to zoom · right-drag to move"}
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
                  const customer = frontAt(customers, i);
                  return (
                    <div
                      key={i}
                      className="flex w-40 flex-col items-center rounded-xl border-2 border-dashed border-emerald-300 p-3 text-center dark:border-emerald-800"
                    >
                      <span className="text-xs text-zinc-500">
                        Counter {i + 1} · {i === 0 ? "👤 you" : "🤖 AI"}
                      </span>
                      <span className="my-1 text-3xl">{customer ? customer.emoji : "🧾"}</span>
                      {customer ? (
                        <>
                          <ul className="my-1 space-y-0.5 text-sm">
                            {customer.basket.map((item, n) => (
                              <li key={n}>
                                {getProduct(item.productId).emoji} {formatMoney(item.price)}
                              </li>
                            ))}
                          </ul>
                          {i > 0 ? (
                            <span className="mt-1 rounded-lg bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                              🤖 AI cashier ringing up…
                            </span>
                          ) : (
                          <form
                            className="mt-1 flex w-full flex-col gap-1"
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleCharge(customer);
                            }}
                          >
                            <input
                              type="number"
                              min={0}
                              inputMode="numeric"
                              placeholder="Total $"
                              value={entered[customer.id] ?? ""}
                              onChange={(e) => {
                                setEntered((prev) => ({ ...prev, [customer.id]: e.target.value }));
                                setWrong(null);
                              }}
                              className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-center text-sm dark:border-zinc-700 dark:bg-zinc-800"
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-600 py-1 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                              Charge
                            </button>
                            {wrong === customer.id && (
                              <span className="text-xs text-rose-500">Wrong total, add it up again</span>
                            )}
                          </form>
                          )}
                        </>
                      ) : (
                        <span className="min-h-5 text-sm">Free</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-zinc-500">
                Waiting in line: {Math.max(0, customers.length - Array.from({ length: game.checkouts }, (_, c) => frontAt(customers, c)).filter(Boolean).length)}/
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

          <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
            <h2 className="mb-2 font-semibold">🎒 Your bag</h2>
            {Object.keys(game.owned).length === 0 ? (
              <p className="text-sm text-zinc-500">
                Nothing yet. Walk inside the Fashion Store or the Game Store on the street (walk mode) to buy clothes and games.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(game.owned).map(([id, count]) => {
                  const good = findGood(id);
                  return (
                    <span key={id} className="rounded-full bg-violet-50 px-3 py-1 text-sm text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                      {good?.emoji} {good?.name ?? id} ×{count}
                    </span>
                  );
                })}
              </div>
            )}
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
