"use client";

import * as React from "react";
import {
  ArrowRight,
  Bell,
  Box,
  CalendarPlus,
  CircleCheck,
  CircleDot,
  CircleX,
  GitBranch,
  GitMerge,
  Hash,
  Inbox,
  Palette,
  Plus,
  Rocket,
  Sparkles,
  Tag,
  TriangleAlert,
  UserRoundPlus,
  UsersRound,
  Wrench,
} from "lucide-react";
import {
  Alert,
  AlertRow,
  AlertStack,
  type AlertTone,
} from "@/registry/minflow/ui/alert";
import { Badge } from "@/registry/minflow/ui/badge";
import { Button } from "@/registry/minflow/ui/button";
import { Carousel } from "@/registry/minflow/ui/carousel";
import { ChatWindow } from "@/registry/minflow/ui/chat";
import { Chip } from "@/registry/minflow/ui/chip";
import { Composer } from "@/registry/minflow/ui/composer";
import { Dialog } from "@/registry/minflow/ui/dialog";
import { FullscreenLoader } from "@/registry/minflow/ui/fullscreen-loader";
import { IconButton } from "@/registry/minflow/ui/icon-button";
import { Input } from "@/registry/minflow/ui/input";
import { Lightbox } from "@/registry/minflow/ui/lightbox";
import { MenuItem } from "@/registry/minflow/ui/menu";
import { Popover, PopupTip } from "@/registry/minflow/ui/popover";
import { ProgressBar, Radial } from "@/registry/minflow/ui/progress";
import { Property, PropertyList } from "@/registry/minflow/ui/property-list";
import { ScrollArea } from "@/registry/minflow/ui/scroll-area";
import { Sheet } from "@/registry/minflow/ui/sheet";
import { Skeleton } from "@/registry/minflow/ui/skeleton";
import { Spinner } from "@/registry/minflow/ui/spinner";
import { Timeline, TimelineItem } from "@/registry/minflow/ui/timeline";
import { toast } from "@/registry/minflow/ui/toast";
import { Tooltip } from "@/registry/minflow/ui/tooltip";
import type { DemoSet } from "@/components/site/demos/types";

/* Shared fixtures ------------------------------------------------------- */

const ALERT_COPY: Record<AlertTone, { title: string; detail: string }> = {
  info: {
    title: "A new token set is available",
    detail: "Graphite picked up two surface steps since your last sync.",
  },
  ok: {
    title: "Preview deployed",
    detail: "Build 482 is live and every visual check passed.",
  },
  warn: {
    title: "Two components drifted from the token layer",
    detail: "Carousel and matrix pad still carry a literal colour value.",
  },
  err: {
    title: "Registry publish failed",
    detail: "The version in package.json is already on the registry.",
  },
};

const ALL_TONES: AlertTone[] = ["info", "ok", "warn", "err"];

const LOADER_STEPS = [
  "Resolving workspace",
  "Fetching components",
  "Applying theme tokens",
  "Wiring motion presets",
  "Warming the preview",
  "Ready",
];

const RESTORE_STEPS = [
  "Reading the snapshot",
  "Rebuilding the index",
  "Replaying edits",
  "Done",
];

const SCROLL_ROWS = Array.from({ length: 14 }, (_, i) => `Component ${i + 1}`);

const STATES = ["Draft", "In review", "Shipped", "Archived"];
const PRIORITIES = ["None", "Low", "Medium", "High", "Urgent"];

/* Gradient artwork, tokens only. */
function gradient(from: string, to: string) {
  return (
    <div
      className="h-full w-full"
      style={{ background: `linear-gradient(135deg, var(${from}), var(${to}) 70%)` }}
    />
  );
}

function mediaPane(from: string, to: string, caption: string) {
  return (
    <div className="relative h-36 w-full">
      {gradient(from, to)}
      <span className="absolute bottom-3 left-3 text-caption font-medium text-bg">
        {caption}
      </span>
    </div>
  );
}

