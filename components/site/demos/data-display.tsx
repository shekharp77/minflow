"use client";

import * as React from "react";
import {
  Archive,
  Bell,
  CircleCheck,
  FileText,
  GitBranch,
  Inbox,
  Star,
  Users,
} from "lucide-react";
import { Avatar, AvatarGroup } from "@/registry/minflow/ui/avatar";
import { BottomNav } from "@/registry/minflow/ui/bottom-nav";
import { DataTable, type Column } from "@/registry/minflow/ui/data-table";
import { DeviceMockup } from "@/registry/minflow/ui/device-mockup";
import { ImageList } from "@/registry/minflow/ui/image-list";
import { List } from "@/registry/minflow/ui/list";
import { Terminal } from "@/registry/minflow/ui/terminal";
import { Text, TypeScale } from "@/registry/minflow/ui/typography";
import type { DemoSet } from "@/components/site/demos/types";

const PEOPLE = [
  { name: "Mira Sato" },
  { name: "Jon Alvarez" },
  { name: "Sana Iqbal" },
  { name: "Theo Lindqvist" },
  { name: "Ada Okonkwo" },
  { name: "Rui Chen" },
];

/* A local, theme-tolerant stand-in so the photo path is demonstrable without
   reaching for a network image. */
const PORTRAIT =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#c8ccd1"/><circle cx="40" cy="31" r="15" fill="#8d939b"/><path d="M8 80c4-19 16-27 32-27s28 8 32 27z" fill="#8d939b"/></svg>'
  );

function SelectableList() {
  const [picked, setPicked] = React.useState("inbox");
  const rows = [
    { id: "inbox", title: "Inbox", leading: <Inbox />, trailing: "12" },
    { id: "starred", title: "Starred", leading: <Star />, trailing: "3" },
    { id: "archive", title: "Archive", leading: <Archive /> },
  ];
  return (
    <List
      className="max-w-sm"
      selectedId={picked}
      label="Mailboxes"
      items={rows.map((r) => ({ ...r, onSelect: () => setPicked(r.id) }))}
    />
  );
}

interface Row {
  id: string;
  service: string;
  calls: number;
  p95: number;
  status: string;
}

const ROWS: Row[] = [
  { id: "a", service: "auth", calls: 128400, p95: 42, status: "Healthy" },
  { id: "b", service: "billing", calls: 9820, p95: 310, status: "Degraded" },
  { id: "c", service: "search", calls: 76210, p95: 88, status: "Healthy" },
  { id: "d", service: "webhooks", calls: 2140, p95: 1290, status: "Failing" },
];

const COLUMNS: Column<Row>[] = [
  {
    id: "service",
    header: "Service",
    sortable: true,
    sortValue: (r) => r.service,
    render: (r) => <span className="font-medium">{r.service}</span>,
  },
  {
    id: "calls",
    header: "Calls",
    numeric: true,
    sortable: true,
    sortValue: (r) => r.calls,
    render: (r) => r.calls.toLocaleString(),
  },
  {
    id: "p95",
    header: "p95",
    numeric: true,
    sortable: true,
    sortValue: (r) => r.p95,
    render: (r) => `${r.p95}ms`,
  },
  {
    id: "status",
    header: "Status",
    render: (r) => (
      <span
        className={
          r.status === "Healthy"
            ? "text-ok"
            : r.status === "Degraded"
              ? "text-warn"
              : "text-err"
        }
      >
        {r.status}
      </span>
    ),
  },
];

const TILES = [
  { id: "arc", src: "/specimen/arc.svg", alt: "Arc", ratio: "4 / 5", caption: "Arc" },
  { id: "rise", src: "/specimen/rise.svg", alt: "Rise", ratio: "3 / 2", caption: "Rise" },
  { id: "fold", src: "/specimen/fold.svg", alt: "Fold", ratio: "3 / 4.1", caption: "Fold" },
  { id: "orbit", src: "/specimen/orbit.svg", alt: "Orbit", ratio: "1 / 1", caption: "Orbit" },
  { id: "grid", src: "/specimen/grid.svg", alt: "Grid", ratio: "5 / 4", caption: "Grid" },
  { id: "wave", src: "/specimen/wave.svg", alt: "Wave", ratio: "8 / 5", caption: "Wave" },
];

function PhoneDemo() {
  const [tab, setTab] = React.useState("inbox");
  return (
    <DeviceMockup kind="phone" time="9:41">
      <div className="flex h-full flex-col">
        <div className="flex-1 px-3 pt-2">
          <Text variant="title" display className="px-2">
            Inbox
          </Text>
          <List
            dense
            className="mt-2"
            label="Messages"
            items={[
              { id: "1", title: "Design review", detail: "Mira - 9:02", leading: <FileText /> },
              { id: "2", title: "Deploy finished", detail: "CI - 8:47", leading: <CircleCheck /> },
              { id: "3", title: "New follower", detail: "Rui - 8:15", leading: <Users /> },
            ]}
          />
        </div>
        <BottomNav
          value={tab}
          onChange={setTab}
          items={[
            { id: "inbox", label: "Inbox", icon: <Inbox />, badge: 3 },
            { id: "team", label: "Team", icon: <Users /> },
            { id: "alerts", label: "Alerts", icon: <Bell /> },
          ]}
        />
      </div>
    </DeviceMockup>
  );
}

