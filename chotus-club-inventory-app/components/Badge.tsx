const TONE_CLASSES: Record<string, string> = {
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  accent: "bg-[var(--color-accent-soft)] text-[#8a5a12]",
  neutral: "bg-[var(--color-border)] text-[var(--color-ink-soft)]",
  primary: "bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONE_CLASSES;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
