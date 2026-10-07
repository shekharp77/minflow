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

const EMPTY = "\u2014";

/*
 * Built from caller-supplied data, so it must never throw: a bad locale falls
 * back to en-US, a bad currency code to a plain number followed by the code
 * (never a different currency's symbol), and a non-finite amount to a dash.
 */
function formatterFor(locale: string, currency: string): (n: number) => string {
  let lang: string | undefined = locale;
  try {
    Intl.NumberFormat.supportedLocalesOf(locale);
  } catch {
    lang = "en-US";
  }
  try {
    const nf = new Intl.NumberFormat(lang, { style: "currency", currency });
    return (n) => (Number.isFinite(n) ? nf.format(n) : EMPTY);
  } catch {
    const nf = new Intl.NumberFormat(lang, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return (n) => (Number.isFinite(n) ? `${nf.format(n)} ${currency}` : EMPTY);
  }
}

export function PriceTag({
  amount,
  compareAt,
  currency = "USD",
  locale = "en-US",
  className,
}: PriceTagProps) {
  const format = React.useMemo(() => formatterFor(locale, currency), [locale, currency]);
  const onSale = compareAt !== undefined && compareAt > amount;

  return (
    <span
      className={cn("inline-flex items-baseline gap-2 tabular-nums", className)}
    >
      <span className="text-emphasis font-medium text-text">
        {format(amount)}
      </span>
      {onSale && (
        <>
          <s className="text-body text-text-2">
            <span className="sr-only">Was </span>
            {format(compareAt)}
          </s>
          <span className="rounded-full bg-fg px-2 text-caption font-medium leading-5 text-bg">
            Sale
          </span>
        </>
      )}
    </span>
  );
}
