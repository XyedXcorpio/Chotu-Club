"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logTransfer } from "@/app/actions";
import { Button, Card, Input, Label, Select } from "@/components/ui";
import { SIZES } from "@/lib/types";
import type { Product } from "@/lib/types";

export function TransferForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const result = await logTransfer(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    router.refresh();
    (document.getElementById("transfer-form") as HTMLFormElement)?.reset();
    setTimeout(() => setSuccess(false), 2000);
  }

  return (
    <Card className="p-5">
      <h2 className="font-medium text-sm mb-4">Log a transfer</h2>
      <form id="transfer-form" action={handleSubmit} className="space-y-3">
        <div>
          <Label>Product</Label>
          <Select name="product_id" required defaultValue="">
            <option value="" disabled>
              Select a product
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.product_name} — {p.sku}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Size</Label>
            <Select name="size" required defaultValue="">
              <option value="" disabled>
                Select size
              </option>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Quantity</Label>
            <Input type="number" name="quantity" min={1} required />
          </div>
        </div>
        <div>
          <Label>Direction</Label>
          <Select name="direction" required defaultValue="Warehouse to Store">
            <option value="Warehouse to Store">Warehouse → Store</option>
            <option value="Store to Warehouse">Store → Warehouse</option>
          </Select>
        </div>
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            name="transfer_date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
        <div>
          <Label>Notes</Label>
          <Input name="notes" placeholder="Optional" />
        </div>

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        {success && (
          <p className="text-sm text-[var(--color-success)]">Transfer logged ✓</p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging…" : "Log transfer"}
        </Button>
      </form>
    </Card>
  );
}
