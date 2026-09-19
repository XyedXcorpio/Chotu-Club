import { Badge } from "@/components/Badge";
import type { ProductSizeSummary } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 5;

export function LowStockList({ rows }: { rows: ProductSizeSummary[] }) {
  const low = rows
    .filter((r) => r.total_stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.total_stock - b.total_stock)
    .slice(0, 8);

  if (low.length === 0) {
    return (
      <p className="text-sm text-[var(--color-ink-soft)] py-6 text-center">
        Nothing is running low right now.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {low.map((row) => (
        <li
          key={`${row.product_id}-${row.size}`}
          className="flex items-center justify-between py-2.5"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{row.product_name}</p>
            <p className="text-xs text-[var(--color-ink-soft)]">
              Size {row.size} · {row.sku}
            </p>
          </div>
          <Badge tone={row.total_stock === 0 ? "danger" : "accent"}>
            {row.total_stock === 0 ? "Out of stock" : `${row.total_stock} left`}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
