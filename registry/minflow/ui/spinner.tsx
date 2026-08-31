import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* Working state is shown, not written: the spinning loader is the message. */
const sizes = {
  16: "size-4",
  20: "size-5",
  24: "size-6",
} as const;

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: keyof typeof sizes;
  /** Accessible name for the working state. */
  label?: string;
}

export function Spinner({
  size = 16,
  label = "Loading",
  className,
  ...props
}: SpinnerProps) {
  return (
    <LoaderCircle
      role="status"
      aria-label={label}
      className={cn("animate-spin text-fg-2", sizes[size], className)}
      {...props}
    />
  );
}
