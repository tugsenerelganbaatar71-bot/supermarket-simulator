import type { Metadata } from "next";
import ProfitReport from "@/features/profit-report/profit-report";

export const metadata: Metadata = { title: "Profit Report · Supermarket Simulator" };

export default function ProfitReportPage() {
  return <ProfitReport />;
}
