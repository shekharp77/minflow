import type { ComponentDoc } from "@/lib/catalog/types";

/*
 * Controls and navigation added alongside the display set: the AI prompt
 * surface, plus the input, action, and navigation patterns the library was
 * missing against the common component catalogues.
 */
export const controlsNavComponents: ComponentDoc[] = [
  {
    slug: "minimilist-ai-prompt",
    name: "AI prompt",
    category: "Text input",
    summary: "The opening move of a conversation with a model: field, inline options, examples.",
    description:
      "A blank prompt is the hardest input in software - the field accepts anything, so it suggests nothing, and a first-time user stalls. This component answers that in three layers. The field itself is stripped to a caret on a surface, with no border to box the sentence in. The options sit on the same baseline as the send control, so they read as part of the sentence rather than as a toolbar above it. And the examples underneath are the actual fix for the blank page: one click writes a real prompt into the field, and the whole block collapses once it is no longer needed.",
    whereToUse: [
      "The empty state of any assistant, copilot, or chat surface, where the first message is the hardest one.",
      "Command surfaces where the model needs scoping - which skill, which context - before the message is worth sending.",
      "Reach for Chat instead once a conversation exists; this is the front door, not the room.",
    ],
    variants: [
      {
        id: "default",
        title: "With examples",
        when: "The default, and the right choice for any first run. The examples are dismissible, so they stop costing space the moment somebody knows what to type.",
      },
      {
        id: "options",
        title: "Scoped by options",
        when: "When the same prompt means different things depending on the tool or the context it runs against. Each option is a menu, and the chosen value replaces the label so the scope is readable at rest.",
      },
      {
        id: "bare",
        title: "Bare field",
        when: "Returning users, and anywhere the prompt sits inside a surface that already explains itself. The rotating placeholder is doing the suggesting instead.",
      },
    ],
  },
  {
    slug: "minimilist-button-group",
    name: "Button group",
    category: "Actions",
    summary: "Related actions joined by a shared hover rail instead of a border.",
    description:
      "The usual button group welds outlined buttons into a segmented slab, which makes a set of actions look like a set of choices. This one keeps every action a plain word and gives the group a single hover rail that slides between them. The set reads as a set because one highlight is shared - and a shared highlight only makes sense if the actions really do belong together, so the component enforces the thing it is claiming.",
    whereToUse: [
      "Two to four actions on one object: edit, duplicate, archive.",
      "Toolbars and row actions, where the group needs to read as one unit against everything else on the row.",
      "Reach for Segmented control instead when the buttons pick a value - a group of actions has no selected state to show.",
    ],
    variants: [
      {
        id: "horizontal",
        title: "Horizontal",
        when: "The default. The rail travels sideways between actions, which is the movement that makes them read as one control.",
      },
      {
        id: "vertical",
        title: "Vertical",
        when: "Inside a narrow column or a menu-like panel, where a horizontal row would wrap and lose the grouping.",
      },
      {
        id: "icons",
        title: "With glyphs",
        when: "When the actions are familiar enough that a glyph speeds up recognition. Keep the words - an icon-only group is a toolbar, and that is Icon button's job.",
      },
    ],
  },
  {
    slug: "minimilist-speed-dial",
    name: "Speed dial",
    category: "Actions",
    summary: "A primary control that fans out into the few things it can start.",
    description:
      "A floating action button is one action. A speed dial is the version for when there are three or four, and the difference from a pie menu is that these actions keep their labels and come out in a line, which is what makes it the right choice when the actions are not interchangeable and a first-time user has to read them. The trigger rotates into a close mark rather than swapping glyphs, so it stays obviously the same object throughout.",
    whereToUse: [
      "Mobile and canvas surfaces where creation is the primary verb and there are a few kinds of thing to create.",
      "Three to five actions. Beyond that the fan stops being scannable and the answer is a menu.",
      "Reach for Pie menu when the actions are equal and speed matters more than reading; reach for FAB when there is only one.",
    ],
    variants: [
      {
        id: "up",
        title: "Upward",
        when: "The default, anchored bottom-right. The nearest action appears first, so the fan unrolls out of the trigger rather than arriving all at once.",
      },
      {
        id: "right",
        title: "Sideways",
        when: "When the control is docked to an edge or a rail and there is no room above it.",
      },
    ],
  },
  {
    slug: "minimilist-rating",
    name: "Rating",
    category: "Selection",
    summary: "A score set in one gesture, with the result previewed before you commit.",
    description:
      "The hover preview is the entire interaction design: you see the score you are about to give before you give it, so the control is forgiving without needing a confirm step. Underneath it is a single slider-role element rather than five separate buttons, which means the arrow keys work and a screen reader announces one value instead of reading out five unrelated stars. Clicking the current score clears it, because otherwise a one-star rating can never be undone.",
    whereToUse: [
      "Feedback, reviews, and quality scores - anywhere the answer is a small integer and precision does not matter.",
      "Read-only, to display an aggregate score next to a name or a result.",
      "Not for anything where the difference between adjacent values is meaningful - that is a slider or a number field.",
    ],
    variants: [
      {
        id: "interactive",
        title: "Interactive",
        when: "The default. Hover previews, click commits, clicking the same value again clears it, and the arrow keys move by one.",
      },
      {
        id: "readonly",
        title: "Read-only",
        when: "Displaying a score somebody else gave. It stops being a control entirely - no hover, no focus, and it announces as an image with a value.",
      },
      {
        id: "value",
        title: "With the number",
        when: "Where the exact figure matters as much as the shape, such as an aggregate that sits between whole stars.",
      },
    ],
  },
  {
    slug: "minimilist-transfer-list",
    name: "Transfer list",
    category: "Selection",
    summary: "Two lists and the traffic between them, for building a set from a pool.",
    description:
      "The animation here is not decoration, it is the explanation: an item that moves is the same element arriving in a new list, not one disappearing and a different one appearing, so nobody has to re-find what they just moved. Ticking and moving are deliberately separate steps, which makes a mis-tick free to correct, and the counts live in the headings because the question this control usually answers is 'how many have I picked'.",
    whereToUse: [
      "Assigning members to a team, columns to a view, permissions to a role - anywhere a subset is chosen from a known pool.",
      "When the chosen set needs to be reviewed as a whole, not just checked off item by item.",
      "Reach for Listbox or Combo box when the pool is long or unbounded - two panels of two hundred items helps nobody.",
    ],
    variants: [
      {
        id: "default",
        title: "Empty to start",
        when: "The standard case: everything begins on the available side and the target explains its own emptiness rather than sitting blank.",
      },
      {
        id: "preselected",
        title: "Editing an existing set",
        when: "When the control is opened on something already configured. Starting populated changes the task from choosing to adjusting.",
      },
    ],
  },
  {
    slug: "minimilist-pagination",
    name: "Pagination",
    category: "Navigation",
    summary: "Page numbers with one travelling marker rather than a highlight that jumps.",
    description:
      "The marker behind the current page is a single shared element that slides between positions, so changing page carries the eye to the new number instead of leaving it to hunt for where the highlight went. Long ranges elide, but only once eliding actually saves something - a seven-page list is never shortened, because hiding two of seven pages helps nobody. The gaps are characters, not buttons: there is nothing to click in the middle of a jump.",
    whereToUse: [
      "Result sets where the page number itself is meaningful and people jump around - search results, archives, logs.",
      "Anywhere a URL should be shareable and reproducible, which infinite scroll cannot promise.",
      "Not for feeds that are browsed continuously - there, loading more is the interaction, not choosing a page.",
    ],
    variants: [
      {
        id: "default",
        title: "Short range",
        when: "Up to about seven pages, where every page can be shown and eliding would only add ambiguity.",
      },
      {
        id: "elided",
        title: "Long range",
        when: "Large sets. The first and last pages stay pinned so the size of the set is always visible, and the neighbours of the current page stay reachable.",
      },
    ],
  },
  {
    slug: "minimilist-bottom-nav",
    name: "Bottom navigation",
    category: "Navigation",
    summary: "Three to five destinations pinned within thumb reach.",
    description:
      "The label of the current destination is the indicator. Inactive items keep their glyph and drop their word, so the bar stays quiet until you look at it and the active item is the only thing spelled out - and because the label animates its width as well as its opacity, the row re-centres smoothly instead of the words jumping sideways. The pill behind the active item is one shared element, so switching tabs is a single movement rather than two fades.",
    whereToUse: [
      "The primary navigation of a phone app, where the top of the screen is out of thumb reach.",
      "Three to five destinations. Fewer is a tab bar; more will not survive a 360px screen.",
      "Reach for Tabs when the sections belong to one screen rather than being separate destinations.",
    ],
    variants: [
      {
        id: "default",
        title: "Label on the active item",
        when: "The default, and the right choice for four or five destinations. Only the current item spends space on a word.",
      },
      {
        id: "all-labels",
        title: "Every label shown",
        when: "Three destinations, or an audience that needs the words. With this few items there is room, and permanent labels remove a small guess.",
      },
    ],
  },
  {
    slug: "minimilist-app-bar",
    name: "App bar",
    category: "Navigation",
    summary: "A top bar that is invisible until content scrolls under it.",
    description:
      "At the top of a page this bar is nothing: no fill, no rule, just a title sitting on the page. Once content scrolls beneath it, the fill and the blur fade in - so the separation appears exactly when there is something to separate and never as permanent furniture. The large-title variant takes the same idea further: the bar's own title only slides in once the page's heading has scrolled away, so the name of the screen is on screen exactly once at any moment.",
    whereToUse: [
      "Mobile and tablet screens, where the bar carries the back action and the screen's name.",
      "Any scrolling view that needs its actions kept reachable without a border pinned across the page.",
      "Not on a desktop page that already has a global header - two bars stacked is one too many.",
    ],
    variants: [
      {
        id: "condense",
        title: "Condense on scroll",
        when: "The default. The title is always present; only the surface behind it changes as content passes underneath.",
      },
      {
        id: "large-title",
        title: "Large title handoff",
        when: "Screens that open with a big heading. The bar stays empty until that heading leaves, then takes over the name.",
      },
    ],
  },
  {
    slug: "minimilist-menubar",
    name: "Menubar",
    category: "Menus",
    summary: "An application menu row where hovering switches menus once one is open.",
    description:
      "What separates a menubar from a row of dropdowns is exactly one rule: once any menu is open, pointing at a sibling switches to it without a second click. That behaviour is the reason to reach for this component at all, so the open menu is tracked by the bar rather than by each menu, and hover only takes over while something is already expanded - which keeps the row from being a minefield when it is closed.",
    whereToUse: [
      "Editors, canvases, and desktop-class tools with a stable set of top-level menus.",
      "When the same commands need to be findable in the same place every time, whether or not anything is selected.",
      "Not on mobile, and not for two menus - at that size a pair of dropdowns is honest and a menubar is pretence.",
    ],
    variants: [
      {
        id: "default",
        title: "Application menus",
        when: "The standard File / Edit / View row. Open one and the rest of the bar becomes hover-navigable.",
      },
    ],
  },
  {
    slug: "minimilist-progress-steps",
    name: "Progress steps",
    category: "Feedback",
    summary: "Position in a task with a known number of stages.",
    description:
      "State is carried by the palette's two weights rather than by colour coding: finished and current steps sit on the primary slots, steps still ahead sit on the secondary ones. The connector fills as progress is made, so the row reads as one bar that is partly done rather than as a set of separate lamps, and the live step carries a slow pulse that never completes - which is what 'in progress' actually means. Not to be confused with Input stepper, which increments a number.",
    whereToUse: [
      "Checkout, onboarding, and setup flows where the number of stages is known in advance.",
      "Vertical, when each step needs a line of explanation and the flow is a checklist rather than a strip.",
      "Not for a process of unknown length - a progress bar or a spinner is honest there, and a fake step count is not.",
    ],
    variants: [
      {
        id: "horizontal",
        title: "Horizontal",
        when: "Above a form, where the steps are short labels and the point is how far through you are.",
      },
      {
        id: "vertical",
        title: "Vertical",
        when: "When each stage needs a supporting line, or when the list is long enough that horizontal labels would truncate.",
      },
      {
        id: "complete",
        title: "Finished",
        when: "The end state. Every marker takes the tick and the connector is fully drawn, so completion is visible without a separate success screen.",
      },
    ],
  },
];
