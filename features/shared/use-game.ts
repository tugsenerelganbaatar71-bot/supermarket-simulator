"use client";

import { useSyncExternalStore } from "react";
import { createInitialGame, type GameState } from "./game-state";

// Browser-side store for the mock game state (Stage 1).

const STORAGE_KEY = "supermarket-simulator:game";
const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cachedState: GameState | undefined;

function parse(raw: string | null): GameState {
  const initial = createInitialGame();
  if (!raw) return initial;
  try {
    const saved = JSON.parse(raw) as Partial<GameState>;
    return {
      ...initial,
      ...saved,
      stats: { ...initial.stats, ...saved.stats },
      prices: { ...initial.prices, ...saved.prices },
    };
  } catch {
    return initial;
  }
}

export function readGame(): GameState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (cachedState === undefined || raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = parse(raw);
  }
  return cachedState;
}

export function writeGame(next: GameState) {
  const raw = JSON.stringify(next);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedState = next;
  listeners.forEach((listener) => listener());
}

export function updateGame(change: (game: GameState) => GameState) {
  writeGame(change(readGame()));
}

export function resetGame() {
  writeGame(createInitialGame());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Current game state, or null during server render / before hydration. */
export function useGame(): GameState | null {
  return useSyncExternalStore(subscribe, readGame, () => null);
}
