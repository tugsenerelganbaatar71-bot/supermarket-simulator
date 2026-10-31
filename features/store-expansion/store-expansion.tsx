"use client";

import {
  CATALOG,
  MAX_CHECKOUTS,
  MAX_SHELVES,
  formatMoney,
  type GameState,
} from "@/features/shared/game-state";
import { GameLoading, TopBar } from "@/features/shared/top-bar";
import { updateGame, useGame } from "@/features/shared/use-game";
import {
  buyCheckout,
  buyShelf,
  checkoutUpgradeCost,
  nextLockedProduct,
  shelfUpgradeCost,
  unlockProduct,
} from "./upgrades";

type UpgradeCardProps = {
  emoji: string;
  title: string;
  description: string;
  progress: string;
  cost: number | null; // null = fully upgraded
  money: number;
  onBuy: () => void;
};

export default function StoreExpansion() {
  const game = useGame();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <TopBar />
      {!game ? <GameLoading /> : <Upgrades game={game} />}
    </div>
  );
}

function Upgrades({ game }: { game: GameState }) {
  const nextProduct = nextLockedProduct(game);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Store Expansion</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Spend your earnings to grow the store. Every upgrade raises your store level.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <UpgradeCard
          emoji="🗄️"
          title="More shelves"
          description="Display more products at the same time."
          progress={`${game.shelves.length}/${MAX_SHELVES} shelves`}
          cost={game.shelves.length < MAX_SHELVES ? shelfUpgradeCost(game) : null}
          money={game.money}
          onBuy={() => updateGame(buyShelf)}
        />
        <UpgradeCard
          emoji={nextProduct ? nextProduct.emoji : "📦"}
          title={nextProduct ? `Unlock ${nextProduct.name}` : "New product types"}
          description="Add a new item to the supplier's list so you can stock it."
          progress={`${game.unlockedProducts.length}/${CATALOG.length} products`}
          cost={nextProduct ? nextProduct.unlockCost : null}
          money={game.money}
          onBuy={() => updateGame(unlockProduct)}
        />
        <UpgradeCard
          emoji="🧾"
          title="More checkout counters"
          description="Serve customers faster so the line doesn't get too long."
          progress={`${game.checkouts}/${MAX_CHECKOUTS} counters`}
          cost={game.checkouts < MAX_CHECKOUTS ? checkoutUpgradeCost(game) : null}
          money={game.money}
          onBuy={() => updateGame(buyCheckout)}
        />
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <h2 className="mb-3 font-semibold">Product range</h2>
        <div className="flex flex-wrap gap-2">
          {CATALOG.map((product) => {
            const unlocked = game.unlockedProducts.includes(product.id);
            return (
              <span
                key={product.id}
                className={`rounded-full px-3 py-1 text-sm ${
                  unlocked
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                }`}
              >
                {unlocked ? product.emoji : "🔒"} {product.name}
              </span>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Higher store levels bring more customers to the sales floor.
        </p>
      </section>
    </main>
  );
}

function UpgradeCard({ emoji, title, description, progress, cost, money, onBuy }: UpgradeCardProps) {
  const maxed = cost === null;
  const affordable = !maxed && cost <= money;

  return (
    <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm dark:bg-zinc-900">
      <span className="text-4xl">{emoji}</span>
      <h2 className="mt-2 text-lg font-semibold">{title}</h2>
      <p className="mt-1 flex-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      <p className="mt-3 text-xs text-zinc-500">{progress}</p>
      <button
        disabled={!affordable}
        onClick={onBuy}
        className="mt-3 rounded-xl bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
      >
        {maxed ? "Fully upgraded" : `Buy for ${formatMoney(cost)}`}
      </button>
      {!maxed && !affordable && (
        <p className="mt-1 text-center text-xs text-rose-500">
          Need {formatMoney(cost - money)} more
        </p>
      )}
    </div>
  );
}
