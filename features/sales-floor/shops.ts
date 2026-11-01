import { getProduct, type GameState, type Product } from "@/features/shared/game-state";

// Other shops on the street. Shop fronts face the street at z = SHOP_FRONT_Z;
// the sidewalk is in front of them.
// - Grocery shops: stand at the door and buy a pack of stock for your store.
// - Walk-in shops (clothes, games): walk inside and buy things for yourself.

export type Good = { id: string; name: string; emoji: string; price: number };

export type Shop = {
  id: string;
  name: string;
  emoji: string;
  x: number; // centre of the shop along the street
  w: number;
  d: number;
  h: number;
  color: string; // walls
  accent: string; // awning and sign
  productIds: string[]; // grocery shops: which store products it sells
  walkIn?: boolean; // you can walk inside
  goods?: Good[]; // walk-in shops: what you can buy
};

export const SHOP_FRONT_Z = 9;
export const SHOP_REACH = 2.6; // how close you must stand to a grocery shop door
export const DOOR_WIDTH = 2;

export const SHOPS: Shop[] = [
  { id: "bakery", name: "Bakery", emoji: "🥐", x: -18.5, w: 7, d: 6, h: 4.6, color: "#ffe0b2", accent: "#e65100", productIds: ["bread", "cookies", "eggs"] },
  { id: "dairy", name: "Dairy", emoji: "🐄", x: -28.5, w: 7, d: 6, h: 4.2, color: "#e3f2fd", accent: "#1565c0", productIds: ["milk", "cheese", "eggs"] },
  { id: "greengrocer", name: "Greengrocer", emoji: "🥬", x: 18.5, w: 7, d: 6, h: 4.2, color: "#dcedc8", accent: "#2e7d32", productIds: ["apple", "watermelon", "juice"] },
  { id: "cafe", name: "Café", emoji: "☕", x: 28.5, w: 7, d: 6, h: 4.8, color: "#d7ccc8", accent: "#4e342e", productIds: ["coffee", "chocolate", "cookies"] },
  {
    id: "clothes",
    name: "Fashion Store",
    emoji: "👕",
    x: -42,
    w: 10,
    d: 8,
    h: 4.4,
    color: "#f8bbd0",
    accent: "#ad1457",
    productIds: [],
    walkIn: true,
    goods: [
      { id: "tshirt", name: "T-shirt", emoji: "👕", price: 15 },
      { id: "jeans", name: "Jeans", emoji: "👖", price: 30 },
      { id: "sneakers", name: "Sneakers", emoji: "👟", price: 45 },
      { id: "cap", name: "Cap", emoji: "🧢", price: 10 },
      { id: "jacket", name: "Jacket", emoji: "🧥", price: 60 },
    ],
  },
  {
    id: "games",
    name: "Game Store",
    emoji: "🎮",
    x: 42,
    w: 10,
    d: 8,
    h: 4.6,
    color: "#d1c4e9",
    accent: "#4527a0",
    productIds: [],
    walkIn: true,
    goods: [
      { id: "puzzle-game", name: "Puzzle Game", emoji: "🧩", price: 15 },
      { id: "racing-game", name: "Racing Game", emoji: "🏎️", price: 25 },
      { id: "space-game", name: "Space Shooter", emoji: "🚀", price: 30 },
      { id: "console", name: "Game Console", emoji: "🎮", price: 120 },
    ],
  },
];

// ---------- walk-in shop layout (shared by the 3D model and walking collisions) ----------

type Box = { x: number; z: number; halfW: number; halfD: number };

/** Display units along the back wall, relative to the shop centre. */
export const BACK_UNITS = [-3, 0, 3];
export const COUNTER_DX = 3.2;

export function backWallZ(shop: Shop) {
  return SHOP_FRONT_Z - shop.d;
}

export function counterZ() {
  return SHOP_FRONT_Z - 3.2;
}

