import { requireUser } from "@/lib/auth";
import { getProducts, getTransfers } from "@/lib/data";
import { TransferForm } from "@/components/TransferForm";
import { TransferHistory } from "@/components/TransferHistory";

export default async function TransfersPage() {
  const { profile } = await requireUser();
  const [products, transfers] = await Promise.all([
    getProducts(),
    getTransfers(),
  ]);

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl mb-1">Transfers</h1>
      <p className="text-sm text-[var(--color-ink-soft)] mb-6">
        Move stock between warehouse and store.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <TransferForm products={products} />
        </div>
        <div className="md:col-span-2">
          <TransferHistory
            transfers={transfers}
            canDelete={profile.role === "owner"}
          />
        </div>
      </div>
    </div>
  );
}
