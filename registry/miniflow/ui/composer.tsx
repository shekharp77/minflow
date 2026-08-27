"use client";

import * as React from "react";
import {
  Box,
  Check,
  ChevronsUp,
  MoreHorizontal,
  Paperclip,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Sparkles,
  Tag,
  UserRound,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Menu, MenuItem, MenuLabel } from "@/components/ui/menu";
import { cn } from "@/lib/utils";

/*
 * Inline composer, the Linear-style creation form: no field boxes, one
 * mandatory input, properties as quiet pill menus, suggestions one click
 * away. Creation is one word; completeness is incremental.
 */
interface PillProps extends React.ComponentProps<"button"> {
  icon?: React.ReactNode;
}

function Pill({ icon, className, children, ...props }: PillProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border border-border-strong px-2 text-caption font-medium text-text-2 outline-none transition-colors duration-200 hover:bg-hover hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&_svg]:size-3.5 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

const PRIORITIES = [
  { value: "none", label: "No priority", icon: <MoreHorizontal /> },
  { value: "urgent", label: "Urgent", icon: <ChevronsUp /> },
  { value: "high", label: "High", icon: <SignalHigh /> },
  { value: "medium", label: "Medium", icon: <SignalMedium /> },
  { value: "low", label: "Low", icon: <SignalLow /> },
];

const PEOPLE = ["Mira", "Jon", "Sana"];
const TAGS = ["Motion", "Tokens", "Docs"];

export interface ComposerProps {
  team?: string;
  suggestions?: string[];
  onCreate?: (title: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function Composer({
  team = "CORE",
  suggestions = ["Refine motion tokens"],
  onCreate,
  onCancel,
  className,
}: ComposerProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState(PRIORITIES[0]);
  const [assignee, setAssignee] = React.useState<string | null>(null);
  const [labels, setLabels] = React.useState<string[]>([]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setPriority(PRIORITIES[0]);
    setAssignee(null);
    setLabels([]);
  };

  return (
    <div className={cn("flex w-full max-w-xl flex-col gap-2.5", className)}>
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex size-3.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-fg-2/50"
        >
          <span className="size-1 rounded-full bg-fg-2/50" />
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="w-full bg-transparent font-sans text-emphasis font-medium text-text outline-none placeholder:text-text-2/70"
        />
      </div>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Notes, links, context..."
        className="w-full bg-transparent font-sans text-body text-text outline-none placeholder:text-text-2/70"
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-caption text-text-2 [&_svg]:size-3.5">
          <Zap aria-hidden />
          Suggested
        </span>
        {suggestions.map((s) => (
          <Pill key={s} icon={<Sparkles />} onClick={() => setTitle(s)}>
            {s}
          </Pill>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex h-6 items-center gap-1 rounded-full bg-id-1/12 px-2 text-caption font-medium text-id-1 [&_svg]:size-3.5">
          <Box aria-hidden />
          {team}
        </span>
        <Menu
          trigger={
            <Pill icon={priority.icon}>
              {priority.value === "none" ? "Priority" : priority.label}
            </Pill>
          }
        >
          <MenuLabel>Priority</MenuLabel>
          {PRIORITIES.map((p) => (
            <MenuItem key={p.value} icon={p.icon} onSelect={() => setPriority(p)}>
              {p.label}
            </MenuItem>
          ))}
        </Menu>
        <Menu
          trigger={
            <Pill icon={<UserRound />}>{assignee ?? "Owner"}</Pill>
          }
        >
          <MenuLabel>Owner</MenuLabel>
          {PEOPLE.map((p) => (
            <MenuItem key={p} icon={<UserRound />} onSelect={() => setAssignee(p)}>
              {p}
            </MenuItem>
          ))}
          <MenuItem
            icon={<MoreHorizontal />}
            onSelect={() => setAssignee(null)}
          >
            No owner
          </MenuItem>
        </Menu>
        <Menu
          trigger={
            <Pill icon={<Tag />}>
              {labels.length > 0 ? labels.join(", ") : "Tags"}
            </Pill>
          }
        >
          <MenuLabel>Tags</MenuLabel>
          {TAGS.map((l) => (
            <MenuItem
              key={l}
              icon={<Tag />}
              onSelect={() =>
                setLabels((prev) =>
                  prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
                )
              }
            >
              {l}
              {labels.includes(l) && <Check className="ml-auto" aria-hidden />}
            </MenuItem>
          ))}
        </Menu>
        <Pill icon={<MoreHorizontal />} aria-label="More properties" />
      </div>
      <div className="flex items-center gap-4 pt-1">
        <IconButton label="Attach" className="size-8 -ml-1.5">
          <Paperclip />
        </IconButton>
        <span className="ml-auto flex items-center gap-3">
          <Button
            onClick={() => {
              reset();
              onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            accent
            size="sm"
            disabled={!title.trim()}
            onClick={() => {
              onCreate?.(title.trim());
              reset();
            }}
          >
            Create
          </Button>
        </span>
      </div>
    </div>
  );
}
