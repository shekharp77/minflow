import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * PriceTag: one way to show a price. The amount is formatted by Intl for the
 * given currency and locale; a higher compare-at price renders struck through
 * beside a "Sale" badge, and without one neither appears.
 */
export interface PriceTagProps {
  amount: number;
  /** The pre-sale price. Only shown when it is higher than `amount`. */
  compareAt?: number;
  currency?: string;
  locale?: string;
  className?: string;
}

export function PriceTag({
  amount,
  compareAt,
  currency = "USD",
  locale = "en-US",
  className,
}: PriceTagProps) {
  const format = React.useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency }),
    [locale, currency],
  );
  const onSale = compareAt !== undefined && compareAt > amount;

  return (
    <span
      className={cn("inline-flex items-baseline gap-2 tabular-nums", className)}
    >
      <span className="text-emphasis font-medium text-text">
        {format.format(amount)}
      </span>
      {onSale && (
        <>
          <s className="text-body text-text-2">
            <span className="sr-only">Was </span>
            {format.format(compareAt)}
          </s>
          <span className="rounded-full bg-fg px-2 text-caption font-medium leading-5 text-bg">
            Sale
          </span>
        </>
      )}
    </span>
  );
}