export const dataDisplayDemos: DemoSet = {
  "minimilist-avatar": {
    sizes: (
      <div className="flex items-center gap-4">
        {([20, 24, 32, 40] as const).map((s) => (
          <Avatar key={s} name="Mira Sato" size={s} />
        ))}
      </div>
    ),
    status: (
      <div className="flex items-center gap-4">
        <Avatar name="Mira Sato" status="online" size={40} />
        <Avatar name="Jon Alvarez" status="away" size={40} />
        <Avatar name="Sana Iqbal" status="offline" size={40} />
      </div>
    ),
    group: <AvatarGroup people={PEOPLE} max={4} size={32} />,
    image: (
      <div className="flex items-center gap-4">
        <Avatar name="Ada Okonkwo" src={PORTRAIT} size={40} />
        <Avatar name="Ada Okonkwo" size={40} />
      </div>
    ),
  },

  "minimilist-terminal": {
    session: (
      <Terminal
        title="~/minflow"
        lines={[
          { kind: "command", text: "npx shadcn@latest add @minflow/terminal" },
          { kind: "output", text: "Checking registry..." },
          { kind: "success", text: "Added terminal.tsx to registry/minflow/ui" },
          { kind: "command", text: "pnpm dev" },
          { kind: "output", text: "ready on http://localhost:3000" },
        ]}
      />
    ),
    static: (
      <Terminal
        autoPlay={false}
        title="~/minflow"
        lines={[
          { kind: "comment", text: "# every flag, in one place" },
          { kind: "command", text: "minflow build --registry ./registry --out dist" },
          { kind: "output", text: "  --registry   source of truth (default ./registry)" },
          { kind: "output", text: "  --out        build directory (default ./dist)" },
          { kind: "output", text: "  --watch      rebuild on change" },
        ]}
      />
    ),
    failure: (
      <Terminal
        title="~/minflow"
        lines={[
          { kind: "command", text: "pnpm typecheck" },
          { kind: "error", text: "ui/select.tsx(42,7): Type 'string' is not assignable to 'Option'." },
          { kind: "comment", text: "# the value was never widened" },
          { kind: "command", text: "pnpm typecheck --fix" },
          { kind: "success", text: "0 errors" },
        ]}
      />
    ),
  },

  "minimilist-device-mockup": {
    phone: <PhoneDemo />,
    browser: (
      <DeviceMockup kind="browser" url="minflow.design/components">
        <div className="p-4">
          <Text variant="section" display>
            Components
          </Text>
          <p className="mt-1 text-caption text-text-2">
            Fifty-plus specimens in one minimalist language.
          </p>
          <ImageList
            className="mt-3"
            layout="grid"
            columns={3}
            items={TILES.slice(0, 6)}
          />
        </div>
      </DeviceMockup>
    ),
    tablet: (
      <DeviceMockup kind="tablet" time="10:30">
        <div className="p-4">
          <Text variant="section" display>
            Library
          </Text>
          <ImageList
            className="mt-3"
            layout="masonry"
            columns={3}
            items={TILES}
          />
        </div>
      </DeviceMockup>
    ),
  },

  "minimilist-list": {
    default: (
      <List
        className="max-w-md"
        label="Recent activity"
        items={[
          {
            id: "1",
            title: "Motion tokens landed",
            detail: "Mira Sato opened this 2 hours ago",
            leading: <GitBranch />,
            trailing: "CORE-214",
          },
          {
            id: "2",
            title: "Palette persistence",
            detail: "Jon Alvarez closed this yesterday",
            leading: <CircleCheck />,
            trailing: "CORE-209",
          },
          {
            id: "3",
            title: "Wheel picker rebuild",
            detail: "Sana Iqbal opened this on Monday",
            leading: <FileText />,
            trailing: "CORE-198",
          },
        ]}
      />
    ),
    dense: (
      <List
        dense
        className="max-w-sm"
        label="Files"
        items={[
          { id: "1", title: "button.tsx", leading: <FileText />, trailing: "3.1 kB" },
          { id: "2", title: "input.tsx", leading: <FileText />, trailing: "4.8 kB" },
          { id: "3", title: "menu.tsx", leading: <FileText />, trailing: "5.2 kB" },
          { id: "4", title: "terminal.tsx", leading: <FileText />, trailing: "6.0 kB" },
        ]}
      />
    ),
    interactive: <SelectableList />,
  },

  "minimilist-data-table": {
    sortable: (
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        defaultSort="calls"
        caption="Requests in the last hour"
      />
    ),
    plain: (
      <DataTable
        columns={COLUMNS.filter((c) => c.id !== "p95").map((c) => ({
          ...c,
          sortable: false,
        }))}
        rows={ROWS.slice(0, 3)}
      />
    ),
  },

  "minimilist-image-list": {
    grid: <ImageList layout="grid" columns={4} items={TILES} className="max-w-lg" />,
    masonry: (
      <ImageList layout="masonry" columns={3} items={TILES} className="max-w-lg" />
    ),
  },

  "minimilist-typography": {
    scale: <TypeScale className="max-w-md" />,
    tones: (
      <div className="flex flex-col gap-1.5">
        <Text tone="default">Default - the thing itself</Text>
        <Text tone="muted">Muted - everything supporting it</Text>
        <Text tone="accent">Accent - one per view, and only for the primary</Text>
        <Text tone="ok">Success - a state, never a decoration</Text>
        <Text tone="warn">Warning - a state, never a decoration</Text>
        <Text tone="err">Error - a state, never a decoration</Text>
      </div>
    ),
  },
};
