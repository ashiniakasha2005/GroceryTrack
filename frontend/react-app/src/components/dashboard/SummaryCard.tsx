import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react";

export type CardVariant = "success" | "primary" | "neutral" | "danger";

const variantStyles: Record<
  CardVariant,
  { border: string; iconBox: string; subtext: string }
> = {
  success: {
    border: "border-[#198754]",
    iconBox: "bg-[#D1E7DD] text-[#198754]",
    subtext: "text-[#198754]",
  },
  primary: {
    border: "border-[#0D6EFD]",
    iconBox: "bg-[#CFE2FF] text-[#0D6EFD]",
    subtext: "text-[#198754]",
  },
  neutral: {
    border: "border-[#6C757D]",
    iconBox: "bg-[#E9ECEF] text-[#6C757D]",
    subtext: "text-[#ADB5BD]",
  },
  danger: {
    border: "border-[#DC3545]",
    iconBox: "bg-[#F8D7DA] text-[#DC3545]",
    subtext: "text-[#DC3545]",
  },
};

type SummaryCardProps = {
  title: string;
  value: string | number;
  fullValue?: string; // full number, shown in the tooltip when value is shortened
  subtext: string;
  icon: LucideIcon;
  variant: CardVariant;
  arrow?: "up" | "down";
};

export default function SummaryCard({
  title,
  value,
  fullValue,
  subtext,
  icon: Icon,
  variant,
  arrow,
}: SummaryCardProps) {
  const styles = variantStyles[variant];

  const text = String(value);
  const tooltipText = fullValue ?? text;
  const isShortened = fullValue !== undefined && fullValue !== text;

  // Safety net: is the text still cut with "..." on a very narrow card?
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isCut, setIsCut] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const check = () => setIsCut(el.scrollWidth - el.clientWidth > 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  const hasTooltip = isShortened || isCut;

  return (
    <div
      className={`flex h-full flex-col gap-3 rounded-[10px] border-[0.8px] border-t-[2.4px] bg-white px-[22px] py-5 shadow-sm ${styles.border}`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="whitespace-nowrap text-xs font-medium uppercase leading-[18px] tracking-[0.2px] text-[#ADB5BD]">
            {title}
          </p>

          <div
            className={`relative mt-1.5 outline-none ${
              hasTooltip ? "cursor-pointer" : ""
            }`}
            tabIndex={hasTooltip ? 0 : undefined}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onClick={() => setShow((s) => !s)}
            onBlur={() => setShow(false)}
          >
            <p
              ref={textRef}
              className="truncate text-xl font-bold leading-[26px] text-[#212529] min-[1360px]:text-[22px] min-[1440px]:text-[26px]"
            >
              {value}
            </p>

            {hasTooltip && show && (
              <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-1 whitespace-nowrap rounded-md bg-[#212529] px-2 py-1 text-xs font-medium text-white shadow-lg">
                {tooltipText}
              </span>
            )}
          </div>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${styles.iconBox}`}
        >
          <Icon className="h-[22px] w-[22px]" />
        </div>
      </div>

      <p
        className={`mt-auto flex items-center gap-1 text-xs leading-[18px] ${
          arrow === "down" ? "text-[#DC3545]" : styles.subtext
        }`}
      >
        {arrow === "up" && <ChevronUp className="h-3 w-3" />}
        {arrow === "down" && <ChevronDown className="h-3 w-3" />}
        {subtext}
      </p>
    </div>
  );
}