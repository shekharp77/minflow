import type { ComponentDoc } from "@/lib/catalog/types";

/* Selection components. */
export const selectionComponents: ComponentDoc[] = [
  {
    slug: "minimilist-checkbox",
    name: "Checkbox",
    category: "Selection",
    summary: "Checked or not, with the mark drawing itself along its path.",
    description:
      "An independent binary choice. The tick draws rather than appears, which makes the state change legible at a glance in a long list where several rows may change at once.",
    whereToUse: [
      "Independent options where any combination is valid.",
      "Bulk selection in lists and tables.",
      "Never for mutually exclusive choices; that is a radio or a segmented control.",
    ],
    variants: [
      {
        id: "default",
        title: "Standard",
        when: "The default single checkbox with a label.",
      },
      {
        id: "group",
        title: "Group",
        when: "Several related options that can be combined. Keep them on one left spine so the labels scan as a column.",
      },
      {
        id: "disabled",
        title: "Disabled",
        when: "When an option exists but is unavailable in the current context, and hiding it would be more confusing than showing it.",
      },
    ],
  },
  {
    slug: "minimilist-radio",
    name: "Radio",
    category: "Selection",
    summary: "One of several, for real forms.",
    description:
      "Mutually exclusive options where seeing all of them at once matters. Radios live inside real forms; for quick options outside a form, the segmented control is the better instrument because it costs less vertical space.",
    whereToUse: [
      "Forms with three to five exclusive options that the user should compare before choosing.",
      "Never outside a form, and never with more than about five options; that is a select.",
    ],
    variants: [
      {
        id: "default",
        title: "Group",
        when: "The standard shape: a labelled group with one selected option.",
      },
      {
        id: "descriptions",
        title: "With descriptions",
        when: "When the options need explaining and the choice is consequential enough to deserve the vertical space.",
      },
    ],
  },
  {
    slug: "minimilist-switch",
    name: "Switch",
    category: "Selection",
    summary: "Two states that take effect immediately.",
    description:
      "A switch is not a checkbox. It commits the moment it is thrown, with no save step, so it belongs to settings that apply instantly. The on state wears ink rather than the accent, because a screen of switches would otherwise have a dozen primary elements.",
    whereToUse: [
      "Settings that take effect immediately: notifications, auto-deploy, reduced motion.",
      "Never inside a form that has a submit button; that is a checkbox.",
    ],
    variants: [
      {
        id: "default",
        title: "Standard",
        when: "The default labelled switch.",
      },
      {
        id: "row",
        title: "Settings row",
        when: "In a settings list, with the label on the left spine and the switch aligned right.",
      },
    ],
  },
  {
    slug: "minimilist-segmented",
    name: "Segmented control",
    category: "Selection",
    summary: "Quick exclusive options with a thumb that slides between them.",
    description:
      "The radio alternative for options outside a form. All choices stay visible, the selection is unmistakable, and the thumb animates between segments so the change reads as movement rather than a repaint.",
    whereToUse: [
      "View switches: day, week, month; list, board, calendar.",
      "Two to four short options. Beyond that, use a select.",
    ],
    variants: [
      {
        id: "default",
        title: "Standard",
        when: "The default two-to-four option switch.",
      },
      {
        id: "icons",
        title: "With glyphs",
        when: "When the options are view modes that read faster as icons than as words.",
      },
    ],
  },
  {
    slug: "minimilist-slider",
    name: "Slider",
    category: "Selection",
    summary: "A bounded value along a track.",
    description:
      "For values where the approximate position matters more than the exact number. The value rises above the thumb while dragging, so the readout never competes with the track when the control is at rest.",
    whereToUse: [
      "Volume, opacity, zoom, price ranges, any bounded continuous value.",
      "Never where the user needs to enter an exact figure; that is a stepper or an input.",
    ],
    variants: [
      {
        id: "default",
        title: "Standard",
        when: "The default single-value slider.",
      },
      {
        id: "steps",
        title: "Stepped",
        when: "When only certain values are valid and snapping helps the user land on them.",
      },
    ],
  },
  {
    slug: "minimilist-stepper",
    name: "Input stepper",
    category: "Selection",
    summary: "Small numeric changes, with the digit rolling in the direction of travel.",
    description:
      "For counts a user nudges rather than types. The number rolls up or down to match the direction of the change, which makes repeated taps readable without watching the digit closely.",
    whereToUse: [
      "Quantities, seat counts, retry limits, anything usually adjusted by one or two.",
      "Never for large ranges; a slider or a plain input handles those better.",
    ],
    variants: [
      {
        id: "default",
        title: "Standard",
        when: "The default increment and decrement pair.",
      },
      {
        id: "bounded",
        title: "With bounds",
        when: "When the value has a real minimum or maximum, so the controls disable at the ends instead of failing silently.",
      },
    ],
  },
  {
    slug: "minimilist-select",
    name: "Select",
    category: "Selection",
    summary: "One value from a hidden list: a boundary, a placeholder, a chevron.",
    description:
      "A list field, so it keeps a hairline boundary all the way around and no fill inside it, because a closed list has to look clickable while it is still empty. Opening rolls the chevron, drops the panel out of the trigger, and cascades the options in.",
    whereToUse: [
      "Five or more exclusive options, where showing them all would cost too much space.",
      "Fewer than five and comparison matters? Use radios or a segmented control.",
    ],
    variants: [
      {
        id: "default",
        title: "Standard",
        when: "The default single-select with a placeholder.",
      },
      {
        id: "preselected",
        title: "With a value",
        when: "When a sensible default exists. The chosen row draws its check when the panel opens.",
      },
    ],
  },
  {
    slug: "minimilist-combobox",
    name: "Combo box",
    category: "Selection",
    summary: "A select with a textbox: type to filter the list.",
    description:
      "When a list is too long to scan, the combo box lets the user type their way to it. The surviving options reflow rather than snapping, so the list stays readable while it narrows.",
    whereToUse: [
      "Long option sets: countries, repositories, frameworks, assignees.",
      "Anywhere the user probably knows the value they want and would rather type than hunt.",
    ],
    variants: [
      {
        id: "default",
        title: "Type to filter",
        when: "The default. Typing narrows the list live, Enter takes the highlighted match.",
      },
    ],
  },
  {
    slug: "minimilist-listbox",
    name: "Listbox",
    category: "Selection",
    summary: "Options visible in a scrollable control, multi-select by default.",
    description:
      "Where a select hides its options, a listbox keeps them on screen. Use it when the user needs to see and compare what is available, and when several choices can be active at once.",
    whereToUse: [
      "Multi-select filters where the current selection should stay visible.",
      "Side panels with room for a standing list.",
    ],
    variants: [
      {
        id: "multi",
        title: "Multi-select",
        when: "The default. Each toggle draws or erases its own check.",
      },
      {
        id: "single",
        title: "Single-select",
        when: "When only one option can be active but all of them should stay visible.",
      },
    ],
  },
];
