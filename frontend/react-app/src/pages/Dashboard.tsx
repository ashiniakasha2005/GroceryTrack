import { DollarSign, Package, CheckSquare, AlertTriangle } from "lucide-react";
import SummaryCard from "../components/dashboard/SummaryCard";

type DashboardStats = {
  salesToday: number | null;
  totalProducts: number | null;
  totalTransactions: number | null;
  lowStockCount: number | null;
};

// null means "no data yet". FE-04 (Senadi) will fill these from the API.
const stats: DashboardStats = {
  salesToday: null,
  totalProducts: null,
  totalTransactions: null,
  lowStockCount: null,
};

const showCount = (n: number | null) =>
  n === null ? "—" : n.toLocaleString("en-US");

const showMoney = (n: number | null) =>
  n === null
    ? "—"
    : `Rs. ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[18px] font-bold text-[#212529]">Dashboard</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Sales Today"
          value={showMoney(stats.salesToday)}
          subtext="Recorded today"
          icon={DollarSign}
          variant="success"
        />

        <SummaryCard
          title="Total Products"
          value={showCount(stats.totalProducts)}
          subtext="In the catalog"
          icon={Package}
          variant="primary"
        />

        <SummaryCard
          title="Total Transactions"
          value={showCount(stats.totalTransactions)}
          subtext="Completed sales"
          icon={CheckSquare}
          variant="neutral"
        />

        <SummaryCard
          title="Low-Stock Alerts"
          value={showCount(stats.lowStockCount)}
          subtext="Requires restock"
          icon={AlertTriangle}
          variant="danger"
        />
      </div>
    </div>
  );
}