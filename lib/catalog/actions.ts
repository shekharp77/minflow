import type { ComponentDoc } from "@/lib/catalog/types";

/* Actions components. */
export const actionsComponents: ComponentDoc[] = [
  {
    slug: "minimilist-button",
    name: "Button",
    category: "Actions",
    summary: "A labelled action, ranked by restraint rather than by weight.",
    description:
      "The button is the library's clearest statement of hierarchy. Text is the default, a hover fill is the step up, and a solid fill is a last resort reserved for a commit that genuinely cannot be missed. One action per view carries the accent; everything else stays neutral, so the eye lands on the primary action without any element having to shout.",
    whereToUse: [
      "Any labelled action: submit, confirm, cancel, retry.",
      "Toolbars and row actions, where several actions sit side by side and only one of them matters most.",
      "Empty states, where a single accent-coloured label is the whole call to action.",
    ],
    variants: [
      {
        id: "text",
        title: "Text",
        when: "The default for almost every labelled action. No fill and no border, so a row of them reads as a sentence of options rather than a wall of boxes.",
      },
      {
        id: "accent",
        title: "Accent",
        when: "The single most important action in the current view. If two elements on screen carry the accent, neither of them reads as primary.",
      },
      {
        id: "ghost",
        title: "Ghost",
        when: "Where a hover target helps the user aim, such as a dense list of row actions. At rest it still reads as plain text.",
      },
      {
        id: "outline-solid",
        title: "Outline and solid",
        when: "Last resorts. Reach for a fill only when accent-coloured text has already failed to carry an unmissable commit.",
      },
      {
        id: "loading",
        title: "Loading and disabled",
        when: "While an action is in flight. The spinner replaces the need for any 'please wait' copy, and the control stops accepting input.",
      },
    ],
  },
  {
    slug: "minimilist-icon-button",
    name: "Icon button",
    category: "Actions",
    summary: "An icon-only control that hands its label back on hover.",
    description:
      "Repeated and toolbar actions lose their labels and keep their meaning. Every icon button carries an accessible name and a tooltip, so stripping the text never strips the message, and the hit target stays at 40px even when the glyph is 16px.",
    whereToUse: [
      "Toolbars, row actions, and anywhere the same action repeats down a list.",
      "Inside inputs and cards where a word would crowd the content.",
      "Never for an action a first-time user could not guess from the glyph alone.",
    ],
    variants: [
      {
        id: "sizes",
        title: "Glyph sizes",
        when: "16 for dense rows, 20 for standalone controls, 24 for touch-first surfaces. The hit area stays 40px in all three.",
      },
      {
        id: "accent",
        title: "Accent",
        when: "Marks the one primary action in an otherwise neutral toolbar.",
      },
      {
        id: "disabled",
        title: "Disabled",
        when: "When the action is unavailable but its position should stay stable, so the toolbar does not reflow.",
      },
    ],
  },
  {
    slug: "minimilist-split-button",
    name: "Split button",
    category: "Actions",
    summary: "A default action with its alternatives one chevron away.",
    description:
      "When one action is right most of the time but not always, the split button commits to a default and keeps the rest within reach. Inline like the rest of the library: no outline and no rule between the halves, held together by proximity and a shared hover fill.",
    whereToUse: [
      "Export, share, and save flows where one format is the obvious default.",
      "Any action with two or three close cousins that would clutter a toolbar as separate controls.",
    ],
    variants: [
      {
        id: "default",
        title: "Default action plus menu",
        when: "The standard shape. The label runs the common case, the chevron reveals the rest.",
      },
      {
        id: "icons",
        title: "Menu with icons",
        when: "When the alternatives are recognisable by glyph, which makes the menu scannable without reading.",
      },
    ],
  },
  {
    slug: "minimilist-fab",
    name: "Floating action button",
    category: "Actions",
    summary: "One unmissable action hovering above the content.",
    description:
      "The floating action button is the exception to the library's no-fills rule, and it earns that exception by being the only one on the screen. It hovers over content rather than sitting in the flow, and rises a breath on hover so it reads as a physical control.",
    whereToUse: [
      "Mobile layouts, where the quick-actions rail collapses into a single control.",
      "Content surfaces with one dominant creation action.",
      "Never more than one per screen, and never for a secondary action.",
    ],
    variants: [
      {
        id: "default",
        title: "Standard",
        when: "The default: a single glyph, a fill, and a lift on hover.",
      },
      {
        id: "labelled",
        title: "With a label",
        when: "When the action is not guessable from a glyph, or when the surface has room for the word.",
      },
    ],
  },
  {
    slug: "minimilist-back-to-top",
    name: "Back to top",
    category: "Actions",
    summary: "A quiet return that appears only once the page has depth.",
    description:
      "A page short enough to see in one screen does not need this control, so it stays hidden until the reader has scrolled past a real threshold, then eases the viewport home rather than snapping it.",
    whereToUse: [
      "Long linear content: documentation, articles, chat history.",
      "Never on a paged or windowed screen, where there is no long scroll to return from.",
    ],
    variants: [
      {
        id: "default",
        title: "Threshold reveal",
        when: "The default. Appears past 600px of scroll and eases back to the top on click.",
      },
    ],
  },
  {
    slug: "minimilist-icon-swap",
    name: "Icon swap",
    category: "Actions",
    summary: "A glyph that crossfades when its state changes.",
    description:
      "State changes on icon-only controls are easy to miss. Icon swap crossfades and counter-rotates between two glyphs so the change registers without a label, which is what lets copy buttons, play controls, and theme toggles stay wordless.",
    whereToUse: [
      "Copy buttons that confirm with a tick.",
      "Play and pause, mute and unmute, light and dark.",
      "Any binary control where the glyph itself is the state.",
    ],
    variants: [
      {
        id: "default",
        title: "Two-state swap",
        when: "The standard case: one glyph in, one glyph out, crossfaded.",
      },
    ],
  },
];
