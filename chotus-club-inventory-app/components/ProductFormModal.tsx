"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/app/actions";
import { Button, Input, Label, Select } from "@/components/ui";
import { X } from "lucide-react";
import type { Product } from "@/lib/types";

export function ProductFormModal({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(product);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = isEdit
      ? await updateProduct(product!.id, formData)
      : await createProduct(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-display text-lg">
            {isEdit ? "Edit product" : "New product"}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
          >
            <X size={18} />
          </button>
        </div>

        <form action={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {!isEdit && (
            <div>
              <Label>SKU</Label>
              <Input
                name="sku"
                required
                placeholder="CC-TS-B-BLU-001"
                pattern="\S+"
              />
            </div>
          )}
          <div>
            <Label>Product name</Label>
            <Input
              name="product_name"
              required
              defaultValue={product?.product_name}
              placeholder="Classic Track Suit"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Gender</Label>
              <Select name="gender" defaultValue={product?.gender ?? "Boys"}>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Unisex">Unisex</option>
              </Select>
            </div>
            <div>
              <Label>Color</Label>
              <Input name="color" defaultValue={product?.color ?? ""} placeholder="Blue" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Brand</Label>
              <Input
                name="brand"
                defaultValue={product?.brand ?? "Chotu's Club"}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                name="category"
                defaultValue={product?.category ?? "Track Suit"}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cost price (Rs)</Label>
              <Input
                type="number"
                name="cost_price"
                min={0}
                step="0.01"
                required
                defaultValue={product?.cost_price}
              />
            </div>
            <div>
              <Label>Sale price (Rs)</Label>
              <Input
                type="number"
                name="sale_price"
                min={0}
                step="0.01"
                required
                defaultValue={product?.sale_price}
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Input name="notes" defaultValue={product?.notes ?? ""} placeholder="Optional" />
          </div>

          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save changes" : "Add product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
