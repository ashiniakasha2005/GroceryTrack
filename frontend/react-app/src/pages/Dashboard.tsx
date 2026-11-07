import { DollarSign, Package, CheckSquare, AlertTriangle } from "lucide-react";
import SummaryCard from "../components/dashboard/SummaryCard";

type DashboardStats = {
  salesToday: number | null;
  salesChangePct: number | null; // % change vs yesterday
  totalProducts: number | null;
  addedThisWeek: number | null; // net change this week, can be negative
  totalTransactions: number | null;
  lowStockCount: number | null;
};

// null means "no data yet". FE-04 (Senadi) will fill these from the API.
const stats: DashboardStats = {
  salesToday: null,
  salesChangePct: null,
  totalProducts: null,
  addedThisWeek: null,
  totalTransactions: null,
  lowStockCount: null,
};

// Longer than this and the number is shortened (42,850,000 -> 42.85M)
const MAX_CHARS = 12;

type Shown = { text: string; full: string };

const compact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);

const showCount = (n: number | null): Shown => {
  if (n === null) return { text: "—", full: "—" };
  const full = n.toLocaleString("en-US");
  return { text: full.length > MAX_CHARS ? compact(n) : full, full };
};

const showMoney = (n: number | null): Shown => {
  if (n === null) return { text: "—", full: "—" };
  const full = `RS ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  return { text: full.length > MAX_CHARS ? `RS ${compact(n)}` : full, full };
};

export default function Dashboard() {
  const pct = stats.salesChangePct;
  const added = stats.addedThisWeek;
  const low = stats.lowStockCount;

  const sales = showMoney(stats.salesToday);
  const products = showCount(stats.totalProducts);
  const transactions = showCount(stats.totalTransactions);
  const lowStock = showCount(stats.lowStockCount);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[18px] font-bold text-[#212529]">Dashboard</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Sales Today"
          value={sales.text}
          fullValue={sales.full}
          subtext={
            pct === null
              ? "vs yesterday"
              : `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs yesterday`
          }
          arrow={pct === null ? undefined : pct >= 0 ? "up" : "down"}
          icon={DollarSign}
          variant="success"
        />

        <SummaryCard
          title="Total Products"
          value={products.text}
          fullValue={products.full}
          subtext={
            added === null
              ? "In the catalog"
              : added < 0
              ? `${Math.abs(added)} removed this week`
              : `${added} added this week`
          }
          arrow={
            added === null || added === 0 ? undefined : added > 0 ? "up" : "down"
          }
          icon={Package}
          variant="primary"
        />

        <SummaryCard
          title="Total Transactions"
          value={transactions.text}
          fullValue={transactions.full}
          subtext="Today's completed sales"
          icon={CheckSquare}
          variant="neutral"
        />

        <SummaryCard
          title="Low-Stock Alerts"
          value={lowStock.text}
          fullValue={lowStock.full}
          subtext={
            low === null
              ? "Items needing restock"
              : low === 0
              ? "All items in stock"
              : "Requires immediate restock"
          }
          arrow={low !== null && low > 0 ? "down" : undefined}
          icon={AlertTriangle}
          variant="danger"
        />
      </div>
    </div>
  );
}