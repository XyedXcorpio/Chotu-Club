import { requireOwner } from "@/lib/auth";
import { getProducts, getWarehouseStock } from "@/lib/data";
import { updateWarehouseStock } from "@/app/actions";
import { StockEditor, type StockProduct } from "@/components/StockEditor";
import type { SizeLabel } from "@/lib/types";

export default async function WarehouseStockPage() {
  await requireOwner();
  const [products, stockRows] = await Promise.all([
    getProducts(),
    getWarehouseStock(),
  ]);

  const stockByProduct = new Map<string, StockProduct["stock"]>();
  for (const row of stockRows) {
    const key = row.product_id;
    if (!stockByProduct.has(key)) stockByProduct.set(key, {});
    stockByProduct.get(key)![row.size as SizeLabel] = {
      opening_stock: row.opening_stock,
      stock_received: row.stock_received,
      units_sold: row.units_sold,
      current_stock: row.current_stock,
    };
  }

  const items: StockProduct[] = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    product_name: p.product_name,
    stock: stockByProduct.get(p.id) ?? {},
  }));

  return (
    <StockEditor products={items} onSave={updateWarehouseStock} title="Warehouse stock" />
  );
}
