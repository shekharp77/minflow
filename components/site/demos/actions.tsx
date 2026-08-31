"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Download,
  FileImage,
  FileText,
  Pencil,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { BackToTop } from "@/registry/minflow/ui/back-to-top";
import { Button } from "@/registry/minflow/ui/button";
import { Fab } from "@/registry/minflow/ui/fab";
import { IconButton } from "@/registry/minflow/ui/icon-button";
import { IconSwap } from "@/registry/minflow/ui/icon-swap";
import { MenuItem } from "@/registry/minflow/ui/menu";
import { SplitButton } from "@/registry/minflow/ui/split-button";
import { toast } from "@/registry/minflow/ui/toast";
import type { DemoSet } from "@/components/site/demos/types";

function CopyDemo() {
  const [copied, setCopied] = React.useState(false);
  return (
    <IconButton
      label={copied ? "Copied" : "Copy command"}
      onClick={() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      <IconSwap id={copied ? "done" : "idle"}>
        {copied ? <Check className="text-ok" /> : <Copy />}
      </IconSwap>
    </IconButton>
  );
}

export const actionDemos: DemoSet = {
  "minimilist-button": {
    text: (
      <>
        <Button>Continue</Button>
        <Button>Duplicate</Button>
        <Button>Cancel</Button>
      </>
    ),
    accent: (
      <>
        <Button accent>Deploy</Button>
        <Button>Cancel</Button>
      </>
    ),
    ghost: (
      <>
        <Button variant="ghost">Rename</Button>
        <Button variant="ghost">Duplicate</Button>
        <Button variant="ghost">Archive</Button>
      </>
    ),
    "outline-solid": (
      <>
        <Button variant="outline">Export</Button>
        <Button variant="solid">Commit</Button>
      </>
    ),
    loading: (
      <>
        <Button loading>Syncing</Button>
        <Button disabled>Unavailable</Button>
      </>
    ),
  },

  "minimilist-icon-button": {
    sizes: (
      <>
        <IconButton label="Download" size={16}>
          <Download />
        </IconButton>
        <IconButton label="Edit" size={20}>
          <Pencil />
        </IconButton>
        <IconButton label="Settings" size={24}>
          <Settings />
        </IconButton>
      </>
    ),
    accent: (
      <>
        <IconButton label="Add item" accent>
          <Plus />
        </IconButton>
        <IconButton label="Download">
          <Download />
        </IconButton>
        <IconButton label="Delete">
          <Trash2 />
        </IconButton>
      </>
    ),
    disabled: (
      <>
        <IconButton label="Edit">
          <Pencil />
        </IconButton>
        <IconButton label="Delete, unavailable" disabled>
          <Trash2 />
        </IconButton>
      </>
    ),
  },

  "minimilist-split-button": {
    default: (
      <SplitButton
        onClick={() => toast("Exported as CSV")}
        menu={
          <>
            <MenuItem onSelect={() => toast("Exported as PNG")}>
              Export PNG
            </MenuItem>
            <MenuItem onSelect={() => toast("Exported as PDF")}>
              Export PDF
            </MenuItem>
          </>
        }
      >
        Export CSV
      </SplitButton>
    ),
    icons: (
      <SplitButton
        onClick={() => toast("Saved a copy")}
        menu={
          <>
            <MenuItem icon={<FileImage />} onSelect={() => toast("Saved PNG")}>
              As image
            </MenuItem>
            <MenuItem icon={<FileText />} onSelect={() => toast("Saved PDF")}>
              As document
            </MenuItem>
          </>
        }
      >
        Save a copy
      </SplitButton>
    ),
  },

  "minimilist-fab": {
    default: (
      <div className="relative h-24 w-full max-w-64">
        <Fab label="New project" onClick={() => toast("New project")}>
          <Plus />
        </Fab>
      </div>
    ),
    labelled: (
      <div className="relative h-24 w-full max-w-64">
        <Fab
          label="New project"
          onClick={() => toast("New project")}
          className="size-auto h-12 w-auto gap-2 px-5 text-body font-medium"
        >
          <Plus />
          New project
        </Fab>
      </div>
    ),
  },

  "minimilist-back-to-top": {
    default: (
      <>
        <p className="text-body text-text-2">
          Scroll this page past the fold; the control appears in the trailing
          gutter, bottom right.
        </p>
        <BackToTop />
      </>
    ),
  },

  "minimilist-icon-swap": {
    default: <CopyDemo />,
  },
};
