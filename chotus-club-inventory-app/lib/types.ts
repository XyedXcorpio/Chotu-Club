export type Role = "owner" | "store_staff";

export type Direction = "Warehouse to Store" | "Store to Warehouse";

export const SIZES = [
  "4-5",
  "5-6",
  "6-7",
  "7-8",
  "8-9",
  "9-10",
  "10-11",
  "11-12",
  "12+",
] as const;

export type SizeLabel = (typeof SIZES)[number];

export interface Profile {
  id: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  product_name: string;
  brand: string;
  category: string;
  gender: "Boys" | "Girls" | "Unisex";
  color: string | null;
  cost_price: number;
  sale_price: number;
  date_added: string;
  notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

/** Product shape safe to show to store staff — no price/profit fields. */
export type ProductPublic = Omit<Product, "cost_price" | "sale_price">;

export interface StockRow {
  id: string;
  product_id: string;
  size: SizeLabel;
  opening_stock: number;
  stock_received: number;
  units_sold: number;
  current_stock: number;
  last_updated: string;
  notes: string | null;
}

export interface Transfer {
  id: string;
  product_id: string;
  size: SizeLabel;
  quantity: number;
  direction: Direction;
  transfer_date: string;
  logged_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProductSizeSummary {
  product_id: string;
  sku: string;
  product_name: string;
  gender: string;
  color: string | null;
  cost_price: number;
  sale_price: number;
  size: SizeLabel;
  store_stock: number;
  warehouse_stock: number;
  total_stock: number;
  store_sold: number;
  warehouse_sold: number;
  total_sold: number;
}

export interface ProductSummary {
  product_id: string;
  sku: string;
  product_name: string;
  brand: string;
  category: string;
  gender: string;
  color: string | null;
  cost_price: number;
  sale_price: number;
  profit_per_unit: number;
  margin_pct: number | null;
  total_stock: number;
  total_sold: number;
  total_revenue: number;
  total_profit: number;
  date_added: string;
  notes: string | null;
}

/** Product summary shape safe for store staff — no money fields. */
export type ProductSummaryPublic = Omit<
  ProductSummary,
  "cost_price" | "sale_price" | "profit_per_unit" | "margin_pct" | "total_revenue" | "total_profit"
>;
