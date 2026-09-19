"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input } from "@/components/ui";
import { Badge } from "@/components/Badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SIZES, type SizeLabel } from "@/lib/types";

export interface StockCell {
  opening_stock: number;
  stock_received: number;
  units_sold: number;
  current_stock: number;
}

export interface StockProduct {
  id: string;
  sku: string;
  product_name: string;
  stock: Partial<Record<SizeLabel, StockCell>>;
}

const EMPTY_CELL: StockCell = {
  opening_stock: 0,
  stock_received: 0,
  units_sold: 0,
  current_stock: 0,
};

export function StockEditor({
  products,
  onSave,
  title,
}: {
  products: StockProduct[];
  onSave: (
    productId: string,
    size: SizeLabel,
    fields: { opening_stock?: number; stock_received?: number; units_sold?: number }
  ) => Promise<{ error: string | null }>;
  title: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(
    products[0]?.id ?? null
  );

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl mb-1">{title}</h1>
      <p className="text-sm text-[var(--color-ink-soft)] mb-6">
        Click a product to update stock per size.
      </p>

      <div className="space-y-3">
        {products.map((p) => {
          const totalCurrent = SIZES.reduce(
            (sum, sz) => sum + (p.stock[sz]?.current_stock ?? 0),
            0
          );
          const isOpen = expanded === p.id;
          return (
            <Card key={p.id} className="overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-bg)] transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isOpen ? (
                    <ChevronDown size={16} className="text-[var(--color-ink-soft)] shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-[var(--color-ink-soft)] shrink-0" />
                  )}
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium truncate">{p.product_name}</p>
                    <p className="text-xs text-[var(--color-ink-soft)]">{p.sku}</p>
                  </div>
                </div>
                <Badge tone={totalCurrent === 0 ? "danger" : "primary"}>
                  {totalCurrent} in stock
                </Badge>
              </button>

              {isOpen && (
                <div className="border-t border-[var(--color-border)] px-4 py-3">
                  <SizeGrid productId={p.id} stock={p.stock} onSave={onSave} />
                </div>
              )}
            </Card>
          );
        })}
        {products.length === 0 && (
          <p className="text-center text-sm text-[var(--color-ink-soft)] py-10">
            No products yet. Add one from the Products page first.
          </p>
        )}
      </div>
    </div>
  );
}

function SizeGrid({
  productId,
  stock,
  onSave,
}: {
  productId: string;
  stock: Partial<Record<SizeLabel, StockCell>>;
  onSave: StockEditorProps["onSave"];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
            <th className="py-2 pr-3 font-medium">Size</th>
            <th className="py-2 px-2 font-medium">Opening</th>
            <th className="py-2 px-2 font-medium">Received</th>
            <th className="py-2 px-2 font-medium">Sold</th>
            <th className="py-2 px-2 font-medium">Current</th>
            <th className="py-2 pl-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {SIZES.map((size) => (
            <SizeRow
              key={size}
              productId={productId}
              size={size}
              cell={stock[size] ?? EMPTY_CELL}
              onSave={onSave}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface StockEditorProps {
  onSave: (
    productId: string,
    size: SizeLabel,
    fields: { opening_stock?: number; stock_received?: number; units_sold?: number }
  ) => Promise<{ error: string | null }>;
}

function SizeRow({
  productId,
  size,
  cell,
  onSave,
}: {
  productId: string;
  size: SizeLabel;
  cell: StockCell;
  onSave: StockEditorProps["onSave"];
}) {
  const router = useRouter();
  const [opening, setOpening] = useState(cell.opening_stock);
  const [received, setReceived] = useState(cell.stock_received);
  const [sold, setSold] = useState(cell.units_sold);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty =
    opening !== cell.opening_stock ||
    received !== cell.stock_received ||
    sold !== cell.units_sold;

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await onSave(productId, size, {
        opening_stock: opening,
        stock_received: received,
        units_sold: sold,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <tr className="border-t border-[var(--color-border)]">
      <td className="py-2 pr-3 font-medium whitespace-nowrap">{size}</td>
      <td className="py-2 px-2">
        <Input
          type="number"
          min={0}
          value={opening}
          onChange={(e) => setOpening(Number(e.target.value))}
          className="w-20"
        />
      </td>
      <td className="py-2 px-2">
        <Input
          type="number"
          min={0}
          value={received}
          onChange={(e) => setReceived(Number(e.target.value))}
          className="w-20"
        />
      </td>
      <td className="py-2 px-2">
        <Input
          type="number"
          min={0}
          value={sold}
          onChange={(e) => setSold(Number(e.target.value))}
          className="w-20"
        />
      </td>
      <td className="py-2 px-2 tabular font-medium">{cell.current_stock}</td>
      <td className="py-2 pl-2">
        {dirty && (
          <Button
            variant="secondary"
            className="!px-2.5 !py-1 text-xs"
            onClick={handleSave}
            disabled={pending}
          >
            {pending ? "Saving…" : "Save"}
          </Button>
        )}
        {saved && !dirty && (
          <span className="text-xs text-[var(--color-success)]">Saved ✓</span>
        )}
        {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
      </td>
    </tr>
  );
}
