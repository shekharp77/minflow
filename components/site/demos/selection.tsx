"use client";

import * as React from "react";
import { Columns3, LayoutGrid, List } from "lucide-react";
import { Checkbox } from "@/registry/minflow/ui/checkbox";
import { Combobox } from "@/registry/minflow/ui/combobox";
import { Listbox } from "@/registry/minflow/ui/listbox";
import { Radio, RadioGroup } from "@/registry/minflow/ui/radio";
import { Segmented } from "@/registry/minflow/ui/segmented";
import { Select } from "@/registry/minflow/ui/select";
import { Slider } from "@/registry/minflow/ui/slider";
import { Stepper } from "@/registry/minflow/ui/stepper";
import { Switch } from "@/registry/minflow/ui/switch";
import type { DemoSet } from "@/components/site/demos/types";

const ENVIRONMENTS = [
  { value: "production", label: "Production" },
  { value: "staging", label: "Staging" },
  { value: "preview", label: "Preview" },
];

const FRAMEWORKS = ["Next.js", "Astro", "Remix", "SvelteKit", "Nuxt", "Qwik"];

function SwitchRow({ label, defaultOn }: { label: string; defaultOn?: boolean }) {
  return (
    <div className="flex w-full max-w-72 items-center justify-between gap-4">
      <span className="text-body text-text">{label}</span>
      <Switch defaultChecked={defaultOn} aria-label={label} />
    </div>
  );
}

export const selectionDemos: DemoSet = {
  "minimilist-checkbox": {
    default: <Checkbox label="Email digests" defaultChecked />,
    group: (
      <div className="flex flex-col gap-3">
        <Checkbox label="Email digests" defaultChecked />
        <Checkbox label="Weekly report" />
        <Checkbox label="Deploy alerts" defaultChecked />
      </div>
    ),
    disabled: (
      <div className="flex flex-col gap-3">
        <Checkbox label="Email digests" defaultChecked />
        <Checkbox label="Legacy sync" disabled />
      </div>
    ),
  },

  "minimilist-radio": {
    default: (
      <RadioGroup defaultValue="frankfurt">
        <Radio value="oregon" label="Oregon" />
        <Radio value="frankfurt" label="Frankfurt" />
        <Radio value="singapore" label="Singapore" />
      </RadioGroup>
    ),
    descriptions: (
      <RadioGroup defaultValue="hobby">
        <Radio
          value="hobby"
          label={
            <span className="flex flex-col gap-0.5">
              <span>Hobby</span>
              <span className="text-caption text-text-2">
                One project, community support.
              </span>
            </span>
          }
        />
        <Radio
          value="pro"
          label={
            <span className="flex flex-col gap-0.5">
              <span>Pro</span>
              <span className="text-caption text-text-2">
                Unlimited projects, priority support.
              </span>
            </span>
          }
        />
      </RadioGroup>
    ),
  },

  "minimilist-switch": {
    default: <Switch defaultChecked aria-label="Auto-deploy" />,
    row: (
      <div className="flex flex-col gap-4">
        <SwitchRow label="Auto-deploy" defaultOn />
        <SwitchRow label="Usage alerts" />
        <SwitchRow label="Weekly digest" />
      </div>
    ),
  },

  "minimilist-segmented": {
    default: (
      <Segmented
        label="Range"
        defaultValue="week"
        options={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
        ]}
      />
    ),
    icons: (
      <Segmented
        label="View"
        defaultValue="board"
        options={[
          { value: "list", label: <List aria-label="List" /> },
          { value: "board", label: <Columns3 aria-label="Board" /> },
          { value: "grid", label: <LayoutGrid aria-label="Grid" /> },
        ]}
      />
    ),
  },

  "minimilist-slider": {
    default: (
      <div className="w-full max-w-72">
        <Slider defaultValue={60} label="Volume" />
      </div>
    ),
    steps: (
      <div className="w-full max-w-72">
        <Slider defaultValue={50} step={25} label="Quality" />
      </div>
    ),
  },

  "minimilist-stepper": {
    default: <Stepper defaultValue={2} label="Replicas" />,
    bounded: <Stepper defaultValue={1} min={1} max={3} label="Seats" />,
  },

  "minimilist-select": {
    default: <Select options={ENVIRONMENTS} label="Environment" placeholder="Environment" />,
    preselected: (
      <Select options={ENVIRONMENTS} defaultValue="staging" label="Environment" />
    ),
  },

  "minimilist-combobox": {
    default: <Combobox options={FRAMEWORKS} label="Framework" placeholder="Search framework" />,
  },

  "minimilist-listbox": {
    multi: (
      <Listbox
        label="Teams"
        options={["Design", "Engineering", "Research", "Marketing", "Support"]}
        defaultValue={["Design", "Research"]}
      />
    ),
    single: (
      <Listbox
        label="Primary team"
        multiple={false}
        options={["Design", "Engineering", "Research", "Marketing", "Support"]}
        defaultValue={["Engineering"]}
      />
    ),
  },
};
