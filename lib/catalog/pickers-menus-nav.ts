import type { ComponentDoc } from "@/lib/catalog/types";

/* Pickers, menus, and navigation components. */
export const pickersMenusNavComponents: ComponentDoc[] = [
  {
    slug: "minimilist-calendar",
    name: "Calendar",
    category: "Pickers",
    summary: "A month on screen, so a date can be chosen by shape.",
    description:
      "The calendar puts a whole month in view so the user can pick by position rather than by number: the first Friday, the end of the quarter, the day after a holiday. Months slide horizontally in the direction of travel instead of repainting, which keeps a user paging through the year oriented. Today wears the accent and the chosen day fills with ink, so the two never need a legend to tell them apart.",
    whereToUse: [
      "Booking and scheduling surfaces, where the weekday and the neighbouring days matter as much as the date itself.",
      "Filter panels and sidebars with standing room for a grid.",
      "Never in a dense form row; use the date picker there, which folds the same grid behind a trigger.",
    ],
    variants: [
      {
        id: "default",
        title: "Nothing chosen",
        when: "The starting state. Today carries the accent, the grid opens on the current month, and the chevrons page through the year.",
      },
      {
        id: "selected",
        title: "With a chosen day",
        when: "Once a date is set. The day fills with ink so it reads as committed rather than hovered, and the grid opens on the month that day belongs to.",
      },
      {
        id: "readout",
        title: "Wired to a read-out",
        when: "When the chosen date has to be legible away from the grid. The calendar prints nothing outside its cells, so pair it with your own line of text.",
      },
    ],
  },
  {
    slug: "minimilist-date-picker",
    name: "Date picker",
    category: "Pickers",
    summary: "A date field that keeps its calendar folded away until asked.",
    description:
      "The date picker is the calendar wrapped in an input-like trigger, for forms where a standing month grid would cost too much vertical space. The trigger keeps a hairline boundary and a chevron all the way around, because a closed field has to look clickable while it is still empty. Choosing a day closes the popover immediately; there is no confirm step to forget.",
    whereToUse: [
      "Form rows and property panels: due dates, start dates, expiry.",
      "Filter bars, where the field sits in a line with other controls.",
      "Never where the user has to compare candidate dates before choosing; show the calendar itself.",
    ],
    variants: [
      {
        id: "default",
        title: "Empty with a placeholder",
        when: "The default. The field reads as a prompt until a date is set, and the boundary keeps it visible while it is still blank.",
      },
      {
        id: "preset",
        title: "With a value",
        when: "When a sensible default exists, such as a week out or the end of the current cycle. Opening the popover lands on that value's month.",
      },
      {
        id: "row",
        title: "In a labelled row",
        when: "In a settings or property panel, where the label carries the meaning and the field can be narrowed to fit the column.",
      },
    ],
  },
  {
    slug: "minimilist-wheel-picker",
    name: "Wheel picker",
    category: "Pickers",
    summary: "An iOS-style wheel that turns exactly one row per notch.",
    description:
      "A wheel for bounded, ordered values that a user nudges rather than searches for: months, hours, repeat counts. It is driven by an index rather than by a scroll box, which is what lets it hold a real cylinder shape, move one row per wheel notch, and answer the arrow keys. At either end it hands the scroll back to the page instead of swallowing it.",
    whereToUse: [
      "Touch-first surfaces and sheets, where spinning beats hunting through a dropdown.",
      "Ordered sets of roughly a dozen values: months, hours, minutes, durations.",
      "Never for an unordered or long list; that is a select or a combo box.",
    ],
    variants: [
      {
        id: "default",
        title: "Single wheel",
        when: "One bounded set of values with a starting row already under the band. Scroll, drag, or arrow through it.",
      },
      {
        id: "group",
        title: "Side by side",
        when: "Two or three wheels read as one compound value, which is how a time or a duration picker is built.",
      },
      {
        id: "controlled",
        title: "Driven from state",
        when: "When the chosen value has to appear elsewhere on screen or feed another control, rather than living inside the wheel.",
      },
    ],
  },
  {
    slug: "minimilist-matrix-pad",
    name: "2D matrix pad",
    category: "Pickers",
    summary: "Two parameters set by one drag, with a crosshair keeping both readable.",
    description:
      "The matrix pad trades a pair of sliders for a single square, where the horizontal and vertical positions are two separate values. A crosshair follows the dot all the way to the edges, so both axis positions can be read off without watching the numbers, and the live figures print underneath. Arrow keys nudge by two and shift-arrow by ten, so the control is never drag-only.",
    whereToUse: [
      "Paired continuous parameters that are tuned against each other: attack and decay, blur and spread, x and y offset.",
      "Sound, motion, and layout tools, where the relationship between the two values is what the user is feeling for.",
      "Never for two values that have nothing to do with each other; two sliders label themselves better.",
    ],
    variants: [
      {
        id: "default",
        title: "Bare pad",
        when: "The default x and y axes, for a coordinate that has no better name than its position.",
      },
      {
        id: "labels",
        title: "Named axes",
        when: "When the two parameters have real names. The labels print alongside the live figures, so the read-out explains itself.",
      },
      {
        id: "controlled",
        title: "Driven from state",
        when: "When the pair feeds something else on the page, such as a live preview, and the pad is the input rather than the record.",
      },
    ],
  },

  {
    slug: "minimilist-menu",
    name: "Menu",
    category: "Menus",
    summary: "Actions on demand under their handle, cascading in as a list.",
    description:
      "The dropdown menu holds the actions that do not deserve standing room in a toolbar. Items cascade in a beat behind the panel rather than arriving with it, which is what makes a menu read as a list the eye can run down instead of a block that appears. Every item closes its menu on select through context, so nested compositions behave without extra wiring.",
    whereToUse: [
      "Overflow actions on rows and cards, behind an ellipsis handle.",
      "Toolbar groupings: export formats, view options, account actions.",
      "Two or three actions that all matter equally? Show them as buttons; a menu costs a click to reveal what was already affordable.",
    ],
    variants: [
      {
        id: "default",
        title: "Plain list",
        when: "The default. A handful of flat actions, each with a glyph the eye catches before it reads the word.",
      },
      {
        id: "sections",
        title: "With labels",
        when: "When the items fall into groups. A heading is cheaper than splitting one menu into two handles.",
      },
      {
        id: "submenu",
        title: "Nested flyout",
        when: "For a set of close variations, such as export formats, that would otherwise double the length of the parent list.",
      },
      {
        id: "align",
        title: "Aligned to the trailing edge",
        when: "When the handle sits at the right of its container. Aligning the panel to that edge keeps it inside the layout instead of pushing past it.",
      },
    ],
  },
  {
    slug: "minimilist-context-menu",
    name: "Context menu",
    category: "Menus",
    summary: "Right-click actions that scale out of the point that was clicked.",
    description:
      "The context menu binds actions to the thing under the cursor rather than to a handle somewhere else on the screen. It opens at the click point and scales out of it, so the link between the target and the actions never has to be explained. It shares its items with the dropdown menu, so an action can live in both places without a second implementation.",
    whereToUse: [
      "Canvases, boards, and file lists, where the content itself is the target.",
      "As a shortcut over actions that already exist elsewhere, never as their only home: a right-click is undiscoverable on its own and unavailable on touch.",
    ],
    variants: [
      {
        id: "default",
        title: "A whole zone",
        when: "The default. One surface answers the right-click, and the panel opens wherever the cursor happened to be.",
      },
      {
        id: "rows",
        title: "Per row",
        when: "When each item in a list carries its own actions. Each row gets its own content, so the menu always matches what was clicked.",
      },
    ],
  },
  {
    slug: "minimilist-pie-menu",
    name: "Pie menu",
    category: "Menus",
    summary: "Options blooming onto a circle around their handle.",
    description:
      "The pie menu puts a small set of actions an equal distance from the handle, so every one of them costs the same movement and the same aim. Options bloom outward a beat apart and collapse back into the centre on select, while the handle's plus rolls over into a close. It only holds up while the count stays low, because the ring divides evenly and the arc crowds fast.",
    whereToUse: [
      "Canvas and editor surfaces, where a floating handle is already under the pointer.",
      "Three to six actions used often enough to be worth building muscle memory for.",
      "Never for destinations or a long action set; that is a dropdown menu.",
    ],
    variants: [
      {
        id: "default",
        title: "Full ring",
        when: "Five or six actions spread evenly around the handle at the standing radius.",
      },
      {
        id: "compact",
        title: "Tight ring",
        when: "Three or four actions on a shorter radius, for a corner of a canvas or any surface without room for the full circle.",
      },
    ],
  },

  {
    slug: "minimilist-tabs",
    name: "Tabs",
    category: "Navigation",
    summary: "One panel at a time, with an ink line sliding between the triggers.",
    description:
      "Tabs split content belonging to one object into panels the user flips between without leaving the page. A single underline moves between triggers under shared layout rather than switching off in one place and on in another, so the eye tracks the change instead of hunting for it. The leaving panel hands off to the arriving one with a fade-rise, and the arrow keys walk the bar.",
    whereToUse: [
      "Views of a single record: overview, activity, settings.",
      "Two to five short labels that fit on one line without wrapping.",
      "Never for steps in a sequence, and never where each panel is really its own page; use navigation for those.",
    ],
    variants: [
      {
        id: "default",
        title: "Standard bar",
        when: "The default. A few panels, the first one open, the ink line resting under it.",
      },
      {
        id: "preselected",
        title: "Opening elsewhere",
        when: "When the user should land on a panel other than the first, such as the one the route or their last visit points at.",
      },
      {
        id: "icons",
        title: "With glyphs",
        when: "When a leading glyph makes the labels quicker to tell apart, which matters most in a narrow panel.",
      },
    ],
  },
  {
    slug: "minimilist-breadcrumbs",
    name: "Breadcrumbs",
    category: "Navigation",
    summary: "The path back up, walked one crumb at a time.",
    description:
      "Breadcrumbs say where the current page sits and give every ancestor a single click. The trail slides in left to right, one crumb after the next, so the path reads as a route rather than a row of links. Each crumb can carry a leading glyph, which is what makes a deep trail scannable before it is read.",
    whereToUse: [
      "Nested content: workspaces, folders, files, settings sections.",
      "Anywhere a user can arrive by deep link and needs to know what sits above them.",
      "Never as a page's only navigation, and never over a flat structure where there is nothing to climb.",
    ],
    variants: [
      {
        id: "default",
        title: "Plain trail",
        when: "The default. Words only, for short paths whose labels are already distinct enough.",
      },
      {
        id: "icons",
        title: "With glyphs",
        when: "When the levels have types worth showing: a workspace, a folder, a file. The glyph is recognised before the word is read.",
      },
      {
        id: "deep",
        title: "A longer path",
        when: "Four levels or more. The current page stays in ink at the end, so depth never blurs where the user actually is.",
      },
    ],
  },
  {
    slug: "minimilist-accordion",
    name: "Accordion",
    category: "Navigation",
    summary: "Rows that expand in place, separated by whitespace rather than rules.",
    description:
      "An accordion keeps a long set of answers scannable by showing only their titles until one is asked for. Height eases open while the chevron rolls over, so the expansion reads as one movement rather than a jump. Rows carrying an icon switch into a tile list, which is the shape to use when the items are destinations or categories rather than questions.",
    whereToUse: [
      "FAQs, help content, and long settings pages where most rows stay shut.",
      "Progressive disclosure of detail the user asked for, such as advanced options under a form.",
      "Never for content the user needs to compare side by side, and never to hide something required to finish the task.",
    ],
    variants: [
      {
        id: "default",
        title: "One open at rest",
        when: "The default for a short set. Opening the first row shows the reader what a row contains without any of them being clicked.",
      },
      {
        id: "closed",
        title: "All closed",
        when: "For a longer list, where opening one row by default would bury the rest and cost the user their overview.",
      },
      {
        id: "list",
        title: "Tile list",
        when: "When each row has an icon and reads as a category rather than a question. The chevron turns a quarter and the tiles carry the alignment.",
      },
    ],
  },
  {
    slug: "minimilist-link",
    name: "Link",
    category: "Navigation",
    summary: "An underline that draws itself on hover, and nothing at rest.",
    description:
      "Text links carry no decoration until the pointer arrives, then the underline grows left to right out of a background-size transition, so nothing on the line shifts. Dropping the standing underline keeps a paragraph readable when it holds several links, and the hover is what confirms the target. External links add a small arrow that leans away, so a new tab is never a surprise.",
    whereToUse: [
      "Inline references inside running prose.",
      "Cross-references and anchors between documentation pages.",
      "Never for an action; anything that changes state is a button, even when it looks like a word in a sentence.",
    ],
    variants: [
      {
        id: "inline",
        title: "In a sentence",
        when: "The default. The link sits in prose and picks up its underline only under the pointer.",
      },
      {
        id: "external",
        title: "Leaving the site",
        when: "When the target opens in a new tab. The arrow says so before the click, and the rel attribute is set for you.",
      },
      {
        id: "standalone",
        title: "On its own line",
        when: "For a link that is the whole point of its row, such as a jump target or a closing pointer to related reading.",
      },
    ],
  },
  {
    slug: "minimilist-tree",
    name: "Tree",
    category: "Navigation",
    summary: "A disclosure tree where every level hangs off its own guide.",
    description:
      "The tree is for hierarchies deep enough that a flat list would misrepresent them: file systems, nested pages, org structures. Parents carry an always-visible chevron that rolls a quarter turn, leaves keep the same alignment slot so every label stays on one spine, and each level hangs off a hairline guide. Row actions hide behind a handle that stays invisible until the row is hovered, so a deep tree reads as labels rather than as a column of buttons.",
    whereToUse: [
      "Sidebars for file browsers, page hierarchies, and nested settings.",
      "Structures three or more levels deep, where expanding and collapsing is how the user keeps their place.",
      "Never for a flat set of destinations; a plain list or a tab bar says that with less machinery.",
    ],
    variants: [
      {
        id: "default",
        title: "Open on a selection",
        when: "The usual first render. The branches leading to the selected node are already expanded, so the user can see where they are without clicking.",
      },
      {
        id: "collapsed",
        title: "Closed at rest",
        when: "For a large tree, where expanding everything would bury the top level. The user opens only the branch they are after.",
      },
      {
        id: "actions",
        title: "With row actions",
        when: "When each node has actions of its own. The handle fades in on hover and stays put while its menu is open, so the row cannot slip away.",
      },
    ],
  },
];
