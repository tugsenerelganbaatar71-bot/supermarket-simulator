import type { Metadata } from "next";
import StockOrder from "@/features/stock-order/stock-order";

export const metadata: Metadata = { title: "Stock Order · Supermarket Simulator" };

export default function StockOrderPage() {
  return <StockOrder />;
}
