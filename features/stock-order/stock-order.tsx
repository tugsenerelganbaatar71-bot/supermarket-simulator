"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CATALOG,
  SHELF_CAPACITY,
  formatMoney,
  getProduct,
  type GameState,
  type Product,
} from "@/features/shared/game-state";
import { GameLoading, TopBar } from "@/features/shared/top-bar";
import { updateGame, useGame } from "@/features/shared/use-game";
import {
  MAX_PRICE,
  MIN_PRICE,
  buyStock,
  clearShelf,
  orderCost,
  restockAmount,
  restockShelf,
  setPrice,
} from "./stock-actions";

const ORDER_SIZES = [5, 10, 25];

export default function StockOrder() {
  const game = useGame();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <TopBar />
      {!game ? (
        <GameLoading />
      ) : (
        <main className="mx-auto w-full max-w-6xl space-y-6 p-4">
          <div>
            <h1 className="text-2xl font-bold">Stock Order</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Buy products from the supplier, set your prices, and fill the shelves.
            </p>
          </div>

          <section className="overflow-x-auto rounded-2xl bg-white shadow-sm dark:bg-zinc-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Wholesale</th>
                  <th className="p-3">In storage</th>
                  <th className="p-3">Buy from supplier</th>
                  <th className="p-3">Selling price</th>
                </tr>
              </thead>
              <tbody>
                {CATALOG.map((product) =>
                  game.unlockedProducts.includes(product.id) ? (
                    <SupplierRow key={product.id} game={game} product={product} />
                  ) : (
                    <tr key={product.id} className="border-b border-zinc-100 text-zinc-400 last:border-0 dark:border-zinc-800">
                      <td className="p-3">
                        <span className="mr-2 text-xl grayscale">{product.emoji}</span>
                        {product.name}
                      </td>
                      <td className="p-3" colSpan={4}>
                        🔒 Locked —{" "}
                        <Link href="/store-expansion" className="text-emerald-600 hover:underline">
                          unlock in Store Expansion
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="mb-2 font-semibold">Restock shelves</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {game.shelves.map((_, index) => (
                <ShelfRestock key={index} game={game} shelfIndex={index} />
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

function SupplierRow({ game, product }: { game: GameState; product: Product }) {
  const price = game.prices[product.id];
  const reaction =
    price <= product.suggestedPrice
      ? { text: "Customers happy", color: "text-emerald-600" }
      : price < product.suggestedPrice * 2
        ? { text: "Some will skip it", color: "text-amber-600" }
        : { text: "Too expensive", color: "text-rose-600" };

  return (
    <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
      <td className="p-3 font-medium">
        <span className="mr-2 text-xl">{product.emoji}</span>
        {product.name}
      </td>
      <td className="p-3">{formatMoney(product.wholesalePrice)}</td>
      <td className="p-3">{game.storage[product.id] ?? 0}</td>
      <td className="p-3">
        <div className="flex flex-wrap gap-1">
          {ORDER_SIZES.map((qty) => {
            const cost = orderCost(product.id, qty);
            return (
              <button
                key={qty}
                disabled={cost > game.money}
                onClick={() => updateGame((g) => buyStock(g, product.id, qty))}
                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
                title={`Buy ${qty} for ${formatMoney(cost)}`}
              >
                +{qty} ({formatMoney(cost)})
              </button>
            );
          })}
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <button
            disabled={price <= MIN_PRICE}
            onClick={() => updateGame((g) => setPrice(g, product.id, price - 1))}
            className="h-7 w-7 rounded-lg bg-zinc-100 font-bold hover:bg-zinc-200 disabled:opacity-40 dark:bg-zinc-800"
            aria-label={`Lower ${product.name} price`}
          >
            −
          </button>
          <span className="w-12 text-center font-semibold">{formatMoney(price)}</span>
          <button
            disabled={price >= MAX_PRICE}
            onClick={() => updateGame((g) => setPrice(g, product.id, price + 1))}
            className="h-7 w-7 rounded-lg bg-zinc-100 font-bold hover:bg-zinc-200 disabled:opacity-40 dark:bg-zinc-800"
            aria-label={`Raise ${product.name} price`}
          >
            +
          </button>
        </div>
        <p className={`mt-1 text-xs ${reaction.color}`}>
          {reaction.text} · profit {formatMoney(price - product.wholesalePrice)}/unit
        </p>
      </td>
    </tr>
  );
}

function ShelfRestock({ game, shelfIndex }: { game: GameState; shelfIndex: number }) {
  const shelf = game.shelves[shelfIndex];
  const [choice, setChoice] = useState(shelf.productId ?? game.unlockedProducts[0]);
  // A shelf holding items is locked to that product until it is cleared.
  const selected = shelf.quantity > 0 && shelf.productId ? shelf.productId : choice;
  const amount = restockAmount(game, shelfIndex, selected);
  const product = getProduct(selected);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">Shelf {shelfIndex + 1}</span>
        <span className="text-sm">
          {shelf.productId && shelf.quantity > 0
            ? `${getProduct(shelf.productId).emoji} ${shelf.quantity}/${SHELF_CAPACITY}`
            : "Empty"}
        </span>
      </div>
      <select
        value={selected}
        disabled={shelf.quantity > 0}
        onChange={(e) => setChoice(e.target.value)}
        className="mt-2 w-full rounded-lg border border-zinc-300 bg-transparent p-2 text-sm disabled:opacity-60 dark:border-zinc-700"
      >
        {game.unlockedProducts.map((id) => (
          <option key={id} value={id}>
            {getProduct(id).emoji} {getProduct(id).name} ({game.storage[id] ?? 0} in storage)
          </option>
        ))}
      </select>
      <div className="mt-2 flex gap-2">
        <button
          disabled={amount === 0}
          onClick={() => updateGame((g) => restockShelf(g, shelfIndex, selected))}
          className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
        >
          {amount > 0
            ? `Restock +${amount} ${product.emoji}`
            : shelf.quantity >= SHELF_CAPACITY
              ? "Shelf full"
              : "No stock in storage"}
        </button>
        {shelf.productId && shelf.quantity > 0 && (
          <button
            onClick={() => updateGame((g) => clearShelf(g, shelfIndex))}
            className="rounded-lg bg-zinc-100 px-3 text-sm hover:bg-zinc-200 dark:bg-zinc-800"
            title="Move items back to storage"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
