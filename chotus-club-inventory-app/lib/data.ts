import { createClient } from "@/lib/supabase/server";
import type {
  Product,
  ProductSizeSummary,
  ProductSummary,
  StockRow,
  Transfer,
} from "@/lib/types";

type StockWithProduct = StockRow & {
  product: Pick<Product, "id" | "sku" | "product_name" | "gender" | "color">;
};

export type TransferWithRefs = Transfer & {
  product: Pick<Product, "sku" | "product_name">;
  logger: { full_name: string | null } | null;
};

/** All active products with full price info (owner use) or stripped (staff use handled in UI). */
export async function getProductSummaries(): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_product_summary")
    .select("*")
    .order("product_name");
  if (error) throw error;
  return data as ProductSummary[];
}

export async function getProductSizeSummaries(): Promise<ProductSizeSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_product_size_summary")
    .select("*");
  if (error) throw error;
  return data as ProductSizeSummary[];
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("archived", false)
    .order("product_name");
  if (error) throw error;
  return data as Product[];
}

export async function getStoreStock(): Promise<StockWithProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_store_stock")
    .select("*, product:products(id, sku, product_name, gender, color)")
    .order("last_updated", { ascending: false });
  if (error) throw error;
  return data as unknown as StockWithProduct[];
}

export async function getWarehouseStock(): Promise<StockWithProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_warehouse_stock")
    .select("*, product:products(id, sku, product_name, gender, color)")
    .order("last_updated", { ascending: false });
  if (error) throw error;
  return data as unknown as StockWithProduct[];
}

export async function getTransfers(limit = 100): Promise<TransferWithRefs[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transfers")
    .select("*, product:products(sku, product_name), logger:profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as unknown as TransferWithRefs[];
}
