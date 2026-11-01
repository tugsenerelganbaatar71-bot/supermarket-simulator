import {
  CATALOG,
  MAX_CHECKOUTS,
  MAX_SHELVES,
  type GameState,
  type Product,
} from "@/features/shared/game-state";

// Upgrade prices and effects for the store-expansion screen.

/** Unlocking a product costs 60% of the catalog price (cheaper expansion). */
export function productUnlockCost(product: Product) {
  return Math.round(product.unlockCost * 0.6);
}

export function shelfUpgradeCost(game: GameState) {
  return 40 * game.shelves.length;
}

export function checkoutUpgradeCost(game: GameState) {
  return 150 * game.checkouts;
}

/** The next product the supplier can unlock, in catalog order. */
export function nextLockedProduct(game: GameState): Product | undefined {
  return CATALOG.find((p) => !game.unlockedProducts.includes(p.id));
}

function pay(game: GameState, cost: number): GameState {
  return {
    ...game,
    money: game.money - cost,
    level: game.level + 1,
    stats: { ...game.stats, spending: game.stats.spending + cost },
  };
}

export function buyShelf(game: GameState): GameState {
  const cost = shelfUpgradeCost(game);
  if (game.shelves.length >= MAX_SHELVES || cost > game.money) return game;
  const paid = pay(game, cost);
  return { ...paid, shelves: [...paid.shelves, { productId: null, quantity: 0 }] };
}

export function buyCheckout(game: GameState): GameState {
  const cost = checkoutUpgradeCost(game);
  if (game.checkouts >= MAX_CHECKOUTS || cost > game.money) return game;
  return { ...pay(game, cost), checkouts: game.checkouts + 1 };
}

export function unlockProduct(game: GameState): GameState {
  const product = nextLockedProduct(game);
  if (!product || productUnlockCost(product) > game.money) return game;
  const paid = pay(game, productUnlockCost(product));
  return { ...paid, unlockedProducts: [...paid.unlockedProducts, product.id] };
}
