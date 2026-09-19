import { Card } from "@/components/ui";

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium text-[var(--color-ink-soft)] uppercase tracking-wide">
        {label}
      </p>
      <p className="font-display text-3xl mt-2 tabular">{value}</p>
      {sub && <p className="text-xs text-[var(--color-ink-soft)] mt-1">{sub}</p>}
    </Card>
  );
}
