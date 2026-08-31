"use client";

import * as React from "react";
import {
  Activity,
  Archive,
  Bell,
  BookOpen,
  Box,
  Building2,
  Copy,
  CreditCard,
  Droplet,
  Ellipsis,
  FileCode,
  FileDown,
  FileImage,
  FileText,
  Folder,
  Gauge,
  KeyRound,
  Layers,
  Palette,
  Pencil,
  Settings,
  Share2,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { Accordion } from "@/registry/minflow/ui/accordion";
import { Breadcrumbs } from "@/registry/minflow/ui/breadcrumbs";
import { Button } from "@/registry/minflow/ui/button";
import { Calendar, DatePicker } from "@/registry/minflow/ui/calendar";
import { ContextMenu } from "@/registry/minflow/ui/context-menu";
import { IconButton } from "@/registry/minflow/ui/icon-button";
import { Link } from "@/registry/minflow/ui/link";
import { MatrixPad } from "@/registry/minflow/ui/matrix-pad";
import { Menu, MenuItem, MenuLabel, Submenu } from "@/registry/minflow/ui/menu";
import { PieMenu } from "@/registry/minflow/ui/pie-menu";
import { Tabs } from "@/registry/minflow/ui/tabs";
import { toast } from "@/registry/minflow/ui/toast";
import { Tree } from "@/registry/minflow/ui/tree";
import { WheelPicker } from "@/registry/minflow/ui/wheel-picker";
import type { DemoSet } from "@/components/site/demos/types";

/* Computed lazily inside state so the server and the client agree on the day. */
function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ["00", "15", "30", "45"];
const CADENCES = ["Hourly", "Daily", "Weekly", "Monthly", "Quarterly"];

/* Pickers ----------------------------------------------------------------- */

function CalendarDemo({ startsIn }: { startsIn?: number }) {
  const [date, setDate] = React.useState<Date | null>(() =>
    startsIn === undefined ? null : daysFromNow(startsIn)
  );
  return <Calendar value={date} onChange={setDate} />;
}

function CalendarReadout() {
  const [date, setDate] = React.useState<Date | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <Calendar value={date} onChange={setDate} />
      <span className="text-caption text-text-2">
        {date
          ? new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(date)
          : "No day chosen yet."}
      </span>
    </div>
  );
}

function DatePickerPreset() {
  const [preset] = React.useState(() => daysFromNow(7));
  return <DatePicker defaultValue={preset} />;
}

function WheelControlled() {
  const [cadence, setCadence] = React.useState("Weekly");
  return (
    <div className="flex items-center gap-5">
      <WheelPicker
        options={CADENCES}
        value={cadence}
        onValueChange={setCadence}
        label="Cadence"
        className="w-32"
      />
      <span className="text-caption text-text-2">
        Usage report sent {cadence.toLowerCase()}.
      </span>
    </div>
  );
}

function MatrixControlled() {
  const [shadow, setShadow] = React.useState({ x: 30, y: 65 });
  return (
    <div className="flex items-center gap-5">
      <MatrixPad
        value={shadow}
        onValueChange={setShadow}
        xLabel="blur"
        yLabel="strength"
      />
      <span
        aria-hidden
        className="size-12 rounded-control bg-fg"
        style={{
          filter: `blur(${shadow.x / 20}px)`,
          opacity: 0.25 + shadow.y / 134,
        }}
      />
    </div>
  );
}

/* Menus ------------------------------------------------------------------- */

const FILES = ["brief.md", "tokens.css", "motion.ts"];

function ContextRows() {
  return (
    <div className="w-full max-w-72">
      {FILES.map((name) => (
        <ContextMenu
          key={name}
          content={
            <>
              <MenuItem
                icon={<Pencil />}
                onSelect={() => toast(`Renaming ${name}`)}
              >
                Rename
              </MenuItem>
              <MenuItem icon={<Copy />} onSelect={() => toast(`Copied ${name}`)}>
                Copy
              </MenuItem>
              <MenuItem
                icon={<Trash2 />}
                onSelect={() => toast(`Deleted ${name}`, { tone: "err" })}
              >
                Delete
              </MenuItem>
            </>
          }
        >
          <div className="flex h-9 items-center gap-2 rounded-control px-2 text-body text-text-2 transition-colors duration-150 hover:bg-hover hover:text-text [&_svg]:size-4 [&_svg]:text-fg-2">
            <FileText />
            {name}
          </div>
        </ContextMenu>
      ))}
    </div>
  );
}