function contentPane(title: string, body: string) {
  return (
    <div className="flex h-36 w-full flex-col justify-center gap-1.5 bg-bg-2 px-6">
      <p className="text-section font-medium text-text">{title}</p>
      <p className="text-body text-text-2">{body}</p>
    </div>
  );
}

function ScrollList({ smooth }: { smooth: boolean }) {
  return (
    <ScrollArea smooth={smooth} className="h-40 w-56">
      <div className="flex flex-col">
        {SCROLL_ROWS.map((row) => (
          <span
            key={row}
            className="flex h-9 items-center rounded-control px-2 text-body text-text-2 transition-colors duration-150 hover:bg-hover hover:text-text"
          >
            {row}
          </span>
        ))}
      </div>
    </ScrollArea>
  );
}

/* Stateful demos --------------------------------------------------------- */

function AlertStackDemo() {
  const [shown, setShown] = React.useState<AlertTone[]>(ALL_TONES);

  return (
    <div className="w-full">
      <AlertStack>
        {shown.map((tone) => (
          <AlertRow key={tone}>
            <Alert
              tone={tone}
              title={ALERT_COPY[tone].title}
              onDismiss={() => setShown((s) => s.filter((t) => t !== tone))}
            >
              {ALERT_COPY[tone].detail}
            </Alert>
          </AlertRow>
        ))}
      </AlertStack>
      {shown.length < ALL_TONES.length && (
        <Button className="mt-6 -ml-2.5" onClick={() => setShown(ALL_TONES)}>
          Restore the stack
        </Button>
      )}
    </div>
  );
}

function ProgressAdvanceDemo() {
  const [value, setValue] = React.useState(20);

  return (
    <div className="flex w-full max-w-72 flex-col gap-6">
      <ProgressBar value={value} label="Migration" className="w-full" />
      <div className="flex items-center gap-4">
        <Radial value={value} label="Migration" />
        <Button onClick={() => setValue((v) => Math.min(100, v + 20))}>
          Advance
        </Button>
        <Button onClick={() => setValue(20)}>Reset</Button>
      </div>
    </div>
  );
}

function BadgeCountDemo() {
  const [count, setCount] = React.useState(3);

  return (
    <div className="flex items-center gap-4">
      <Badge count={count}>
        <IconButton label="Notifications">
          <Bell />
        </IconButton>
      </Badge>
      <Button size="sm" onClick={() => setCount((c) => c + 1)}>
        Ping
      </Button>
      <Button size="sm" onClick={() => setCount(0)}>
        Clear
      </Button>
    </div>
  );
}

function LoaderDemo({ steps, title }: { steps: string[]; title?: string }) {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(
      () => {
        if (current >= steps.length) {
          setOpen(false);
        } else {
          setCurrent((c) => c + 1);
        }
      },
      current >= steps.length ? 1100 : 1250
    );
    return () => window.clearTimeout(timer);
  }, [open, current, steps.length]);

  return (
    <>
      <Button
        onClick={() => {
          setCurrent(0);
          setOpen(true);
        }}
      >
        Click to see in action
      </Button>
      <FullscreenLoader
        open={open}
        steps={steps}
        current={current}
        title={title}
      />
    </>
  );
}

function ConfirmDialogDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Click to see in action</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Archive project?"
      >
        <p>
          minflow keeps archives for 30 days, then removes them. Members lose
          access immediately.
        </p>
        <div className="mt-5 flex items-center justify-end gap-4">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            accent
            onClick={() => {
              setOpen(false);
              toast("Project archived", { tone: "ok" });
            }}
          >
            Archive
          </Button>
        </div>
      </Dialog>
    </>
  );
}

function FormDialogDemo() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");

  return (
    <>
      <Button onClick={() => setOpen(true)}>Click to see in action</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="New environment"
      >
        <p>Environments inherit the project tokens and can be renamed later.</p>
        <div className="mt-4">
          <Input
            variant="boxed"
            placeholder="Environment name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="mt-5 flex items-center justify-end gap-4">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            accent
            disabled={!name.trim()}
            onClick={() => {
              toast(`Created ${name.trim()}`, { tone: "ok" });
              setName("");
              setOpen(false);
            }}
          >
            Create
          </Button>
        </div>
      </Dialog>
    </>
  );
}

function MessageDialogDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Click to see in action</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="What changed in 2.0"
      >
        <p>
          Colour moved to oklch, motion presets became data, and the registry
          now ships one file per component.
        </p>
        <div className="mt-5 flex justify-end">
          <Button onClick={() => setOpen(false)}>Got it</Button>
        </div>
      </Dialog>
    </>
  );
}

function SheetDemo({
  side,
  title,
  className,
  children,
}: {
  side: "right" | "bottom";
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Click to see in action</Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        side={side}
        title={title}
        className={className}
      >
        {children}
      </Sheet>
    </>
  );
}

function ControlledPopoverDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-4">
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger={<Button variant="ghost">Filters</Button>}
      >
        <p className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
          Filters
        </p>
        <div className="mt-2 flex flex-col items-start gap-1">
          <Button size="sm" onClick={() => setOpen(false)}>
            Assigned to me
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Updated this week
          </Button>
        </div>
      </Popover>
      <Button onClick={() => setOpen((v) => !v)}>
        {open ? "Close from outside" : "Open from outside"}
      </Button>
    </div>
  );
}

function PropertyMenusDemo() {
  const [state, setState] = React.useState("Draft");
  const [priority, setPriority] = React.useState("None");

  return (
    <PropertyList title="Details">
      <Property
        label="State"
        icon={<CircleDot />}
        menu={STATES.map((s) => (
          <MenuItem key={s} onSelect={() => setState(s)}>
            {s}
          </MenuItem>
        ))}
      >
        {state}
      </Property>
      <Property
        label="Priority"
        icon={<Sparkles />}
        muted={priority === "None"}
        menu={PRIORITIES.map((p) => (
          <MenuItem key={p} onSelect={() => setPriority(p)}>
            {p}
          </MenuItem>
        ))}
      >
        {priority}
      </Property>
      <Property label="Team">
        <Chip tone="id1">
          <Box aria-hidden />
          atlas
        </Chip>
      </Property>
    </PropertyList>
  );
}

function InlineComposerDemo() {
  const [open, setOpen] = React.useState(false);

  if (!open) {
    return (
      <Button className="-ml-2.5" onClick={() => setOpen(true)}>
        <Plus />
        New task
      </Button>
    );
  }

  return (
    <Composer
      onCancel={() => setOpen(false)}
      onCreate={(title) => {
        toast(`Created ${title}`, { tone: "ok" });
        setOpen(false);
      }}
    />
  );
}

function ChatDemo({
  title,
  context,
  appName,
}: {
  title?: string;
  context?: string;
  appName?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Click to see in action</Button>
      <ChatWindow
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        context={context}
        appName={appName}
      />
    </>
  );
}

/* Registry --------------------------------------------------------------- */

