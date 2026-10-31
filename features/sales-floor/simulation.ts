import { getProduct, type GameState } from "@/features/shared/game-state";

// Customer simulation for the sales floor. Runs once per tick (1 second).

export type BasketItem = { productId: string; price: number };

export type Customer = {
  id: number;
  emoji: string;
  basket: BasketItem[];
  total: number;
};

export const MAX_QUEUE = 8;
const CUSTOMER_FACES = ["🧑", "👩", "👨", "👵", "👴", "👧", "🧔", "👱"];

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

/** Chance (0..1) that a customer buys a product at the given price. */
export function buyChance(price: number, suggestedPrice: number) {
  if (price <= suggestedPrice) return 1;
  // Falls linearly to 0 at twice the suggested price.
  return Math.max(0, 2 - price / suggestedPrice);
}

/** The player rang up this customer: money comes in and the sale is counted. */
export function payCustomer(game: GameState, customer: Customer): GameState {
  const stats = {
    ...game.stats,
    unitsSold: { ...game.stats.unitsSold },
    revenueByProduct: { ...game.stats.revenueByProduct },
  };
  stats.income += customer.total;
  stats.customersServed += 1;
  for (const item of customer.basket) {
    stats.unitsSold[item.productId] = (stats.unitsSold[item.productId] ?? 0) + 1;
    stats.revenueByProduct[item.productId] =
      (stats.revenueByProduct[item.productId] ?? 0) + item.price;
  }
  return { ...game, money: game.money + customer.total, stats };
}

export function runTick(
  game: GameState,
  queue: Customer[],
  nextId: number,
): { game: GameState; queue: Customer[]; events: string[] } {
  const events: string[] = [];
  // 1. Customers at the counters wait until the player rings them up (see payCustomer).
  const remaining: Customer[] = [...queue];

  // 2. Maybe a new customer walks in and picks products from the shelves.
  const shelves = game.shelves.map((shelf) => ({ ...shelf }));
  const spawnChance = Math.min(0.8, 0.35 + 0.05 * game.level);

  if (Math.random() < spawnChance) {
    const emoji = CUSTOMER_FACES[randomInt(CUSTOMER_FACES.length)];
    if (remaining.length >= MAX_QUEUE) {
      events.push(`${emoji} saw the long line and left`);
    } else {
      const basket: BasketItem[] = [];
      const wants = 1 + randomInt(3);
      let tooExpensive = false;

      for (let i = 0; i < wants; i++) {
        const stocked = shelves.filter((s) => s.productId && s.quantity > 0);
        if (stocked.length === 0) break;
        const shelf = stocked[randomInt(stocked.length)];
        const productId = shelf.productId!;
        const price = game.prices[productId];
        if (Math.random() < buyChance(price, getProduct(productId).suggestedPrice)) {
          shelf.quantity -= 1;
          basket.push({ productId, price });
        } else {
          tooExpensive = true;
        }
      }

      if (basket.length > 0) {
        const total = basket.reduce((sum, item) => sum + item.price, 0);
        remaining.push({ id: nextId, emoji, basket, total });
      } else if (tooExpensive) {
        events.push(`${emoji} thought the prices were too high and left`);
      } else {
        events.push(`${emoji} found only empty shelves and left`);
      }
    }
  }

  return {
    game: { ...game, shelves },
    queue: remaining,
    events,
  };
}
