"use client";

import * as React from "react";
import { CornerDownLeft, Diamond, Pencil, Tag, Trash2 } from "lucide-react";
import { InlineCreate } from "@/registry/miniflow/ui/inline-create";
import { Input, InputAction } from "@/registry/miniflow/ui/input";
import { MenuItem } from "@/registry/miniflow/ui/menu";
import { SearchField } from "@/registry/miniflow/ui/search-field";
import { Textarea } from "@/registry/miniflow/ui/textarea";
import type { DemoSet } from "@/components/site/demos/types";

function QuickNote() {
  const [value, setValue] = React.useState("");
  return (
    <form
      className="w-full max-w-64"
      onSubmit={(event) => {
        event.preventDefault();
        setValue("");
      }}
    >
      <Input
        icon={<Tag />}
        placeholder="Quick note"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        action={
          <InputAction label="Send" type="submit">
            <CornerDownLeft />
          </InputAction>
        }
      />
    </form>
  );
}

const milestoneSlots = (
  <>
    <span>Set target date</span>
    <span>0 issues</span>
    <span>0%</span>
  </>
);

export const textDemos: DemoSet = {
  "minimilist-input": {
    inline: (
      <div className="w-full max-w-64">
        <Input placeholder="Project name" />
      </div>
    ),
    "icon-action": <QuickNote />,
    muted: (
      <div className="w-full max-w-64">
        <Input variant="muted" placeholder="Add a description..." />
      </div>
    ),
    heading: (
      <div className="w-full max-w-64">
        <Input variant="heading" placeholder="Issue title" />
      </div>
    ),
    boxed: (
      <div className="w-full max-w-64">
        <Input variant="boxed" placeholder="Project name" />
      </div>
    ),
  },

  "minimilist-textarea": {
    default: (
      <div className="w-full max-w-80">
        <Textarea placeholder="Release notes..." />
      </div>
    ),
    "max-rows": (
      <div className="w-full max-w-80">
        <Textarea maxRows={3} placeholder="Stops growing after three rows..." />
      </div>
    ),
  },

  "minimilist-search-field": {
    default: <SearchField placeholder="Search components" />,
  },

  "minimilist-inline-create": {
    default: (
      <div className="w-full max-w-[30rem]">
        <p className="mb-1 px-2 text-caption text-text-2">Milestones</p>
        <InlineCreate
          noun="Milestone"
          icon={<Diamond />}
          slots={milestoneSlots}
          menu={
            <>
              <MenuItem icon={<Pencil />}>Rename</MenuItem>
              <MenuItem icon={<Trash2 />}>Delete</MenuItem>
            </>
          }
        />
      </div>
    ),
    "with-detail": (
      <div className="w-full max-w-[30rem]">
        <p className="mb-1 px-2 text-caption text-text-2">Milestones</p>
        <InlineCreate
          noun="Milestone"
          icon={<Diamond />}
          slots={milestoneSlots}
          detail={<Input variant="muted" placeholder="Add a description..." />}
        />
      </div>
    ),
  },
};
