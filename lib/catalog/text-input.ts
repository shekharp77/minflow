import type { ComponentDoc } from "@/lib/catalog/types";

/* Text input components. */
export const textInputComponents: ComponentDoc[] = [
  {
    slug: "minimilist-input",
    name: "Input",
    category: "Text input",
    summary: "The house textbox: a placeholder, and no boundary at all.",
    description:
      "Inline is the default and it draws nothing in any state, not even on focus. A placeholder, an optional leading glyph, and the field's position in the layout are the whole affordance. That restraint is what lets an input sit directly in a row of content and create an object where it stands, instead of announcing itself as a form.",
    whereToUse: [
      "Inline editing, draft rows, and any field that lives inside content rather than inside a form.",
      "Object titles, where the heading variant carries the display face.",
      "The bounded variant only in genuinely dense forms that need a visible target.",
    ],
    variants: [
      {
        id: "inline",
        title: "Inline",
        when: "The default. No fill, no box, no rule. Use it everywhere unless you have a specific reason not to.",
      },
      {
        id: "icon-action",
        title: "Leading glyph and revealing action",
        when: "When the field needs a category marker in front, or a commit control that should stay hidden until there is something to commit.",
      },
      {
        id: "muted",
        title: "Muted",
        when: "Optional slots waiting to be filled in later: 'Add a description', 'Set target date'. The placeholder is itself the click-to-edit affordance.",
      },
      {
        id: "heading",
        title: "Heading",
        when: "The object-title field at the top of a detail view. Takes the display face so the title reads as a title while still being editable in place.",
      },
      {
        id: "boxed",
        title: "Bounded",
        when: "The one bounded variant. A hairline all around and still no fill, for dense forms where the user needs to see the target.",
      },
    ],
  },
  {
    slug: "minimilist-textarea",
    name: "Textarea",
    category: "Text input",
    summary: "Multiline text that eases taller as it fills.",
    description:
      "A fixed-height textarea either wastes space or hides the text. This one measures its content and grows, easing the height open instead of jumping it, up to a ceiling you set. Borderless like every other inline field.",
    whereToUse: [
      "Descriptions, notes, comments, and release notes.",
      "Anywhere the expected length varies from one line to a paragraph.",
    ],
    variants: [
      {
        id: "default",
        title: "Auto-growing",
        when: "The default. Starts at two rows and eases taller as content arrives.",
      },
      {
        id: "max-rows",
        title: "Capped height",
        when: "When the field sits in a constrained panel and must stop growing at some point, scrolling beyond it.",
      },
    ],
  },
  {
    slug: "minimilist-search-field",
    name: "Search field",
    category: "Text input",
    summary: "A single glyph that eases open into a field.",
    description:
      "Search is present on most screens but wanted on few, so it rests as one glyph and opens into a full field on focus. Leaving it empty folds it closed again, which keeps the chrome quiet without hiding the feature.",
    whereToUse: [
      "Headers and toolbars, where a permanent search field would dominate the chrome.",
      "Any surface where search is available but secondary to the content.",
    ],
    variants: [
      {
        id: "default",
        title: "Collapsing",
        when: "The default. Opens on focus, folds closed on an empty blur, and clears with the trailing control.",
      },
    ],
  },
  {
    slug: "minimilist-inline-create",
    name: "Inline create",
    category: "Text input",
    summary: "Creating an object where the object will live.",
    description:
      "Object creation never opens a modal and never navigates to a form. A ghost row sits exactly where the new row will be, becomes a draft asking only for the name, and commits on Enter with system defaults filling everything else. The object's other slots sit beside it, muted and inert, previewing what can be filled in later rather than gating creation now.",
    whereToUse: [
      "Any list a user adds to: milestones, tasks, labels, members, environments.",
      "As a replacement for every 'New' and '+ Create' button in the product.",
    ],
    variants: [
      {
        id: "default",
        title: "Ghost, draft, committed",
        when: "The full lifecycle. Click the ghost, type a name, press Enter; Escape dissolves the draft.",
      },
      {
        id: "with-detail",
        title: "With a detail line",
        when: "When the object carries a description or secondary field that should be fillable immediately after creation, still without gating it.",
      },
    ],
  },
];
