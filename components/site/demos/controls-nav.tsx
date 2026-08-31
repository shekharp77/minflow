"use client";

import * as React from "react";
import {
  ArrowLeft,
  AtSign,
  Bell,
  Box,
  Compass,
  Copy,
  Ellipsis,
  FileText,
  Home,
  Image as ImageIcon,
  Inbox,
  Lightbulb,
  Pencil,
  Rocket,
  Search,
  Trash2,
  Users,
  Video,
  Wand,
} from "lucide-react";
import { AiPrompt } from "@/registry/minflow/ui/ai-prompt";
import { AppBar } from "@/registry/minflow/ui/app-bar";
import { BottomNav } from "@/registry/minflow/ui/bottom-nav";
import { ButtonGroup } from "@/registry/minflow/ui/button-group";
import { DeviceMockup } from "@/registry/minflow/ui/device-mockup";
import { IconButton } from "@/registry/minflow/ui/icon-button";
import { Menubar } from "@/registry/minflow/ui/menubar";
import { MenuItem, MenuLabel } from "@/registry/minflow/ui/menu";
import { Pagination } from "@/registry/minflow/ui/pagination";
import { ProgressSteps } from "@/registry/minflow/ui/progress-steps";
import { Rating } from "@/registry/minflow/ui/rating";
import { SpeedDial } from "@/registry/minflow/ui/speed-dial";
import { Text } from "@/registry/minflow/ui/typography";
import { TransferList } from "@/registry/minflow/ui/transfer-list";
import type { DemoSet } from "@/components/site/demos/types";

function PaginationDemo({ count, start = 1 }: { count: number; start?: number }) {
  const [page, setPage] = React.useState(start);
  return (
    <div className="flex flex-col gap-3">
      <Pagination page={page} count={count} onChange={setPage} />
      <p className="px-1 text-caption text-text-2">
        Page {page} of {count}
      </p>
    </div>
  );
}

