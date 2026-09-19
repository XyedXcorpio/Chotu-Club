import { requireUser } from "@/lib/auth";
import { getProducts, getProductSummaries } from "@/lib/data";
import { ProductsView } from "@/components/ProductsView";

export default async function ProductsPage() {
  const { profile } = await requireUser();
  const [products, summaries] = await Promise.all([
    getProducts(),
    getProductSummaries(),
  ]);

  // Products and Summaries are passed to a Client Component, which means
  // whatever we pass here is serialized and sent to the browser — so for
  // store staff we must strip price/profit fields HERE, not just hide the
  // columns in the UI, or the numbers would still be visible in devtools.
  const safeProducts =
    profile.role === "owner"
      ? products
      : products.map((p) => ({ ...p, cost_price: 0, sale_price: 0 }));
  const safeSummaries =
    profile.role === "owner"
      ? summaries
      : summaries.map((s) => ({
          ...s,
          cost_price: 0,
          sale_price: 0,
          profit_per_unit: 0,
          margin_pct: null,
          total_revenue: 0,
          total_profit: 0,
        }));

  return (
    <ProductsView
      role={profile.role}
      products={safeProducts}
      summaries={safeSummaries}
    />
  );
}
