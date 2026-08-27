"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { FieldChevron } from "@/registry/miniflow/ui/field";
import { cn } from "@/lib/utils";

/*
 * Split button, inline: the label runs the default action and the chevron
 * opens the alternatives. No outline and no rule between the halves. The two
 * are held together by proximity and by a shared hover fill that lights the
 * whole pair, so it reads as one control that happens to have two targets.
 */
export interface SplitButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  menu: React.ReactNode;
  className?: string;
}

export function SplitButton({ children, onClick, menu, className }: SplitButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <span
      className={cn(
        "group/split inline-flex items-center rounded-control transition-colors duration-300 hover:bg-hover",
        open && "bg-hover",
        className
      )}
    >
      <Button
        variant="text"
        onClick={onClick}
        className="pr-1 group-hover/split:text-text"
      >
        {children}
      </Button>
      {/*
        * Aligned to the chevron's leading edge, not its trailing one: the
        * menu is wider than the chevron, so end-alignment hangs it off to
        * the left and clips it whenever the control sits near a left edge.
        */}
      <Menu
        align="start"
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button
            variant="text"
            aria-label="More actions"
            className="px-1.5 group-hover/split:text-text"
          >
            <FieldChevron open={open} />
          </Button>
        }
      >
        {menu}
      </Menu>
    </span>
  );
}
