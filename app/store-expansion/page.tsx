import type { Metadata } from "next";
import StoreExpansion from "@/features/store-expansion/store-expansion";

export const metadata: Metadata = { title: "Store Expansion · Supermarket Simulator" };

export default function StoreExpansionPage() {
  return <StoreExpansion />;
}
