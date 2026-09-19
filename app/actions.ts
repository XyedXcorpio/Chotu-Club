"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOwner, requireUser } from "@/lib/auth";
import type { Direction, SizeLabel } from "@/lib/types";

// ---------------------------------------------------------------------------
// Products — owner only (enforced by requireOwner + RLS as a second layer)
// ---------------------------------------------------------------------------
export async function createProduct(formData: FormData) {
  await requireOwner();
  const supabase = await createClient();

  const payload = {
    sku: String(formData.get("sku") ?? "").trim(),
    product_name: String(formData.get("product_name") ?? "").trim(),
    brand: String(formData.get("brand") ?? "Chotu's Club").trim(),
    category: String(formData.get("category") ?? "Track Suit").trim(),
    gender: String(formData.get("gender") ?? "Unisex"),
    color: String(formData.get("color") ?? "").trim() || null,
    cost_price: Number(formData.get("cost_price") ?? 0),
    sale_price: Number(formData.get("sale_price") ?? 0),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };

  if (!payload.sku || !payload.product_name) {
    return { error: "SKU and product name are required." };
  }

  const { error } = await supabase.from("products").insert(payload);
  if (error) {
    return { error: error.message.includes("duplicate") ? "That SKU already exists." : error.message };
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireOwner();
  const supabase = await createClient();

  const payload = {
    product_name: String(formData.get("product_name") ?? "").trim(),
    brand: String(formData.get("brand") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    gender: String(formData.get("gender") ?? "Unisex"),
    color: String(formData.get("color") ?? "").trim() || null,
    cost_price: Number(formData.get("cost_price") ?? 0),
    sale_price: Number(formData.get("sale_price") ?? 0),
    notes: String(formData.get("notes") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("products").update(payload).eq("id", productId);
  if (error) return { error: error.message };

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function archiveProduct(productId: string) {
  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ archived: true })
    .eq("id", productId);
  if (error) return { error: error.message };

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { error: null };
}

// ---------------------------------------------------------------------------
// Stock — owner + store_staff can update Store stock; only owner can update
// Warehouse stock (also enforced by RLS on warehouse_stock).
// ---------------------------------------------------------------------------
async function upsertStock(
  table: "store_stock" | "warehouse_stock",
  productId: string,
  size: SizeLabel,
  fields: { opening_stock?: number; stock_received?: number; units_sold?: number }
) {
  const supabase = await createClient();
  const { error } = await supabase.from(table).upsert(
    {
      product_id: productId,
      size,
      ...fields,
      last_updated: new Date().toISOString(),
    },
    { onConflict: "product_id,size" }
  );
  return error;
}

export async function updateStoreStock(
  productId: string,
  size: SizeLabel,
  fields: { opening_stock?: number; stock_received?: number; units_sold?: number }
) {
  await requireUser(); // any signed-in user (owner or store_staff)
  const error = await upsertStock("store_stock", productId, size, fields);
  if (error) return { error: error.message };

  revalidatePath("/store-stock");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  return { error: null };
}

export async function updateWarehouseStock(
  productId: string,
  size: SizeLabel,
  fields: { opening_stock?: number; stock_received?: number; units_sold?: number }
) {
  await requireOwner();
  const error = await upsertStock("warehouse_stock", productId, size, fields);
  if (error) return { error: error.message };

  revalidatePath("/warehouse-stock");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  return { error: null };
}

// ---------------------------------------------------------------------------
// Transfers — owner + store_staff can log; only owner can delete
// ---------------------------------------------------------------------------
export async function logTransfer(formData: FormData) {
  const { userId } = await requireUser();
  const supabase = await createClient();

  const payload = {
    product_id: String(formData.get("product_id") ?? ""),
    size: String(formData.get("size") ?? "") as SizeLabel,
    quantity: Number(formData.get("quantity") ?? 0),
    direction: String(formData.get("direction") ?? "") as Direction,
    transfer_date: String(formData.get("transfer_date") ?? new Date().toISOString().slice(0, 10)),
    notes: String(formData.get("notes") ?? "").trim() || null,
    logged_by: userId,
  };

  if (!payload.product_id || !payload.size || !payload.quantity || payload.quantity <= 0) {
    return { error: "Product, size, and a positive quantity are required." };
  }

  const { error } = await supabase.from("transfers").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/transfers");
  revalidatePath("/store-stock");
  revalidatePath("/warehouse-stock");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  return { error: null };
}

export async function deleteTransfer(transferId: string) {
  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase.from("transfers").delete().eq("id", transferId);
  if (error) return { error: error.message };

  revalidatePath("/transfers");
  revalidatePath("/store-stock");
  revalidatePath("/warehouse-stock");
  revalidatePath("/dashboard");
  return { error: null };
}