export const feedbackOverlaysDisplayDemos: DemoSet = {
  /* Feedback ------------------------------------------------------------- */
  "minimilist-alert": {
    tones: (
      <div className="flex w-full flex-col gap-6">
        {ALL_TONES.map((tone) => (
          <Alert key={tone} tone={tone} title={ALERT_COPY[tone].title}>
            {ALERT_COPY[tone].detail}
          </Alert>
        ))}
      </div>
    ),
    action: (
      <Alert
        tone="err"
        title={ALERT_COPY.err.title}
        action={<Button accent>Retry publish</Button>}
      >
        {ALERT_COPY.err.detail}
      </Alert>
    ),
    stack: <AlertStackDemo />,
    "title-only": (
      <div className="flex w-full flex-col gap-6">
        <Alert tone="ok" title="Every visual check passed" />
        <Alert tone="info" title="Sync is paused while you are offline" />
      </div>
    ),
  },

  "minimilist-toast": {
    default: <Button onClick={() => toast("Draft saved")}>Save draft</Button>,
    tones: (
      <>
        <Button onClick={() => toast("Preview deployed", { tone: "ok" })}>
          Deploy
        </Button>
        <Button onClick={() => toast("Sync failed", { tone: "err" })}>
          Break sync
        </Button>
      </>
    ),
    stack: (
      <Button
        onClick={() => {
          toast("Renamed 3 files");
          window.setTimeout(() => toast("Moved 3 files"), 400);
          window.setTimeout(
            () => toast("Re-indexed the project", { tone: "ok" }),
            800
          );
        }}
      >
        Run a batch
      </Button>
    ),
    duration: (
      <>
        <Button onClick={() => toast("Copied", { duration: 1500 })}>
          Short, 1.5s
        </Button>
        <Button
          onClick={() =>
            toast("Export queued, this usually takes about a minute", {
              duration: 9000,
            })
          }
        >
          Long, 9s
        </Button>
      </>
    ),
  },

  "minimilist-spinner": {
    sizes: (
      <>
        <Spinner size={16} />
        <Spinner size={20} />
        <Spinner size={24} />
      </>
    ),
    inline: (
      <span className="flex items-center gap-2 text-body text-text-2">
        <Spinner size={16} />
        Resolving workspace
      </span>
    ),
    label: (
      <div className="flex w-full max-w-72 flex-col gap-3">
        <span className="flex items-center gap-2 text-body text-text-2">
          <Spinner size={16} label="Loading components" />
          Components
        </span>
        <span className="flex items-center gap-2 text-body text-text-2">
          <Spinner size={16} label="Loading tokens" />
          Tokens
        </span>
      </div>
    ),
  },

  "minimilist-progress": {
    bar: (
      <div className="w-full max-w-72">
        <ProgressBar value={62} label="Import" className="w-full" />
      </div>
    ),
    radial: <Radial value={62} label="Coverage" />,
    advancing: <ProgressAdvanceDemo />,
    sizes: (
      <>
        <Radial value={35} size={40} label="Storage used" />
        <Radial value={62} label="Coverage" />
        <Radial value={88} size={72} label="Uptime" />
      </>
    ),
  },

  "minimilist-skeleton": {
    lines: (
      <div className="flex w-full max-w-72 flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    ),
    row: (
      <div className="flex w-full max-w-72 flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    ),
    media: (
      <div className="flex w-full max-w-60 flex-col gap-3">
        <Skeleton className="h-28 w-full rounded-overlay" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    ),
  },

  "minimilist-badge": {
    default: (
      <Badge count={3}>
        <IconButton label="Notifications">
          <Bell />
        </IconButton>
      </Badge>
    ),
    overflow: (
      <Badge count={128}>
        <IconButton label="Inbox">
          <Inbox />
        </IconButton>
      </Badge>
    ),
    live: <BadgeCountDemo />,
  },

  "minimilist-fullscreen-loader": {
    default: <LoaderDemo steps={LOADER_STEPS} />,
    titled: <LoaderDemo steps={RESTORE_STEPS} title="Restoring your session" />,
  },

  /* Overlays ------------------------------------------------------------- */
  "minimilist-dialog": {
    confirm: <ConfirmDialogDemo />,
    form: <FormDialogDemo />,
    message: <MessageDialogDemo />,
  },

  "minimilist-sheet": {
    side: (
      <SheetDemo side="right" title="Details">
        <p>
          Everything secondary lives one slide away: metadata, history, quiet
          actions. The page behind stays where you left it.
        </p>
      </SheetDemo>
    ),
    bottom: (
      <SheetDemo side="bottom" title="Quick actions">
        <p>
          On small screens, quick actions gather here, one thumb-reach away.
        </p>
      </SheetDemo>
    ),
    wide: (
      <SheetDemo side="right" title="Build 482" className="w-[28rem]">
        <p>
          A wider panel for detail that genuinely needs two columns, such as a
          diff or a record with a preview beside it.
        </p>
      </SheetDemo>
    ),
  },

  "minimilist-popover": {
    default: (
      <Popover trigger={<Button variant="ghost">Share</Button>}>
        <p className="text-caption font-medium uppercase tracking-[0.08em] text-text-2">
          Share
        </p>
        <div className="mt-2 flex flex-col items-start gap-1">
          <Button size="sm" onClick={() => toast("Link copied")}>
            Copy link
          </Button>
          <Button size="sm" onClick={() => toast("Invite drafted")}>
            Invite by email
          </Button>
        </div>
      </Popover>
    ),
    placement: (
      <>
        <Popover
          side="top"
          align="start"
          trigger={<Button variant="ghost">Above, start</Button>}
        >
          <p className="text-caption text-text-2">
            Opens upward from the leading edge.
          </p>
        </Popover>
        <Popover
          side="bottom"
          align="end"
          trigger={<Button variant="ghost">Below, end</Button>}
        >
          <p className="text-caption text-text-2">
            Opens downward from the trailing edge.
          </p>
        </Popover>
      </>
    ),
    tip: (
      <span className="flex items-center gap-1 text-body text-text-2">
        Sync
        <PopupTip label="About sync">
          Rows sync automatically. Pausing sync keeps local edits until you
          resume.
        </PopupTip>
      </span>
    ),
    controlled: <ControlledPopoverDemo />,
  },

  "minimilist-tooltip": {
    default: (
      <Tooltip label="Saves immediately">
        <Button variant="ghost">Hover me</Button>
      </Tooltip>
    ),
    side: (
      <Tooltip label="Opens the changelog" side="bottom">
        <Button variant="ghost">Release notes</Button>
      </Tooltip>
    ),
    truncation: (
      <Tooltip label="deploy-preview-482-graphite.minflow.design">
        <span className="block max-w-40 truncate text-body text-text-2">
          deploy-preview-482-graphite.minflow.design
        </span>
      </Tooltip>
    ),
  },

  "minimilist-lightbox": {
    default: (
      <>
        <Lightbox artwork={gradient("--id-1", "--id-3")} label="Expand artwork" />
        <p className="text-body text-text-2">
          Click the artwork to see in action.
        </p>
      </>
    ),
    grid: (
      <>
        <div className="flex flex-wrap gap-3">
          <Lightbox
            artwork={gradient("--id-1", "--id-3")}
            label="Expand tokens artwork"
          />
          <Lightbox
            artwork={gradient("--id-2", "--id-1")}
            label="Expand motion artwork"
          />
          <Lightbox
            artwork={gradient("--id-3", "--id-2")}
            label="Expand registry artwork"
          />
        </div>
        <p className="text-body text-text-2">
          Click any thumbnail to see in action.
        </p>
      </>
    ),
    thumb: (
      <>
        <Lightbox
          artwork={gradient("--id-3", "--id-1")}
          label="Expand cover"
          thumbClassName="h-16 w-56"
        />
        <p className="text-body text-text-2">
          Click the thumbnail to see in action.
        </p>
      </>
    ),
  },

  /* Display -------------------------------------------------------------- */
  "minimilist-chip": {
    status: (
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="ok">
          <CircleCheck aria-hidden />
          Deployed
        </Chip>
        <Chip tone="warn">
          <TriangleAlert aria-hidden />
          Degraded
        </Chip>
        <Chip tone="err">
          <CircleX aria-hidden />
          Failed
        </Chip>
      </div>
    ),
    identity: (
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="id1">
          <Box aria-hidden />
          atlas
        </Chip>
        <Chip tone="id2">Design</Chip>
        <Chip tone="id3">Research</Chip>
      </div>
    ),
    outline: (
      <div className="flex flex-wrap items-center gap-2">
        <Chip variant="outline">Draft</Chip>
        <Chip variant="outline" tone="ok">
          Passing
        </Chip>
        <Chip variant="outline" tone="id1">
          atlas
        </Chip>
      </div>
    ),
    row: (
      <div className="flex w-full max-w-72 flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-body text-text">atlas</span>
          <Chip tone="ok">
            <CircleCheck aria-hidden />
            Deployed
          </Chip>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-body text-text">graphite</span>
          <Chip tone="warn">
            <TriangleAlert aria-hidden />
            Degraded
          </Chip>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-body text-text">registry</span>
          <Chip tone="err">
            <CircleX aria-hidden />
            Failed
          </Chip>
        </div>
      </div>
    ),
  },

  "minimilist-carousel": {
    default: (
      <Carousel
        items={[
          mediaPane("--id-1", "--id-3", "Tokens"),
          mediaPane("--id-2", "--id-1", "Motion"),
          mediaPane("--id-3", "--id-2", "Registry"),
        ]}
      />
    ),
    content: (
      <Carousel
        items={[
          contentPane(
            "One palette",
            "Every colour resolves through a token, so both themes stay in step."
          ),
          contentPane(
            "One motion set",
            "Durations and eases live as data, not as numbers scattered through components."
          ),
          contentPane(
            "One registry",
            "Each component ships as a single file you own after install."
          ),
        ]}
      />
    ),
  },

  "minimilist-scroll-area": {
    default: <ScrollList smooth />,
    plain: <ScrollList smooth={false} />,
  },

  "minimilist-timeline": {
    default: (
      <Timeline className="w-full max-w-96">
        <TimelineItem icon={<Rocket />} title="Deployed to production" time="2h">
          Build 118, no regressions.
        </TimelineItem>
        <TimelineItem icon={<Wrench />} title="Build passed" time="3h" />
        <TimelineItem icon={<GitMerge />} title="PR 42 merged" time="1d">
          Token layer and motion presets.
        </TimelineItem>
        <TimelineItem icon={<GitBranch />} title="Branch created" time="2d" />
        <TimelineItem icon={<Palette />} title="Tokens defined" time="2d" />
        <TimelineItem icon={<Sparkles />} title="Project created" time="3d" />
      </Timeline>
    ),
    minimal: (
      <Timeline className="w-full max-w-72">
        <TimelineItem title="Invited to the workspace" time="Mar 4" />
        <TimelineItem title="First component published" time="Mar 9" />
        <TimelineItem title="Joined the design review" time="Mar 21" />
        <TimelineItem title="Promoted to maintainer" time="Apr 2" />
      </Timeline>
    ),
  },

  "minimilist-property-list": {
    menus: <PropertyMenusDemo />,
    unset: (
      <PropertyList title="Details" onAdd={() => toast("Add a detail")}>
        <Property
          label="Owner"
          icon={<UserRoundPlus />}
          muted
          onClick={() => toast("Pick an owner")}
        >
          Add owner
        </Property>
        <Property
          label="Reviewers"
          icon={<UsersRound />}
          muted
          onClick={() => toast("Invite reviewers")}
        >
          Add reviewers
        </Property>
        <Property
          label="Window"
          icon={<CalendarPlus />}
          muted
          onClick={() => toast("Set a window")}
        >
          Start
          <ArrowRight aria-hidden />
          Ship
        </Property>
        <Property
          label="Tags"
          icon={<Tag />}
          muted
          onClick={() => toast("Add a tag")}
        >
          Add tag
        </Property>
      </PropertyList>
    ),
    static: (
      <PropertyList title="Deployment">
        <Property label="Status">
          <Chip tone="ok">
            <CircleCheck aria-hidden />
            Deployed
          </Chip>
        </Property>
        <Property label="Team">
          <Chip tone="id1">
            <Box aria-hidden />
            atlas
          </Chip>
        </Property>
        <Property label="Region" icon={<Hash />}>
          eu-west
        </Property>
        <Property label="Build">482</Property>
      </PropertyList>
    ),
  },

  /* Patterns ------------------------------------------------------------- */
  "minimilist-composer": {
    default: (
      <Composer onCreate={(title) => toast(`Created ${title}`, { tone: "ok" })} />
    ),
    suggestions: (
      <Composer
        team="ATLAS"
        suggestions={[
          "Refine motion tokens",
          "Audit dark theme contrast",
          "Document the registry",
        ]}
        onCreate={(title) => toast(`Created ${title}`, { tone: "ok" })}
      />
    ),
    inline: <InlineComposerDemo />,
  },

  "minimilist-chat": {
    default: <ChatDemo />,
    context: (
      <ChatDemo title="Atlas copilot" context="atlas / tokens" appName="atlas" />
    ),
  },
};
