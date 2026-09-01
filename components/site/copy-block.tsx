"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { IconButton } from "@/registry/minflow/ui/icon-button";
import { IconSwap } from "@/registry/minflow/ui/icon-swap";

/*
 * A multi-line snippet with a copy control. CopyLine's sibling: that one is a
 * single shell command sitting on one row, this is a config block where the
 * line breaks and the indentation carry meaning, so it is set in mono and the
 * control moves to the top corner rather than sitting on the baseline.
 *
 * Still boxless. The snippet is distinguished by its typeface and its copy
 * affordance, not by a rule drawn around it.
 */
export function CopyBlock({
  code,
  label = "Copy",
}: {
  code: string;
  /** Accessible name for the control; also the tooltip. */
  label?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    /* Held to the prose measure: `absolute right-0` resolves against this
     * wrapper, so letting it span the full column strands the control in
     * whitespace far from the snippet it belongs to. */
    <div className="relative max-w-[62ch]">
      {/* Reserve room so a long line never runs under the control. */}
      <pre className="overflow-x-auto pr-10 font-mono text-caption leading-relaxed text-text-2">
        <code>{code}</code>
      </pre>
      <div className="absolute right-0 top-0">
        <IconButton
          label={copied ? "Copied" : label}
          onClick={copy}
          className="size-8"
        >
          <IconSwap id={copied ? "done" : "idle"}>
            {copied ? <Check className="text-ok" /> : <Copy />}
          </IconSwap>
        </IconButton>
      </div>
    </div>
  );
}