/* Navigation -------------------------------------------------------------- */

const PANELS = [
  {
    value: "overview",
    label: "Overview",
    content: "Everything healthy. Last deploy 2h ago.",
  },
  {
    value: "activity",
    label: "Activity",
    content: "14 events this week, quietest on Tuesday.",
  },
  {
    value: "settings",
    label: "Settings",
    content: "Tokens, members, and integrations live here.",
  },
];

function nodeActions(name: string) {
  return (
    <>
      <MenuItem icon={<Pencil />} onSelect={() => toast(`Renaming ${name}`)}>
        Rename
      </MenuItem>
      <MenuItem icon={<Copy />} onSelect={() => toast(`Duplicated ${name}`)}>
        Duplicate
      </MenuItem>
      <MenuItem
        icon={<Trash2 />}
        onSelect={() => toast(`Deleted ${name}`, { tone: "err" })}
      >
        Delete
      </MenuItem>
    </>
  );
}

const PROJECT_TREE = [
  {
    id: "atlas",
    label: "atlas",
    icon: <Box />,
    children: [
      {
        id: "tokens",
        label: "tokens",
        icon: <Palette />,
        children: [
          { id: "colors", label: "colors", icon: <Droplet /> },
          { id: "motion", label: "motion", icon: <Gauge /> },
        ],
      },
      {
        id: "components",
        label: "components",
        icon: <Layers />,
        children: [{ id: "button", label: "button", icon: <FileCode /> }],
      },
    ],
  },
  {
    id: "docs",
    label: "docs",
    icon: <BookOpen />,
    children: [
      { id: "guide", label: "getting started", icon: <FileText /> },
      { id: "theming", label: "theming", icon: <FileText /> },
    ],
  },
];

