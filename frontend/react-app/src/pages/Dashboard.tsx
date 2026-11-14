import { useEffect, useState } from "react";
import { DollarSign, Package, CheckSquare, AlertTriangle } from "lucide-react";
import SummaryCard from "../components/dashboard/SummaryCard";
import { Link } from "react-router-dom";

type DashboardStats = {
  salesToday: number | null;
  salesChangePct: number | null;
  totalProducts: number | null;
  addedThisWeek: number | null;
  totalTransactions: number | null;
  lowStockCount: number | null;
};

type DashboardApiResponse = {
  today_sales: number | string;
  total_products: number;
  total_sales: number;
  low_stock_products: number;
  message?: string;
};

// Types for the new tables (Added total_items)
type Transaction = {
  sale_id: number;
  sale_date_time: string;
  total_amount: string | number;
  sold_by: string;
  status: string;
  total_items: number;
};

type LowStockItem = {
  id: number;
  name: string;
  current_stock: number;
  minimum_stock: number;
  shortage: number;
};

const MAX_CHARS = 12;
type Shown = { text: string; full: string };

const compact = (n: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);

const showCount = (n: number | null): Shown => {
  if (n === null) return { text: "—", full: "—" };
  const full = n.toLocaleString("en-US");
  return { text: full.length > MAX_CHARS ? compact(n) : full, full };
};

const showMoney = (n: number | null): Shown => {
  if (n === null) return { text: "—", full: "—" };
  const full = `RS ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return { text: full.length > MAX_CHARS ? `RS ${compact(n)}` : full, full };
};

// Format date to Time (e.g. 10:42 AM)
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

// Mock Method (since DB doesn't have it)
const getMockMethod = (id: number) => {
  const methods = ["Cash", "GCash", "Card"];
  return methods[id % 3];
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    salesToday: null, salesChangePct: null, totalProducts: null,
    addedThisWeek: null, totalTransactions: null, lowStockCount: null,
  });

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please log in to view the dashboard.");

        const headers = { Authorization: `Bearer ${token}` };

        const [dashboardRes, salesRes, lowStockRes] = await Promise.all([
          fetch("http://localhost:3000/api/dashboard", { headers }),
          fetch("http://localhost:3000/api/sales", { headers }),
          fetch("http://localhost:3000/api/inventory/low-stock/list", { headers }),
        ]);

        if (!dashboardRes.ok) throw new Error("Failed to load dashboard stats.");
        const data: DashboardApiResponse = await dashboardRes.json();
        
        setStats({
          salesToday: Number(data.today_sales), salesChangePct: null,
          totalProducts: Number(data.total_products), addedThisWeek: null,
          totalTransactions: Number(data.total_sales), lowStockCount: Number(data.low_stock_products),
        });

        if (salesRes.ok) {
          const salesData = await salesRes.json();
          const latestSales = salesData.filter((s: Transaction) => s.status === "completed").slice(0, 5);
          setRecentTransactions(latestSales);
        }

        if (lowStockRes.ok) {
          const lowStockData = await lowStockRes.json();
          setLowStockItems(lowStockData.slice(0, 4));
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const sales = showMoney(stats.salesToday);
  const products = showCount(stats.totalProducts);
  const transactions = showCount(stats.totalTransactions);
  const lowStock = showCount(stats.lowStockCount);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[18px] font-bold text-[#212529]">Dashboard</h1>
      </div>

      {loading && <p className="mb-4 text-sm text-gray-500">Loading dashboard...</p>}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* Top Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Sales Today" value={sales.text} fullValue={sales.full} subtext="vs yesterday" icon={DollarSign} variant="success" />
        <SummaryCard title="Total Products" value={products.text} fullValue={products.full} subtext="In the catalog" icon={Package} variant="primary" />
        <SummaryCard title="Total Transactions" value={transactions.text} fullValue={transactions.full} subtext="Completed sales" icon={CheckSquare} variant="neutral" />
        <SummaryCard title="Low-Stock Alerts" value={lowStock.text} fullValue={lowStock.full} subtext="Requires restock" arrow={stats.lowStockCount && stats.lowStockCount > 0 ? "down" : undefined} icon={AlertTriangle} variant="danger" />
      </div>

      {/* Bottom Section: Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Recent Transactions (Figma Structure) */}
        <div className="lg:col-span-2 rounded-[10px] border border-[#e9ecef] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#212529]">Recent Transactions</h2>
              <p className="text-[11px] text-[#adb5bd]">Today's completed sales activity</p>
            </div>
            <Link to="/sales" className="text-xs font-medium text-[#0d6efd] hover:underline">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#e9ecef] text-[10px] uppercase tracking-wider text-[#adb5bd]">
                  <th className="pb-3 font-semibold">Transaction ID</th>
                  <th className="pb-3 font-semibold">Time</th>
                  <th className="pb-3 font-semibold">Cashier</th>
                  <th className="pb-3 font-semibold text-center">Items</th>
                  <th className="pb-3 font-semibold text-right">Total</th>
                  <th className="pb-3 font-semibold text-center">Method</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr><td colSpan={7} className="py-4 text-center text-gray-400">No transactions found.</td></tr>
                ) : (
                  recentTransactions.map((txn) => {
                    const method = getMockMethod(txn.sale_id);
                    return (
                      <tr key={txn.sale_id} className="border-b border-[#f8f9fa] last:border-0 hover:bg-gray-50">
                        <td className="py-3 text-[12px] font-bold text-[#0d6efd]">TXN-{txn.sale_id}</td>
                        <td className="py-3 text-[12px] text-[#495057]">{formatTime(txn.sale_date_time)}</td>
                        <td className="py-3 text-[12px] text-[#495057]">{txn.sold_by}</td>
                        <td className="py-3 text-[12px] text-center text-[#495057]">{txn.total_items}</td>
                        <td className="py-3 text-[12px] text-right font-semibold text-[#212529]">
                          RS {Number(txn.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold 
                            ${method === 'Cash' ? 'bg-gray-100 text-gray-700' : 
                              method === 'GCash' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {method}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="inline-block rounded bg-[#d1e7dd] px-2 py-0.5 text-[10px] font-semibold text-[#0f5132]">
                            Completed
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-[10px] border border-[#e9ecef] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#212529]">Low Stock Alerts</h2>
          </div>

          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-400">All items are in stock.</p>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="flex flex-col rounded-md border border-[#f5c2c7] bg-[#fff5f5] p-3">
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-[#842029] text-sm">{item.name}</span>
                    <span className="rounded bg-[#dc3545] px-2 py-0.5 text-[10px] font-bold text-white">LOW STOCK</span>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-[#842029]">
                    <span>Stock: {item.current_stock}</span>
                    <span>Min: {item.minimum_stock}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 text-right">
             <Link to="/low-stock" className="text-xs font-medium text-[#0d6efd] hover:underline">View All Alerts</Link>
          </div>
        </div>

      </div>
    </div>
  );
}