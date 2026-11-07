import type { LucideIcon } from "lucide-react";

export type CardVariant = "success" | "primary" | "neutral" | "danger";

const variantStyles: Record<
  CardVariant,
  { border: string; iconBox: string; subtext: string }
> = {
  success: {
    border: "border-green-500",
    iconBox: "bg-green-100 text-green-600",
    subtext: "text-green-600",
  },
  primary: {
    border: "border-blue-500",
    iconBox: "bg-blue-100 text-blue-600",
    subtext: "text-blue-600",
  },
  neutral: {
    border: "border-gray-300",
    iconBox: "bg-gray-100 text-gray-600",
    subtext: "text-gray-500",
  },
  danger: {
    border: "border-red-500",
    iconBox: "bg-red-100 text-red-600",
    subtext: "text-red-600",
  },
};

type SummaryCardProps = {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  variant: CardVariant;
};

export default function SummaryCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant,
}: SummaryCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm ${styles.border}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {title}
        </p>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.iconBox}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-2 whitespace-nowrap text-2xl font-bold text-gray-900">
        {value}
      </p>
      <p className={`mt-1 text-xs ${styles.subtext}`}>{subtext}</p>
    </div>
  );
}