/** Walls and furniture you cannot walk through in the walk-in shops. */
export const SHOP_OBSTACLES: Box[] = SHOPS.filter((s) => s.walkIn).flatMap((shop) => {
  const half = DOOR_WIDTH / 2;
  const segW = (shop.w / 2 - half) / 2;
  return [
    // front wall, left and right of the door
    { x: shop.x - half - segW, z: SHOP_FRONT_Z, halfW: segW, halfD: 0.2 },
    { x: shop.x + half + segW, z: SHOP_FRONT_Z, halfW: segW, halfD: 0.2 },
    // checkout counter
    { x: shop.x + COUNTER_DX, z: counterZ(), halfW: 1.1, halfD: 0.45 },
    // display units against the back wall
    ...BACK_UNITS.map((dx) => ({ x: shop.x + dx, z: backWallZ(shop) + 0.6, halfW: 1.1, halfD: 0.45 })),
  ];
});

/** Is this point inside a walk-in shop? */
export function insideWalkInShop(x: number, z: number): Shop | null {
  for (const shop of SHOPS) {
    if (!shop.walkIn) continue;
    if (
      Math.abs(x - shop.x) < shop.w / 2 - 0.45 &&
      z > backWallZ(shop) + 0.45 &&
      z <= SHOP_FRONT_Z + 0.1
    ) {
      return shop;
    }
  }
  return null;
}

/** Where you stand to use a grocery shop: on the sidewalk in front of its door. */
export function shopDoor(shop: Shop): [number, number] {
  return [shop.x, SHOP_FRONT_Z + 1.3];
}

/** The shop you are currently using: inside a walk-in shop, or at a grocery door. */
export function shopNear(x: number, z: number): Shop | null {
  const inside = insideWalkInShop(x, z);
  if (inside) return inside;
  for (const shop of SHOPS) {
    if (shop.walkIn) continue;
    const [dx, dz] = shopDoor(shop);
    if (Math.hypot(x - dx, z - dz) < SHOP_REACH) return shop;
  }
  return null;
}

// ---------- buying ----------

/** Products you can buy here: what the shop sells and your store has unlocked. */
export function shopStock(shop: Shop, game: GameState): Product[] {
  return shop.productIds.filter((id) => game.unlockedProducts.includes(id)).map(getProduct);
}

/** Retail price in a grocery shop. It is above what the supplier charges. */
export function shopPrice(product: Product) {
  return product.suggestedPrice;
}

export const SHOP_PACK = 5; // grocery shops: you buy a small pack at a time

/** One line on a shop's menu. */
export type Offer = { id: string; name: string; emoji: string; price: number; quantity: number };

export function shopOffers(shop: Shop, game: GameState): Offer[] {
  if (shop.walkIn) {
    return (shop.goods ?? []).map((g) => ({ ...g, quantity: 1 }));
  }
  return shopStock(shop, game).map((p) => ({
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    price: shopPrice(p) * SHOP_PACK,
    quantity: SHOP_PACK,
  }));
}

/** Grocery shops: buy one pack; the units go to your back room, ready for the shelves. */
export function buyFromShop(game: GameState, productId: string): GameState {
  const product = getProduct(productId);
  const cost = shopPrice(product) * SHOP_PACK;
  if (!game.unlockedProducts.includes(productId) || cost > game.money) return game;
  return {
    ...game,
    money: game.money - cost,
    storage: { ...game.storage, [productId]: (game.storage[productId] ?? 0) + SHOP_PACK },
    stats: { ...game.stats, spending: game.stats.spending + cost },
  };
}

/** Walk-in shops: buy something for yourself. It goes into your bag. */
export function buyGood(game: GameState, shop: Shop, goodId: string): GameState {
  const good = shop.goods?.find((g) => g.id === goodId);
  if (!good || good.price > game.money) return game;
  return {
    ...game,
    money: game.money - good.price,
    owned: { ...game.owned, [good.id]: (game.owned[good.id] ?? 0) + 1 },
  };
}

/** Buy an offer from whichever kind of shop this is. */
export function buyOffer(game: GameState, shop: Shop, offerId: string): GameState {
  return shop.walkIn ? buyGood(game, shop, offerId) : buyFromShop(game, offerId);
}

/** Look up a good you own, for showing your bag. */
export function findGood(id: string): Good | undefined {
  for (const shop of SHOPS) {
    const good = shop.goods?.find((g) => g.id === id);
    if (good) return good;
  }
  return undefined;
}
