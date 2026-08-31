"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { Button } from "@/registry/minflow/ui/button";
import { Sheet } from "@/registry/minflow/ui/sheet";
import { DocsSidebar } from "@/components/site/docs-sidebar";

/*
 * The docs rail for narrow viewports. Below the breakpoint where the standing
 * sidebar fits, the same navigation moves into a sheet behind a visible
 * trigger: hidden, but never lost. Navigating closes it, so a tap on a
 * component does not leave the sheet covering the page it just opened.
 */
export function DocsNavSheet() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="-ml-2.5"
        aria-expanded={open}
      >
        <PanelLeft />
        All components
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Components">
        <DocsSidebar />
      </Sheet>
    </div>
  );
}
