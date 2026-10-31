import { SHELF_CAPACITY, getProduct, type GameState } from "@/features/shared/game-state";

// Pure game-state changes for the stock-order screen.

export const MIN_PRICE = 1;
export const MAX_PRICE = 999;

export function orderCost(productId: string, quantity: number) {
  return getProduct(productId).wholesalePrice * quantity;
}

export function buyStock(game: GameState, productId: string, quantity: number): GameState {
  const cost = orderCost(productId, quantity);
  if (cost > game.money || !game.unlockedProducts.includes(productId)) return game;
  return {
    ...game,
    money: game.money - cost,
    storage: { ...game.storage, [productId]: (game.storage[productId] ?? 0) + quantity },
    stats: { ...game.stats, spending: game.stats.spending + cost },
  };
}

export function setPrice(game: GameState, productId: string, price: number): GameState {
  const clamped = Math.min(MAX_PRICE, Math.max(MIN_PRICE, Math.round(price)));
  return { ...game, prices: { ...game.prices, [productId]: clamped } };
}

/** How many units a restock would move from storage onto the shelf. */
export function restockAmount(game: GameState, shelfIndex: number, productId: string) {
  const shelf = game.shelves[shelfIndex];
  if (shelf.quantity > 0 && shelf.productId !== productId) return 0;
  return Math.min(game.storage[productId] ?? 0, SHELF_CAPACITY - shelf.quantity);
}

export function restockShelf(game: GameState, shelfIndex: number, productId: string): GameState {
  const amount = restockAmount(game, shelfIndex, productId);
  if (amount === 0) return game;
  const shelves = game.shelves.map((shelf, i) =>
    i === shelfIndex ? { productId, quantity: shelf.quantity + amount } : shelf,
  );
  return {
    ...game,
    shelves,
    storage: { ...game.storage, [productId]: (game.storage[productId] ?? 0) - amount },
  };
}

/** Moves everything on a shelf back to storage so it can hold another product. */
export function clearShelf(game: GameState, shelfIndex: number): GameState {
  const shelf = game.shelves[shelfIndex];
  if (!shelf.productId) return game;
  const productId = shelf.productId;
  return {
    ...game,
    shelves: game.shelves.map((s, i) => (i === shelfIndex ? { productId: null, quantity: 0 } : s)),
    storage: { ...game.storage, [productId]: (game.storage[productId] ?? 0) + shelf.quantity },
  };
}