export const pickersMenusNavDemos: DemoSet = {
  "minimilist-calendar": {
    default: <CalendarDemo />,
    selected: <CalendarDemo startsIn={3} />,
    readout: <CalendarReadout />,
  },

  "minimilist-date-picker": {
    default: <DatePicker />,
    preset: <DatePickerPreset />,
    row: (
      <div className="flex w-full max-w-72 items-center justify-between gap-4">
        <span className="text-body text-text">Due date</span>
        <DatePicker placeholder="Not set" className="w-36" />
      </div>
    ),
  },

  "minimilist-wheel-picker": {
    default: (
      <WheelPicker options={MONTHS} defaultValue="August" label="Month" />
    ),
    group: (
      <div className="flex items-center gap-1">
        <WheelPicker
          options={HOURS}
          defaultValue="9"
          label="Hour"
          className="w-16"
        />
        <WheelPicker
          options={MINUTES}
          defaultValue="30"
          label="Minute"
          className="w-16"
        />
        <WheelPicker
          options={["AM", "PM"]}
          defaultValue="AM"
          label="Meridiem"
          className="w-16"
        />
      </div>
    ),
    controlled: <WheelControlled />,
  },

  "minimilist-matrix-pad": {
    default: <MatrixPad />,
    labels: (
      <MatrixPad
        defaultValue={{ x: 35, y: 70 }}
        xLabel="attack"
        yLabel="decay"
      />
    ),
    controlled: <MatrixControlled />,
  },

  "minimilist-menu": {
    default: (
      <Menu trigger={<Button variant="ghost">Actions</Button>}>
        <MenuItem icon={<Copy />} onSelect={() => toast("Duplicated")}>
          Duplicate
        </MenuItem>
        <MenuItem icon={<Pencil />} onSelect={() => toast("Renaming")}>
          Rename
        </MenuItem>
        <MenuItem icon={<Archive />} onSelect={() => toast("Archived")}>
          Archive
        </MenuItem>
      </Menu>
    ),
    sections: (
      <Menu trigger={<Button variant="ghost">Project</Button>}>
        <MenuLabel>Edit</MenuLabel>
        <MenuItem icon={<Pencil />} onSelect={() => toast("Renaming")}>
          Rename
        </MenuItem>
        <MenuItem icon={<Copy />} onSelect={() => toast("Duplicated")}>
          Duplicate
        </MenuItem>
        <MenuLabel>Manage</MenuLabel>
        <MenuItem icon={<Archive />} onSelect={() => toast("Archived")}>
          Archive
        </MenuItem>
        <MenuItem
          icon={<Trash2 />}
          className="text-err"
          onSelect={() => toast("Deleted", { tone: "err" })}
        >
          Delete
        </MenuItem>
      </Menu>
    ),
    submenu: (
      <Menu trigger={<Button variant="ghost">Export</Button>}>
        <MenuItem icon={<FileText />} onSelect={() => toast("Exported CSV")}>
          CSV
        </MenuItem>
        <Submenu label="More formats" icon={<FileDown />}>
          <MenuItem icon={<FileImage />} onSelect={() => toast("Exported PNG")}>
            PNG
          </MenuItem>
          <MenuItem icon={<FileText />} onSelect={() => toast("Exported PDF")}>
            PDF
          </MenuItem>
        </Submenu>
      </Menu>
    ),
    align: (
      <div className="flex w-full max-w-72 justify-end">
        <Menu
          align="end"
          trigger={
            <IconButton label="More actions">
              <Ellipsis />
            </IconButton>
          }
        >
          <MenuItem icon={<Star />} onSelect={() => toast("Starred")}>
            Add to favourites
          </MenuItem>
          <MenuItem icon={<Share2 />} onSelect={() => toast("Shared")}>
            Share
          </MenuItem>
          <MenuItem icon={<Archive />} onSelect={() => toast("Archived")}>
            Archive
          </MenuItem>
        </Menu>
      </div>
    ),
  },

  "minimilist-context-menu": {
    default: (
      <ContextMenu
        className="w-full max-w-72"
        content={
          <>
            <MenuItem icon={<Pencil />} onSelect={() => toast("Editing")}>
              Edit
            </MenuItem>
            <MenuItem icon={<Copy />} onSelect={() => toast("Copied")}>
              Copy
            </MenuItem>
            <MenuItem
              icon={<Trash2 />}
              onSelect={() => toast("Deleted", { tone: "err" })}
            >
              Delete
            </MenuItem>
          </>
        }
      >
        <div className="flex h-20 w-full items-center justify-center rounded-overlay bg-bg-2 text-caption text-text-2">
          Right-click anywhere in here
        </div>
      </ContextMenu>
    ),
    rows: <ContextRows />,
  },

  "minimilist-pie-menu": {
    default: (
      <PieMenu
        items={[
          { icon: <Pencil />, label: "Edit", onSelect: () => toast("Editing") },
          { icon: <Copy />, label: "Copy", onSelect: () => toast("Copied") },
          { icon: <Star />, label: "Star", onSelect: () => toast("Starred") },
          { icon: <Share2 />, label: "Share", onSelect: () => toast("Shared") },
          {
            icon: <Trash2 />,
            label: "Delete",
            onSelect: () => toast("Deleted", { tone: "err" }),
          },
        ]}
      />
    ),
    compact: (
      <PieMenu
        radius={44}
        label="Add"
        items={[
          { icon: <FileText />, label: "Note", onSelect: () => toast("New note") },
          { icon: <FileImage />, label: "Image", onSelect: () => toast("New image") },
          { icon: <Layers />, label: "Frame", onSelect: () => toast("New frame") },
        ]}
      />
    ),
  },

  "minimilist-tabs": {
    default: (
      <div className="w-full max-w-96">
        <Tabs tabs={PANELS} />
      </div>
    ),
    preselected: (
      <div className="w-full max-w-96">
        <Tabs tabs={PANELS} defaultValue="activity" />
      </div>
    ),
    icons: (
      <div className="w-full max-w-96">
        <Tabs
          tabs={[
            {
              value: "overview",
              label: (
                <span className="flex items-center gap-1.5 [&_svg]:size-3.5">
                  <Gauge />
                  Overview
                </span>
              ),
              content: "Everything healthy. Last deploy 2h ago.",
            },
            {
              value: "activity",
              label: (
                <span className="flex items-center gap-1.5 [&_svg]:size-3.5">
                  <Activity />
                  Activity
                </span>
              ),
              content: "14 events this week, quietest on Tuesday.",
            },
            {
              value: "members",
              label: (
                <span className="flex items-center gap-1.5 [&_svg]:size-3.5">
                  <Users />
                  Members
                </span>
              ),
              content: "Six people, two of them admins.",
            },
          ]}
        />
      </div>
    ),
  },

  "minimilist-breadcrumbs": {
    default: (
      <Breadcrumbs
        items={[
          { label: "Workspace", href: "#" },
          { label: "Projects", href: "#" },
          { label: "minflow" },
        ]}
      />
    ),
    icons: (
      <Breadcrumbs
        items={[
          { label: "Workspace", href: "#", icon: <Building2 /> },
          { label: "Projects", href: "#", icon: <Folder /> },
          { label: "minflow", icon: <FileCode /> },
        ]}
      />
    ),
    deep: (
      <Breadcrumbs
        items={[
          { label: "Acme", href: "#", icon: <Building2 /> },
          { label: "Design", href: "#", icon: <Folder /> },
          { label: "Tokens", href: "#", icon: <Palette /> },
          { label: "accent.ts", icon: <FileCode /> },
        ]}
      />
    ),
  },

  "minimilist-accordion": {
    default: (
      <div className="w-full max-w-96">
        <Accordion
          defaultOpen="tokens"
          items={[
            {
              id: "tokens",
              title: "How do tokens work?",
              content:
                "Six user slots compile into a semantic layer, and dark mode is derived in oklch, so a palette theme works in both themes.",
            },
            {
              id: "motion",
              title: "What about motion?",
              content:
                "A preset language: 250ms micro, 450ms views, ease-out entries, cascades at 70ms. Reduced motion is always respected.",
            },
            {
              id: "a11y",
              title: "Is it accessible?",
              content:
                "Real inputs under drawn controls, focus rings, ARIA roles, 40px hit targets, AA contrast in both themes.",
            },
          ]}
        />
      </div>
    ),
    closed: (
      <div className="w-full max-w-96">
        <Accordion
          items={[
            {
              id: "install",
              title: "Installation",
              content: "One command per component, straight from the registry.",
            },
            {
              id: "theming",
              title: "Theming",
              content:
                "Set the six user slots and everything else derives from them.",
            },
            {
              id: "motion",
              title: "Motion presets",
              content:
                "Shared durations and easings, so every component agrees on timing.",
            },
            {
              id: "registry",
              title: "Registry",
              content:
                "Source lands in your repo, so a component is yours to edit.",
            },
          ]}
        />
      </div>
    ),
    list: (
      <div className="w-full max-w-96">
        <Accordion
          items={[
            {
              id: "notifications",
              title: "Notifications",
              icon: <Bell />,
              content:
                "Email digests, deploy alerts, and the weekly usage report.",
            },
            {
              id: "billing",
              title: "Billing",
              icon: <CreditCard />,
              content: "Plan, payment method, invoices, and usage limits.",
            },
            {
              id: "access",
              title: "Access",
              icon: <KeyRound />,
              content: "API tokens, SSO, and the audit log for this workspace.",
            },
          ]}
        />
      </div>
    ),
  },

  "minimilist-link": {
    inline: (
      <p className="max-w-72 text-body text-text-2">
        Every colour comes from the{" "}
        <Link href="#">six user slots</Link>, and the rest of the scale is
        derived from them.
      </p>
    ),
    external: (
      <p className="max-w-72 text-body text-text-2">
        The vocabulary follows the{" "}
        <Link
          href="https://www.nngroup.com/articles/ui-elements-glossary/"
          external
        >
          NN/g glossary
        </Link>
        .
      </p>
    ),
    standalone: (
      <div className="flex flex-col items-start gap-2">
        <Link href="#">Read the theming guide</Link>
        <Link href="#">Browse every component</Link>
      </div>
    ),
  },

  "minimilist-tree": {
    default: (
      <Tree
        items={PROJECT_TREE}
        defaultExpanded={["atlas", "tokens"]}
        defaultSelected="motion"
      />
    ),
    collapsed: <Tree items={PROJECT_TREE} />,
    actions: (
      <Tree
        defaultExpanded={["workspace"]}
        defaultSelected="roadmap"
        onSelect={(id) => toast(`Opened ${id}`)}
        items={[
          {
            id: "workspace",
            label: "workspace",
            icon: <Folder />,
            menu: nodeActions("workspace"),
            children: [
              {
                id: "roadmap",
                label: "roadmap",
                icon: <FileText />,
                menu: nodeActions("roadmap"),
              },
              {
                id: "settings",
                label: "settings",
                icon: <Settings />,
                menu: nodeActions("settings"),
              },
            ],
          },
        ]}
      />
    ),
  },
};
