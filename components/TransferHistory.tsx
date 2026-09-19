"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Badge } from "@/components/Badge";
import { deleteTransfer } from "@/app/actions";
import { Trash2 } from "lucide-react";
import type { TransferWithRefs } from "@/lib/data";

export function TransferHistory({
  transfers,
  canDelete,
}: {
  transfers: TransferWithRefs[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Delete this transfer? Stock levels will update accordingly.")) return;
    startTransition(async () => {
      await deleteTransfer(id);
      router.refresh();
    });
  }

  if (transfers.length === 0) {
    return (
      <Card className="px-4 py-10 text-center text-[var(--color-ink-soft)] text-sm">
        No transfers logged yet.
      </Card>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-2.5">
        {transfers.map((t) => (
          <Card key={t.id} className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t.product?.product_name}</p>
                <p className="text-xs text-[var(--color-ink-soft)]">
                  {t.product?.sku} · Size {t.size}
                </p>
              </div>
              {canDelete && (
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={pending}
                  className="shrink-0 text-[var(--color-ink-soft)] hover:text-[var(--color-danger)] p-1"
                  aria-label="Delete transfer"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[var(--color-border)]">
              <Badge tone={t.direction === "Warehouse to Store" ? "success" : "accent"}>
                {t.direction === "Warehouse to Store" ? "Warehouse → Store" : "Store → Warehouse"}
              </Badge>
              <span className="text-sm tabular font-medium">{t.quantity} units</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-[var(--color-ink-soft)]">
              <span>{t.transfer_date}</span>
              <span>{t.logger?.full_name ?? "—"}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop: table */}
      <Card className="hidden md:block overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Direction</th>
              <th className="px-4 py-3 font-medium">By</th>
              {canDelete && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr
                key={t.id}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]"
              >
                <td className="px-4 py-3 whitespace-nowrap">{t.transfer_date}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{t.product?.product_name}</p>
                  <p className="text-xs text-[var(--color-ink-soft)]">{t.product?.sku}</p>
                </td>
                <td className="px-4 py-3">{t.size}</td>
                <td className="px-4 py-3 tabular">{t.quantity}</td>
                <td className="px-4 py-3">
                  <Badge tone={t.direction === "Warehouse to Store" ? "success" : "accent"}>
                    {t.direction}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[var(--color-ink-soft)]">
                  {t.logger?.full_name ?? "—"}
                </td>
                {canDelete && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={pending}
                      className="text-[var(--color-ink-soft)] hover:text-[var(--color-danger)]"
                      aria-label="Delete transfer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