function StepsDemo({
  orientation,
  fixed,
}: {
  orientation: "horizontal" | "vertical";
  fixed?: number;
}) {
  const steps = [
    { id: "cart", label: "Cart", detail: "Three items, ready to go" },
    { id: "address", label: "Address", detail: "Where it should arrive" },
    { id: "payment", label: "Payment", detail: "Card or transfer" },
    { id: "done", label: "Confirm", detail: "Review and place the order" },
  ];
  const [active, setActive] = React.useState(fixed ?? 1);

  return (
    <div className={orientation === "horizontal" ? "w-full max-w-lg" : "w-full max-w-sm"}>
      <ProgressSteps steps={steps} active={active} orientation={orientation} />
      {fixed === undefined && (
        <div className="mt-6">
          <ButtonGroup
            label="Move through the steps"
            items={[
              {
                id: "back",
                label: "Back",
                onSelect: () => setActive((s) => Math.max(0, s - 1)),
                disabled: active === 0,
              },
              {
                id: "next",
                label: "Next",
                onSelect: () => setActive((s) => Math.min(steps.length, s + 1)),
                disabled: active === steps.length,
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}

function AppBarDemo({ large }: { large?: boolean }) {
  /* Scrolled inside the frame, not the page: the bar has to react to its own
     scroll container, which is exactly what `scrollRef` is for. */
  const screen = React.useRef<HTMLDivElement>(null);
  return (
    <DeviceMockup kind="phone" time="9:41">
      <div ref={screen} className="h-full overflow-auto">
        <AppBar
          title="Notifications"
          revealTitleOnScroll={large}
          scrollRef={screen}
          leading={
            <IconButton label="Back" className="size-9">
              <ArrowLeft />
            </IconButton>
          }
          actions={
            <IconButton label="More" className="size-9">
              <Ellipsis />
            </IconButton>
          }
        />
        <div className="px-4 pb-6">
          {large && (
            <Text variant="display" display className="pb-2">
              Notifications
            </Text>
          )}
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="py-3">
              <p className="text-body text-text">Build #{412 - i} finished</p>
              <p className="text-caption text-text-2">
                {i === 0 ? "just now" : `${i * 7} minutes ago`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DeviceMockup>
  );
}

function BottomNavDemo({ all }: { all?: boolean }) {
  const [tab, setTab] = React.useState("home");
  const items = all
    ? [
        { id: "home", label: "Home", icon: <Home /> },
        { id: "search", label: "Search", icon: <Search /> },
        { id: "you", label: "You", icon: <Users /> },
      ]
    : [
        { id: "home", label: "Home", icon: <Home /> },
        { id: "inbox", label: "Inbox", icon: <Inbox />, badge: 4 },
        { id: "explore", label: "Explore", icon: <Compass /> },
        { id: "alerts", label: "Alerts", icon: <Bell /> },
        { id: "you", label: "You", icon: <Users /> },
      ];

  return (
    <div className="w-full max-w-sm">
      <BottomNav
        items={items}
        value={tab}
        onChange={setTab}
        showAllLabels={all}
        className="rounded-overlay bg-bg-2"
      />
      <p className="mt-3 px-1 text-caption text-text-2">
        Showing {items.find((i) => i.id === tab)?.label}
      </p>
    </div>
  );
}

function SpeedDialDemo({ direction }: { direction: "up" | "right" }) {
  const [last, setLast] = React.useState<string | null>(null);
  const actions = [
    { id: "doc", label: "Document", icon: <FileText />, onSelect: () => setLast("Document") },
    { id: "image", label: "Image", icon: <ImageIcon />, onSelect: () => setLast("Image") },
    { id: "clip", label: "Recording", icon: <Video />, onSelect: () => setLast("Recording") },
  ];
  return (
    <div className="flex min-h-44 flex-col items-start justify-end gap-3">
      <SpeedDial actions={actions} direction={direction} label="Create" />
      <p className="text-caption text-text-2">
        {last ? `Started: ${last}` : "Nothing started yet"}
      </p>
    </div>
  );
}

function RatingDemo() {
  const [score, setScore] = React.useState(3);
  return (
    <div className="flex flex-col gap-3">
      <Rating value={score} onChange={setScore} label="Rate this component" />
      <p className="px-1 text-caption text-text-2">
        {score === 0 ? "No rating" : `${score} of 5`}
      </p>
    </div>
  );
}

const TRANSFER_ITEMS = [
  { id: "read", label: "Read issues" },
  { id: "write", label: "Write issues" },
  { id: "deploy", label: "Deploy" },
  { id: "billing", label: "Manage billing" },
  { id: "admin", label: "Admin" },
];

export const controlsNavDemos: DemoSet = {
  "minimilist-ai-prompt": {
    default: (
      <AiPrompt
        hints={[
          {
            id: "project",
            icon: <Box />,
            title: "Create a new project",
            detail: "Turn an idea into a well-scoped project",
          },
          {
            id: "research",
            icon: <Search />,
            title: "Research a topic",
            detail: "Read across the issue backlog and report back",
          },
          {
            id: "team",
            icon: <Users />,
            title: "Set up a new team",
            detail: "Match the way your organisation actually works",
          },
          {
            id: "ideas",
            icon: <Lightbulb />,
            title: "Unblock a decision",
            detail: "Lay out the options and the trade-offs",
          },
        ]}
      />
    ),
    options: (
      <AiPrompt
        placeholders={["Ask about this project..."]}
        options={[
          {
            id: "skill",
            label: "Skills",
            icon: <Wand />,
            items: ["Search", "Summarise", "Draft", "Review"],
          },
          {
            id: "context",
            label: "Context",
            icon: <AtSign />,
            items: ["This page", "Current sprint", "Whole workspace"],
          },
          {
            id: "model",
            label: "Fast",
            icon: <Rocket />,
            items: ["Fast", "Balanced", "Thorough"],
          },
        ]}
        hints={[]}
      />
    ),
    bare: (
      <AiPrompt
        options={[]}
        hints={[]}
        placeholders={[
          "Ask anything...",
          "Draft a release note...",
          "Summarise this week...",
          "Find the regression...",
        ]}
      />
    ),
  },

  "minimilist-button-group": {
    horizontal: (
      <ButtonGroup
        label="Issue actions"
        items={[
          { id: "edit", label: "Edit" },
          { id: "duplicate", label: "Duplicate" },
          { id: "archive", label: "Archive" },
        ]}
      />
    ),
    vertical: (
      <ButtonGroup
        orientation="vertical"
        label="Issue actions"
        items={[
          { id: "edit", label: "Edit" },
          { id: "duplicate", label: "Duplicate" },
          { id: "archive", label: "Archive" },
          { id: "delete", label: "Delete", disabled: true },
        ]}
      />
    ),
    icons: (
      <ButtonGroup
        label="Row actions"
        items={[
          { id: "edit", label: "Edit", icon: <Pencil /> },
          { id: "copy", label: "Copy", icon: <Copy /> },
          { id: "delete", label: "Delete", icon: <Trash2 /> },
        ]}
      />
    ),
  },

  "minimilist-speed-dial": {
    up: <SpeedDialDemo direction="up" />,
    right: <SpeedDialDemo direction="right" />,
  },

  "minimilist-rating": {
    interactive: <RatingDemo />,
    readonly: (
      <div className="flex items-center gap-3">
        <Rating value={4} readOnly label="Average rating" />
        <span className="text-caption text-text-2">from 128 reviews</span>
      </div>
    ),
    value: <Rating defaultValue={3} showValue label="Quality" />,
  },

  "minimilist-transfer-list": {
    default: <TransferList items={TRANSFER_ITEMS} sourceLabel="Available" targetLabel="Granted" />,
    preselected: (
      <TransferList
        items={TRANSFER_ITEMS}
        defaultSelected={["read", "write"]}
        sourceLabel="Available"
        targetLabel="Granted"
      />
    ),
  },

  "minimilist-pagination": {
    default: <PaginationDemo count={6} />,
    elided: <PaginationDemo count={42} start={12} />,
  },

  "minimilist-bottom-nav": {
    default: <BottomNavDemo />,
    "all-labels": <BottomNavDemo all />,
  },

  "minimilist-app-bar": {
    condense: <AppBarDemo />,
    "large-title": <AppBarDemo large />,
  },

  "minimilist-menubar": {
    default: (
      <Menubar
        sections={[
          {
            id: "file",
            label: "File",
            content: (
              <>
                <MenuLabel>File</MenuLabel>
                <MenuItem icon={<FileText />}>New document</MenuItem>
                <MenuItem icon={<Copy />}>Duplicate</MenuItem>
                <MenuItem icon={<Trash2 />}>Move to trash</MenuItem>
              </>
            ),
          },
          {
            id: "edit",
            label: "Edit",
            content: (
              <>
                <MenuLabel>Edit</MenuLabel>
                <MenuItem icon={<Pencil />}>Rename</MenuItem>
                <MenuItem icon={<Copy />}>Copy</MenuItem>
              </>
            ),
          },
          {
            id: "view",
            label: "View",
            content: (
              <>
                <MenuLabel>View</MenuLabel>
                <MenuItem icon={<ImageIcon />}>Gallery</MenuItem>
                <MenuItem icon={<Inbox />}>List</MenuItem>
              </>
            ),
          },
        ]}
      />
    ),
  },

  "minimilist-progress-steps": {
    horizontal: <StepsDemo orientation="horizontal" />,
    vertical: <StepsDemo orientation="vertical" />,
    complete: <StepsDemo orientation="horizontal" fixed={4} />,
  },
};
