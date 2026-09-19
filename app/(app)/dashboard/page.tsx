import { requireUser } from "@/lib/auth";
import {
  getProductSummaries,
  getProductSizeSummaries,
  getTransfers,
} from "@/lib/data";
import { StatCard } from "@/components/StatCard";
import { LowStockList } from "@/components/LowStockList";
import { RevenueChart } from "@/components/RevenueChart";
import { Card } from "@/components/ui";
import { Badge } from "@/components/Badge";
import Link from "next/link";

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const sizeSummaries = await getProductSizeSummaries();

  if (profile.role === "store_staff") {
    const transfers = await getTransfers(6);
    const totalStock = sizeSummaries.reduce((s, r) => s + r.store_stock, 0);
    const totalWarehouse = sizeSummaries.reduce((s, r) => s + r.warehouse_stock, 0);

    return (
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="font-display text-2xl">
            Hi {profile.full_name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">
            Here&apos;s what&apos;s happening in store today.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Store stock (units)" value={totalStock.toLocaleString()} />
          <StatCard
            label="Warehouse stock (units)"
            value={totalWarehouse.toLocaleString()}
            sub="For reference — ask the owner to release stock"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-sm">Running low</h2>
              <Link
                href="/store-stock"
                className="text-xs text-[var(--color-primary)] font-medium hover:underline"
              >
                Update stock →
              </Link>
            </div>
            <LowStockList rows={sizeSummaries} />
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-sm">Recent transfers</h2>
              <Link
                href="/transfers"
                className="text-xs text-[var(--color-primary)] font-medium hover:underline"
              >
                Log transfer →
              </Link>
            </div>
            {transfers.length === 0 ? (
              <p className="text-sm text-[var(--color-ink-soft)] py-6 text-center">
                No transfers logged yet.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {transfers.map((t) => (
                  <li key={t.id} className="py-2.5 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {t.product?.product_name}
                      </p>
                      <p className="text-xs text-[var(--color-ink-soft)]">
                        Size {t.size} · {t.transfer_date}
                      </p>
                    </div>
                    <Badge tone={t.direction === "Warehouse to Store" ? "success" : "accent"}>
                      {t.quantity} {t.direction === "Warehouse to Store" ? "in" : "out"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Owner dashboard
  const products = await getProductSummaries();
  const totalRevenue = products.reduce((s, p) => s + p.total_revenue, 0);
  const totalProfit = products.reduce((s, p) => s + p.total_profit, 0);
  const totalStock = products.reduce((s, p) => s + p.total_stock, 0);
  const totalSold = products.reduce((s, p) => s + p.total_sold, 0);
  const stockValue = sizeSummaries.reduce(
    (s, r) => s + r.total_stock * r.cost_price,
    0
  );

  const chartData = [...products]
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 8)
    .map((p) => ({
      name: p.product_name.length > 14 ? p.product_name.slice(0, 14) + "…" : p.product_name,
      revenue: p.total_revenue,
      profit: p.total_profit,
    }));

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl">Business overview</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mt-1">
          Across store and warehouse, all products.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total revenue" value={`Rs ${totalRevenue.toLocaleString()}`} />
        <StatCard label="Total profit" value={`Rs ${totalProfit.toLocaleString()}`} />
        <StatCard label="Units sold" value={totalSold.toLocaleString()} />
        <StatCard
          label="Stock on hand"
          value={totalStock.toLocaleString()}
          sub={`Rs ${stockValue.toLocaleString()} at cost`}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-medium text-sm mb-4">Top products by revenue</h2>
          <RevenueChart data={chartData} />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-sm">Running low</h2>
            <Link
              href="/products"
              className="text-xs text-[var(--color-primary)] font-medium hover:underline"
            >
              View all →
            </Link>
          </div>
          <LowStockList rows={sizeSummaries} />
        </Card>
      </div>
    </div>
  );
}
