import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Link whose underline draws itself left to right on hover, via a
 * background-size transition; no layout shift, no decoration at rest.
 */
export interface LinkProps extends React.ComponentProps<"a"> {
  external?: boolean;
}

export function Link({ external, className, children, ...props }: LinkProps) {
  return (
    <a
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={cn(
        "group/link inline-flex items-center gap-0.5 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat text-body text-text outline-none transition-[background-size] duration-150 hover:bg-[length:100%_1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className
      )}
      {...props}
    >
      {children}
      {external && (
        <ArrowUpRight
          aria-hidden
          className="size-3.5 text-fg-2 transition-transform duration-150 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
        />
      )}
    </a>
  );
}
