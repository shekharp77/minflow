"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { IconButton } from "@/registry/minflow/ui/icon-button";
import { IconSwap } from "@/registry/minflow/ui/icon-swap";

/* An install command with a copy control that confirms with a tick. */
export function CopyLine({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2">
      <code className="font-sans text-body text-text-2">{command}</code>
      <IconButton
        label={copied ? "Copied" : "Copy command"}
        onClick={copy}
        className="size-8"
      >
        <IconSwap id={copied ? "done" : "idle"}>
          {copied ? <Check className="text-ok" /> : <Copy />}
        </IconSwap>
      </IconButton>
    </div>
  );
}
