// Shared mock game data for Stage 1 (frontend only).
// The whole game state is kept in the browser (localStorage) until Stage 3
// moves it to Supabase.

export type Product = {
  id: string;
  name: string;
  emoji: string;
  wholesalePrice: number; // what the supplier charges per unit
  suggestedPrice: number; // default selling price; customers accept up to ~2x
  unlockCost: number; // 0 = available from the start
};

export const CATALOG: Product[] = [
  { id: "apple", name: "Apple", emoji: "🍎", wholesalePrice: 2, suggestedPrice: 3, unlockCost: 0 },
  { id: "bread", name: "Bread", emoji: "🍞", wholesalePrice: 3, suggestedPrice: 5, unlockCost: 0 },
  { id: "milk", name: "Milk", emoji: "🥛", wholesalePrice: 3, suggestedPrice: 5, unlockCost: 0 },
  { id: "eggs", name: "Eggs", emoji: "🥚", wholesalePrice: 4, suggestedPrice: 6, unlockCost: 80 },
  { id: "cheese", name: "Cheese", emoji: "🧀", wholesalePrice: 6, suggestedPrice: 9, unlockCost: 150 },
  { id: "juice", name: "Juice", emoji: "🧃", wholesalePrice: 4, suggestedPrice: 7, unlockCost: 220 },
  { id: "cookies", name: "Cookies", emoji: "🍪", wholesalePrice: 5, suggestedPrice: 8, unlockCost: 300 },
  { id: "coffee", name: "Coffee", emoji: "☕", wholesalePrice: 8, suggestedPrice: 12, unlockCost: 400 },
  { id: "chocolate", name: "Chocolate", emoji: "🍫", wholesalePrice: 5, suggestedPrice: 9, unlockCost: 500 },
  { id: "watermelon", name: "Watermelon", emoji: "🍉", wholesalePrice: 10, suggestedPrice: 16, unlockCost: 700 },
];

export const SHELF_CAPACITY = 10;
export const MAX_SHELVES = 12;
export const MAX_CHECKOUTS = 4;

export type Shelf = {
  productId: string | null;
  quantity: number;
};

export type GameStats = {
  income: number;
  spending: number;
  customersServed: number;
  unitsSold: Record<string, number>;
  revenueByProduct: Record<string, number>;
};

export type GameState = {
  money: number;
  level: number;
  checkouts: number;
  shelves: Shelf[];
  unlockedProducts: string[];
  storage: Record<string, number>; // productId -> units in the back room
  owned: Record<string, number>; // things you bought for yourself in other shops (clothes, games)
  prices: Record<string, number>; // productId -> selling price
  stats: GameStats;
};

export function getProduct(id: string): Product {
  const product = CATALOG.find((p) => p.id === id);
  if (!product) throw new Error(`Unknown product: ${id}`);
  return product;
}

export function createInitialGame(): GameState {
  return {
    money: 200,
    level: 1,
    checkouts: 1,
    shelves: [
      { productId: "apple", quantity: 6 },
      { productId: "bread", quantity: 6 },
      { productId: "milk", quantity: 6 },
    ],
    unlockedProducts: ["apple", "bread", "milk"],
    storage: { apple: 10, bread: 5, milk: 5 },
    owned: {},
    prices: Object.fromEntries(CATALOG.map((p) => [p.id, p.suggestedPrice])),
    stats: {
      income: 0,
      spending: 0,
      customersServed: 0,
      unitsSold: {},
      revenueByProduct: {},
    },
  };
}

export function formatMoney(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}
