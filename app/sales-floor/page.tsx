import type { Metadata } from "next";
import SalesFloor from "@/features/sales-floor/sales-floor";

export const metadata: Metadata = { title: "Sales Floor · Supermarket Simulator" };

export default function SalesFloorPage() {
  return <SalesFloor />;
}
