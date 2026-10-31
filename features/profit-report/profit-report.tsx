"use client";

import { formatMoney, getProduct, type GameState } from "@/features/shared/game-state";
import { GameLoading, TopBar } from "@/features/shared/top-bar";
import { useGame } from "@/features/shared/use-game";
import { ReportScene } from "./report-scene";

const TOP_SELLERS = 5;

export default function ProfitReport() {
  const game = useGame();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <TopBar />
      {!game ? <GameLoading /> : <Report game={game} />}
    </div>
  );
}

function Report({ game }: { game: GameState }) {
  const { income, spending, customersServed, unitsSold, revenueByProduct } = game.stats;
  const profit = income - spending;

  const bestSellers = Object.entries(unitsSold)
    .map(([productId, units]) => ({
      product: getProduct(productId),
      units,
      revenue: revenueByProduct[productId] ?? 0,
    }))
    .sort((a, b) => b.units - a.units)
    .slice(0, TOP_SELLERS);
  const maxUnits = bestSellers[0]?.units ?? 0;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Profit Report</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          How your store is doing so far.
        </p>
      </div>

      <section className="relative h-[380px] overflow-hidden rounded-2xl shadow-sm">
        <ReportScene
          income={income}
          spending={spending}
          sellers={bestSellers.map(({ product, units }) => ({
            id: product.id,
            emoji: product.emoji,
            name: product.name,
            units,
          }))}
        />
        <p className="pointer-events-none absolute bottom-2 left-3 rounded bg-white/80 px-2 py-1 text-xs text-zinc-600">
          Drag to rotate · scroll to zoom
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Total income" value={formatMoney(income)} tone="text-emerald-600" />
        <StatTile label="Total spending" value={formatMoney(spending)} tone="text-rose-600" />
        <StatTile
          label="Profit"
          value={`${profit < 0 ? "−" : ""}${formatMoney(Math.abs(profit))}`}
          tone={profit >= 0 ? "text-emerald-600" : "text-rose-600"}
        />
        <StatTile label="Store level" value={`⭐ ${game.level}`} tone="text-amber-600" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl bg-white p-4 shadow-sm md:col-span-2 dark:bg-zinc-900">
          <h2 className="mb-3 font-semibold">Best-selling products</h2>
          {bestSellers.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No sales yet. Open the store on the Sales Floor to start selling.
            </p>
          ) : (
            <ol className="space-y-3">
              {bestSellers.map(({ product, units, revenue }, index) => (
                <li key={product.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {index + 1}. {product.emoji} {product.name}
                    </span>
                    <span className="text-zinc-500">
                      {units} sold · {formatMoney(revenue)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(units / maxUnits) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-4 text-sm shadow-sm dark:bg-zinc-900">
          <h2 className="font-semibold">Store summary</h2>
          <SummaryRow label="Customers served" value={customersServed.toLocaleString("en-US")} />
          <SummaryRow
            label="Average basket"
            value={customersServed > 0 ? formatMoney(Math.round(income / customersServed)) : "—"}
          />
          <SummaryRow label="Cash on hand" value={formatMoney(game.money)} />
          <SummaryRow label="Shelves" value={String(game.shelves.length)} />
          <SummaryRow label="Checkout counters" value={String(game.checkouts)} />
          <SummaryRow label="Product types" value={String(game.unlockedProducts.length)} />
        </section>
      </div>
    </main>
  );
}

function StatTile({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
