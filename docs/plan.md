# Supermarket Simulator — Development Plan

## App Name

**Supermarket Simulator**

## What It Does

A browser game where the player runs a small store. The player buys products
from a supplier, puts them on shelves, and sells them to customers. With the
money earned, the player expands the store (more shelves, more product types,
more checkout counters) and grows it from a tiny shop into a big supermarket.

Each player has their own account (login/signup), and their game progress
(money, stock, store level) is saved.

## Tech Stack

- Next.js (App Router) + TypeScript
- Supabase (auth + database)
- Vercel (hosting, serverless)
- Base project already includes: login page, signup page, Supabase connection

## Features

Feature names below are also the directory names under `features/`.

### 1. `sales-floor`
The main game screen. Shows the store with its shelves and products.
Customers arrive, pick products from the shelves, and pay at the checkout.
Each sale adds money to the player's balance. When a shelf is empty, nothing
can be sold from it until it is restocked.

### 2. `stock-order`
The supplier screen. The player buys products in bulk at a wholesale price
(money is deducted), and the products go to storage. The player sets the
selling price for each product and moves stock from storage onto shelves.

### 3. `store-expansion`
The upgrade screen. The player spends money on upgrades:
- more shelves (sell more products at once)
- new product types (unlock new items from the supplier)
- more checkout counters (serve customers faster)

Each upgrade raises the store level.

### 4. `profit-report`
The statistics screen. Shows total income, total spending, profit,
best-selling products, and the current store level.

## Pages

| Page | Path | Description |
|------|------|-------------|
| Login | `/login` | Existing base page — sign in |
| Signup | `/signup` | Existing base page — create an account |
| Sales Floor | `/sales-floor` | Main game screen with shelves, customers, checkout, current money |
| Stock Order | `/stock-order` | Buy products from the supplier, set prices, restock shelves |
| Store Expansion | `/store-expansion` | Buy upgrades with earned money |
| Profit Report | `/profit-report` | Income, spending, profit, best sellers |

A shared top bar shows the player's current money and store level, with links
to all four game pages.

## Build Order

1. `sales-floor`
2. `stock-order`
3. `store-expansion`
4. `profit-report`
