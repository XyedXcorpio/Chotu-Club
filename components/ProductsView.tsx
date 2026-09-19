"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import { Badge } from "@/components/Badge";
import { ProductFormModal } from "@/components/ProductFormModal";
import { Plus, Pencil } from "lucide-react";
import type { Product, ProductSummary } from "@/lib/types";

export function ProductsView({
  role,
  products,
  summaries,
}: {
  role: "owner" | "store_staff";
  products: Product[];
  summaries: ProductSummary[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);

  const isOwner = role === "owner";
  const summaryByProduct = new Map(summaries.map((s) => [s.product_id, s]));

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Products</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1">
            {products.length} active product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        {isOwner && (
          <Button
            onClick={() => {
              setEditing(undefined);
              setModalOpen(true);
            }}
          >
            <Plus size={16} /> New product
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Gender</th>
              <th className="px-4 py-3 font-medium">Color</th>
              {isOwner && <th className="px-4 py-3 font-medium text-right">Cost</th>}
              {isOwner && <th className="px-4 py-3 font-medium text-right">Sale</th>}
              <th className="px-4 py-3 font-medium text-right">Stock</th>
              <th className="px-4 py-3 font-medium text-right">Sold</th>
              {isOwner && <th className="px-4 py-3 font-medium text-right">Revenue</th>}
              {isOwner && <th className="px-4 py-3 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const s = summaryByProduct.get(p.id);
              return (
                <tr
                  key={p.id}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.product_name}</p>
                    <p className="text-xs text-[var(--color-ink-soft)]">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="primary">{p.gender}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-soft)]">{p.color ?? "—"}</td>
                  {isOwner && (
                    <td className="px-4 py-3 text-right tabular">
                      Rs {p.cost_price.toLocaleString()}
                    </td>
                  )}
                  {isOwner && (
                    <td className="px-4 py-3 text-right tabular">
                      Rs {p.sale_price.toLocaleString()}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right tabular">{s?.total_stock ?? 0}</td>
                  <td className="px-4 py-3 text-right tabular">{s?.total_sold ?? 0}</td>
                  {isOwner && (
                    <td className="px-4 py-3 text-right tabular">
                      Rs {(s?.total_revenue ?? 0).toLocaleString()}
                    </td>
                  )}
                  {isOwner && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setModalOpen(true);
                        }}
                        className="text-[var(--color-ink-soft)] hover:text-[var(--color-primary)]"
                      >
                        <Pencil size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={isOwner ? 9 : 5}
                  className="px-4 py-10 text-center text-[var(--color-ink-soft)]"
                >
                  No products yet.{isOwner && ' Click "New product" to add one.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {modalOpen && (
        <ProductFormModal product={editing} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
