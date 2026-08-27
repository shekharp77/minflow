import type { ComponentDoc } from "@/lib/catalog/types";

/* Feedback, overlays, display, and pattern components. */
export const feedbackOverlaysDisplayComponents: ComponentDoc[] = [
  /* Feedback ------------------------------------------------------------- */
  {
    slug: "minimilist-alert",
    name: "Alert",
    category: "Feedback",
    summary: "A standing notice about state, carried by one status glyph.",
    description:
      "The alert is the toast's standing counterpart: it holds still until the situation changes or the reader dismisses it. There is no banner and no tinted box, because the status glyph is the only element allowed to take a status colour and the text beside it stays in the ordinary reading tone. Dismissing collapses the row, so a stack closes its own gap instead of jumping.",
    whereToUse: [
      "Conditions that persist: a failed publish, a drifted config, a quota about to run out.",
      "Directly above the content the notice is about, so the fix sits next to the problem.",
      "Never for a passing confirmation like 'Saved'; that is a toast, which leaves on its own.",
    ],
    variants: [
      {
        id: "tones",
        title: "The four tones",
        when: "Info for context, ok for a settled result, warn for something that needs attention soon, err for something already broken. Only the glyph takes the colour, so four alerts in a column still read as one list.",
      },
      {
        id: "action",
        title: "With one action",
        when: "When there is a single obvious thing to do about the notice. Keep it to one control, otherwise the alert turns into a toolbar and stops reading as a sentence.",
      },
      {
        id: "stack",
        title: "A dismissible stack",
        when: "Several standing notices at once. Wrap each alert in AlertRow inside an AlertStack so dismissing one collapses its row while the rest slide up.",
      },
      {
        id: "title-only",
        title: "Title only",
        when: "When the title already says everything. Dropping the detail line keeps a low-stakes notice from spending a paragraph of vertical space on itself.",
      },
    ],
  },
  {
    slug: "minimilist-toast",
    name: "Toast",
    category: "Feedback",
    summary: "Passing status that stacks, drains its countdown, and leaves on its own.",
    description:
      "toast() is a function call rather than a component you place: one Toaster is mounted at the root and any code anywhere can raise a notice through it. Each one rises into the stack, strikes its status glyph once, and drains a hairline countdown along its base so the time left is visible rather than guessed. It leaves without being asked, which is the whole difference between it and an alert.",
    whereToUse: [
      "Confirming an action the reader already knows they took: saved, copied, exported.",
      "Background results that need noticing but not acting on.",
      "Never for something that needs a decision or a fix; an alert holds still long enough to read twice.",
    ],
    variants: [
      {
        id: "default",
        title: "Neutral confirmation",
        when: "The common case. A short past-tense sentence about what just happened, with no status colour at all.",
      },
      {
        id: "tones",
        title: "Success and failure",
        when: "Reserve ok for a result worth noticing and err for something that actually failed. If every toast carries a tone, the tone stops carrying meaning.",
      },
      {
        id: "stack",
        title: "Several at once",
        when: "When one action produces several results. They stack in arrival order and the rest reflow under layout animation as each one expires.",
      },
      {
        id: "duration",
        title: "Tuned dwell",
        when: "When the message is longer than a few words, or shorter than the default deserves. The countdown always matches the duration you pass, so the bar never lies about the time left.",
      },
    ],
  },
  {
    slug: "minimilist-spinner",
    name: "Spinner",
    category: "Feedback",
    summary: "Ongoing work with no known end, shown rather than written.",
    description:
      "The one element in the library allowed to spin. It stands in for a 'please wait' sentence, so a working state costs 16px instead of a line of copy, and it carries its own accessible name, which is what lets it be the message rather than decoration beside one.",
    whereToUse: [
      "Work with an unknown duration: a request in flight, a build starting, a search running.",
      "Inside controls and rows where a progress bar would not fit.",
      "Never when the completion percentage is known; a progress bar or radial tells the reader how much is left.",
    ],
    variants: [
      {
        id: "sizes",
        title: "Three sizes",
        when: "16 inside dense rows and controls, 20 standalone, 24 on touch-first surfaces. Nothing in between, so spinners across the app stay comparable.",
      },
      {
        id: "inline",
        title: "Beside a status line",
        when: "When the work is worth naming as well as showing. The spinner leads and the words follow, which keeps the pair readable at a glance.",
      },
      {
        id: "label",
        title: "Named work",
        when: "When several things can be loading at once. Pass label so a screen reader hears which one is still running instead of three identical 'Loading' announcements.",
      },
    ],
  },
  {
    slug: "minimilist-progress",
    name: "Progress",
    category: "Feedback",
    summary: "Known completion, drawn as a bar or as a ring around a number.",
    description:
      "Two shapes for one fact. ProgressBar is a hairline that eases toward its value, for progress reported next to the thing it belongs to. Radial draws its ring along its own circumference around a focal number, for progress that is the point of the view. Both ease between values instead of jumping, so a ten percent step reads as movement rather than a repaint.",
    whereToUse: [
      "Uploads, imports, migrations, anything with a real denominator.",
      "Radial when the figure is the headline, bar when progress is an aside inside a row or a form.",
      "Never for work with no known end; that is a spinner, and a fake bar is worse than an honest spin.",
    ],
    variants: [
      {
        id: "bar",
        title: "Bar",
        when: "The default. A hairline that sits under or beside the thing it measures and takes no more height than a rule.",
      },
      {
        id: "radial",
        title: "Radial",
        when: "When the percentage is the content rather than an aside. The number sits inside the ring, so one glance gives both the figure and the shape of it.",
      },
      {
        id: "advancing",
        title: "Advancing value",
        when: "Whenever the value arrives in steps. Push it and watch the bar ease and the ring draw; both shapes read the same change, so pairing them on one surface is safe.",
      },
      {
        id: "sizes",
        title: "Radial sizes",
        when: "When the radial has to fit a dense metric row or carry a dashboard on its own. The ring scales, the number stays at one size so figures across a row stay comparable.",
      },
    ],
  },
  {
    slug: "minimilist-skeleton",
    name: "Skeleton",
    category: "Feedback",
    summary: "The wireframe of a page while it loads, with one quiet light sweep.",
    description:
      "A skeleton is composed rather than configured: it is one shape with a shimmer, and you stack copies of it to sketch the layout that is coming. That is deliberate, because a skeleton only earns its place if it matches the real thing closely enough that nothing shifts when the content lands. It is hidden from assistive technology, so the loading state gets announced once by the region rather than shape by shape.",
    whereToUse: [
      "First loads of a layout whose shape you already know: list rows, profile headers, media cards.",
      "Never for a refetch of content already on screen; leave the old content in place and let a spinner carry the work.",
      "Never where the incoming shape is unknown, because a skeleton that guesses wrong moves the page twice.",
    ],
    variants: [
      {
        id: "lines",
        title: "Text lines",
        when: "Paragraphs and descriptions. Vary the last line's width, because a block of identical bars reads as a chart rather than as text.",
      },
      {
        id: "row",
        title: "List row",
        when: "Feeds, member lists, anything with an avatar and two lines. Repeat the row for as many items as the real response will hold.",
      },
      {
        id: "media",
        title: "Media and text",
        when: "Cards and previews where an image block loads alongside its caption. Match the media block's radius to the real one so the swap is invisible.",
      },
    ],
  },
  {
    slug: "minimilist-badge",
    name: "Badge",
    category: "Feedback",
    summary: "An item count riding an icon's shoulder.",
    description:
      "Numbers, never a bare dot: a dot says something changed without saying how much, which sends the reader to look before they know whether it is worth looking. The pill pops in fresh whenever the count changes and collapses away at zero, so an emptied inbox clears its own marker. Counts past the maximum render as an overflow figure instead of widening the pill.",
    whereToUse: [
      "Unread and pending counts on navigation and toolbar icons.",
      "Anywhere the size of the backlog changes what the reader does next.",
      "Never as decoration or as a status colour; a chip carries status, a badge carries a number.",
    ],
    variants: [
      {
        id: "default",
        title: "Standard",
        when: "The default. A small count on an icon-only control, where the number is short enough to read without counting.",
      },
      {
        id: "overflow",
        title: "Past the maximum",
        when: "When the count can run into the hundreds. Beyond the max the badge stops being a figure and starts being a signal, which is the right trade at that size.",
      },
      {
        id: "live",
        title: "Changing count",
        when: "When the number moves while the reader is watching. Each change pops the pill in fresh, and zero collapses it away rather than leaving an empty marker behind.",
      },
    ],
  },
  {
    slug: "minimilist-fullscreen-loader",
    name: "Fullscreen loader",
    category: "Feedback",
    summary: "A first load told as a timeline of named steps.",
    description:
      "When a load runs long enough that a spinner would leave the reader guessing, this names the work instead. The current step carries the spinner, finished steps draw their tick and sink out of focus with progressive blur, and pending steps wait in the secondary tone, so the eye lands on progress first. It takes the whole viewport and locks the body, which is why it belongs to a first load and to nothing else.",
    whereToUse: [
      "Workspace setup, first sign-in, restoring a session: work the reader cannot act around anyway.",
      "Never for anything under a couple of seconds, where the takeover costs more than the wait.",
      "Never for a partial load; a skeleton keeps the rest of the interface usable while one region fills.",
    ],
    variants: [
      {
        id: "default",
        title: "Stepping through",
        when: "The standard shape. Pass the full list of steps and move current as each one lands; the loader handles the ticks, the blur, and the spine on its own.",
      },
      {
        id: "titled",
        title: "Named for the task",
        when: "When the loader covers something more specific than setup. The title is the only fixed text on the screen, so it should say what the reader is waiting for.",
      },
    ],
  },

  /* Overlays ------------------------------------------------------------- */
  {
    slug: "minimilist-dialog",
    name: "Dialog",
    category: "Overlays",
    summary: "A modal surface for one focused decision.",
    description:
      "It rises out of the scrim, traps Tab inside the panel, and hands focus back where it came from on close. Modality is the price: everything behind it stops, so a dialog has to earn the interruption with a decision that genuinely cannot wait. Escape and a click on the scrim both close it, because a modal with one exit reads as a trap.",
    whereToUse: [
      "Confirmations with consequences: delete, archive, revoke, publish.",
      "A short form that would lose its context on a page of its own.",
      "Never for detail or reference material; a sheet keeps the page behind it visible, which is usually what the reader actually needs.",
    ],
    variants: [
      {
        id: "confirm",
        title: "Confirmation",
        when: "The main reason a dialog exists. Name the consequence in the body and the action on the button, so the reader never has to hold 'yes to what' in their head.",
      },
      {
        id: "form",
        title: "Short form",
        when: "One or two fields that belong to the surface behind them. Anything longer wants a page, because a growing modal starts scrolling and loses its focus.",
      },
      {
        id: "message",
        title: "Message only",
        when: "When there is nothing to decide and the reader only has to acknowledge. Use it sparingly, since a message with no decision rarely earns modality.",
      },
    ],
  },
  {
    slug: "minimilist-sheet",
    name: "Sheet",
    category: "Overlays",
    summary: "An edge-anchored panel that leaves the page behind it in place.",
    description:
      "The sheet is the dialog's less demanding cousin: the same scrim and the same dismissal, but it slides in from an edge and keeps the context it came from visible alongside. The right edge is for detail and metadata on a wide layout, the bottom edge is for thumb-reach actions on a small one, and the bottom variant grows a grab handle so it reads as draggable material.",
    whereToUse: [
      "Detail, metadata, history, and quiet actions that belong to a row you do not want to leave.",
      "Small-screen action lists, where the bottom edge is the only comfortable reach.",
      "Never for a decision that must be answered before anything else continues; that is a dialog.",
    ],
    variants: [
      {
        id: "side",
        title: "Side sheet",
        when: "The default on wide layouts. Everything secondary lives one slide away and the list behind it stays exactly where the reader left it.",
      },
      {
        id: "bottom",
        title: "Bottom sheet",
        when: "Small screens and touch. The grab handle marks the top edge as material, and the sheet stops well short of the full height so the context stays visible above it.",
      },
      {
        id: "wide",
        title: "Widened",
        when: "When the detail is genuinely two columns wide, such as a diff or a record with a preview. Widen through className rather than reaching for a dialog.",
      },
    ],
  },
  {
    slug: "minimilist-popover",
    name: "Popover",
    category: "Overlays",
    summary: "A small anchored surface that scales out of its own trigger.",
    description:
      "Anchored to the control that opened it and dismissed by Escape or a pointer down outside. The transform origin is taken from the placement, so the panel appears to grow out of the trigger edge rather than fade in over it, which is what keeps the relationship between control and surface obvious. Popover is the plain container; PopupTip is the packaged version for a paragraph of explanation behind an info glyph.",
    whereToUse: [
      "Small tasks that belong to a control: share, filter, quick settings.",
      "Detail on touch surfaces, where hover does not exist, through PopupTip.",
      "Never for a few words naming a control; that is a tooltip, and it needs no JavaScript at all.",
    ],
    variants: [
      {
        id: "default",
        title: "Anchored panel",
        when: "The default. A handful of controls that belong to the trigger and would clutter the toolbar if they lived there permanently.",
      },
      {
        id: "placement",
        title: "Side and alignment",
        when: "When the trigger sits near an edge. Flip the side so the panel opens into the page, and align it to the edge the trigger is closest to.",
      },
      {
        id: "tip",
        title: "Popup tip",
        when: "A sentence or two of explanation behind an info glyph. Reach for this instead of a tooltip whenever the surface is touch-first or the text runs past a few words.",
      },
      {
        id: "controlled",
        title: "Controlled",
        when: "When something other than the trigger has to open or close the panel, such as a keyboard shortcut or a step in a walkthrough. Pass open and onOpenChange and the popover stops managing its own state.",
      },
    ],
  },
  {
    slug: "minimilist-tooltip",
    name: "Tooltip",
    category: "Overlays",
    summary: "A stripped label handed back on hover or focus.",
    description:
      "Driven entirely by CSS, so it renders on the server and costs nothing at runtime. The bubble is hidden from assistive technology on purpose: an icon-only control already carries its name in aria-label, and the tooltip exists to give that name back to sighted readers rather than announce it twice. It holds a label, never a paragraph.",
    whereToUse: [
      "Naming a control whose label was stripped for space.",
      "Expanding an abbreviation or a truncated value without changing the layout.",
      "Never on an IconButton, which already wraps one, and never on touch-first surfaces; PopupTip is the tap-to-reveal version.",
    ],
    variants: [
      {
        id: "default",
        title: "Above the trigger",
        when: "The default. Above works everywhere except the top edge of a scroll container, where the bubble would be clipped.",
      },
      {
        id: "side",
        title: "Below the trigger",
        when: "For triggers in a header or along the top of a panel, where an upward bubble would sit off screen.",
      },
      {
        id: "truncation",
        title: "On truncated text",
        when: "When a value is clipped to fit a column. The tooltip returns the full string on hover without letting the column reflow.",
      },
    ],
  },
  {
    slug: "minimilist-lightbox",
    name: "Lightbox",
    category: "Overlays",
    summary: "Media that expands out of its own thumbnail in one continuous morph.",
    description:
      "The thumbnail and the expanded view share a layout id, so opening moves the artwork across the screen rather than cutting to a copy of it. That continuity is the point: the reader never loses track of which item they opened, which matters most in a grid where every thumbnail looks alike. Escape, the scrim, or a click on the artwork closes it back into the thumb.",
    whereToUse: [
      "Image and media grids where the detail only matters at full size.",
      "Covers, screenshots, and diagrams inside documentation and detail panels.",
      "Never for anything the reader has to act on; the expanded view holds no controls, so it is for looking and nothing else.",
    ],
    variants: [
      {
        id: "default",
        title: "Single thumbnail",
        when: "One piece of media inside a page or a panel. The thumbnail is the trigger, which is what makes the morph legible.",
      },
      {
        id: "grid",
        title: "In a grid",
        when: "Several thumbnails side by side. Each one keeps its own layout id, so the expanded view always comes from the tile the reader actually clicked.",
      },
      {
        id: "thumb",
        title: "Custom thumb",
        when: "When the thumbnail has to match its surroundings, such as a wide banner or a dense grid tile. Size the thumb through thumbClassName and the morph adapts to whatever shape you give it.",
      },
    ],
  },

  /* Display -------------------------------------------------------------- */
  {
    slug: "minimilist-chip",
    name: "Chip",
    category: "Display",
    summary: "An enumerated value, always rendered as a chip rather than as text.",
    description:
      "Status, role, tier, and category are enumerations, and enumerations get chips so the eye can pick them out of a row of prose. Status tones mean status and nothing else, while identity tones attach to a data type across the whole app and never to one record's mood. A chip settles in when it appears and crossfades when its tone changes, because a value arriving on a row is a change worth noticing.",
    whereToUse: [
      "Status, state, and lifecycle values on rows, cards, and detail panels.",
      "Type and ownership markers, where one identity tone stands for one kind of thing everywhere.",
      "Never for a count, which is a badge, and never for a free-text value, which is just text.",
    ],
    variants: [
      {
        id: "status",
        title: "Status tones",
        when: "Health and outcome: passing, degraded, failed. These three tones are spoken for, so never borrow them for a category.",
      },
      {
        id: "identity",
        title: "Identity tones",
        when: "Teams, projects, labels, anything where one tone should mean one thing app-wide. Assign the tone to the data type once and never per instance.",
      },
      {
        id: "outline",
        title: "Outline",
        when: "When a row already carries a tinted chip and a second one would compete. The outline reads as the quieter of the two without giving up the shape.",
      },
      {
        id: "row",
        title: "In a list",
        when: "The everyday case. Aligned down the trailing edge of a list, chips turn a column of statuses into something scannable without a table.",
      },
    ],
  },
  {
    slug: "minimilist-carousel",
    name: "Carousel",
    category: "Display",
    summary: "Panes that drag with elastic feel and snap to the nearest slide.",
    description:
      "Drag it, throw it, or click a dot: the panes settle on the nearest slide either way, and the active pager dot stretches into a pill and slides between positions instead of repainting. Panes that are off screen are hidden from assistive technology, so a screen reader gets the current slide rather than the whole deck at once.",
    whereToUse: [
      "Small sets of equal-weight media: screenshots, covers, templates.",
      "Onboarding, where three or four panes is the whole story.",
      "Never for content the reader must not miss, and never past about five panes; that is a list or a grid.",
    ],
    variants: [
      {
        id: "default",
        title: "Media panes",
        when: "The default. Equal-weight images where the point is to browse rather than to compare.",
      },
      {
        id: "content",
        title: "Content panes",
        when: "When the panes carry text instead of media. Keep every pane the same height, because a carousel that changes height on each slide moves the page under the reader.",
      },
    ],
  },
  {
    slug: "minimilist-scroll-area",
    name: "Scroll area",
    category: "Display",
    summary: "A scoped scroll region with a hairline thumb that sleeps when you stop.",
    description:
      "The native scrollbar is hidden and replaced with an overlay thumb that fades in while scrolling and sleeps a beat later, so a nested panel carries no permanent chrome. Wheel input inside the area is eased for momentum, and that momentum honours prefers-reduced-motion and the app-level motion switch, which makes smoothness a preference rather than a rule.",
    whereToUse: [
      "Nested regions with their own scroll: sidebars, option lists, panel bodies, chat history.",
      "Any pane whose scrollbar would otherwise draw a permanent grey stripe through a quiet layout.",
      "Never for the page itself; the document scrollbar is the one the reader's browser already gave them.",
    ],
    variants: [
      {
        id: "default",
        title: "With momentum",
        when: "The default. Eased wheel input inside the area, which makes a short nested list feel like a surface rather than a clipped box.",
      },
      {
        id: "plain",
        title: "Without momentum",
        when: "Inside a region that already scrolls under something else, or wherever eased wheel input would fight a virtualised list. The overlay thumb stays either way.",
      },
    ],
  },
  {
    slug: "minimilist-timeline",
    name: "Timeline",
    category: "Display",
    summary: "Chronology on an open list, with the spine drawn by your own scroll.",
    description:
      "Each segment of the connecting line fills with ink as its event crosses the lower third of the viewport, and the marker wakes from faded to full in step with it. The motion is scrubbed by the reader's scroll rather than played on a timer, so it is noticeable but never something to wait for, and it reverses honestly when the reader scrolls back up.",
    whereToUse: [
      "Activity feeds, audit trails, and release histories, where the order is the meaning.",
      "Detail panels, where recent history explains the state the reader is looking at.",
      "Never for steps a reader has to complete; that ordering is a stepper, not a record of what happened.",
    ],
    variants: [
      {
        id: "default",
        title: "Icons, times, and detail",
        when: "The full shape. Give each event a glyph for its kind so the column scans by type, and add a detail line only where the title leaves a real question.",
      },
      {
        id: "minimal",
        title: "Titles only",
        when: "Narrow panels and long histories. Without icons every marker falls back to a structural ring, which keeps the spine readable at any width.",
      },
    ],
  },
  {
    slug: "minimilist-property-list",
    name: "Property list",
    category: "Display",
    summary: "Definition rows on the open canvas, with unset values as the add affordance.",
    description:
      "A property panel with no card, no table, and no rules: a fixed label column and a value column, held together by alignment alone. Unset values render muted and are themselves the click target, so completeness is incremental instead of something a form demands up front. Values drawn from a fixed set take a menu and get edited where they sit.",
    whereToUse: [
      "Detail panels beside an object: state, owner, dates, tags, environment.",
      "Anywhere a form would ask for everything at once when the reader only knows half of it.",
      "Never for the same fields across many records; comparing rows is a table's job, not a property list's.",
    ],
    variants: [
      {
        id: "menus",
        title: "Editable through menus",
        when: "Any property whose values are a known set. The value becomes its own dropdown trigger, so editing costs one click and never leaves the panel.",
      },
      {
        id: "unset",
        title: "Unset values",
        when: "A freshly created object. Muted placeholders name what could be filled in without implying that anything is missing, and the add control at the header covers properties that do not exist yet.",
      },
      {
        id: "static",
        title: "Read-only summary",
        when: "When the panel reports rather than edits, such as a deployment record. Drop the handlers and the rows lose their affordances instead of pretending to be clickable.",
      },
    ],
  },

  /* Patterns ------------------------------------------------------------- */
  {
    slug: "minimilist-composer",
    name: "Composer",
    category: "Patterns",
    summary: "Object creation as one input, with everything else optional.",
    description:
      "The inline creation form: one mandatory title, a description line, and every property as a quiet pill menu rather than a labelled field. Create stays disabled until the title has content and nothing else gates it, so an object can exist a second after the thought does. Suggestions sit one click away for the case where the reader knows they want something but not what to call it.",
    whereToUse: [
      "Issue, task, and document creation, in place of a New button that navigates away.",
      "Any object whose properties can honestly be filled in after it exists.",
      "Never for a form with real validation across several required fields; that needs a page and proper error handling.",
    ],
    variants: [
      {
        id: "default",
        title: "Standard",
        when: "The default. One team, one suggestion, and every property optional behind a pill.",
      },
      {
        id: "suggestions",
        title: "With suggestions",
        when: "When the surface can propose plausible titles from context. Keep the list to three, because a wall of suggestions is a decision rather than a shortcut.",
      },
      {
        id: "inline",
        title: "Opened in place",
        when: "Inside a list the reader is adding to. The composer replaces the add control at the exact spot the new object will appear, and cancelling puts the control back.",
      },
    ],
  },
  {
    slug: "minimilist-chat",
    name: "Chat window",
    category: "Patterns",
    summary: "A floating assistant that materialises out of its own corner.",
    description:
      "It scales and unblurs together out of the bottom right, opens on suggestion pills rather than an empty box, and streams its reply character by character. Assistant text sits naked on the canvas and only the human's words get a surface, which is the inversion that keeps a long answer from reading as a wall of bubbles.",
    whereToUse: [
      "An assistant that should stay reachable while the reader keeps working on the page behind it.",
      "Support and copilot surfaces bolted onto an existing product.",
      "Never as the main surface of an assistant-first product; that conversation deserves the whole viewport.",
    ],
    variants: [
      {
        id: "default",
        title: "Standard",
        when: "The default window. Empty state, suggestion pills, streaming reply, and a context chip above the input.",
      },
      {
        id: "context",
        title: "Scoped to a context",
        when: "When the assistant answers about one project or document. Name it in the title and the context chip so the reader can see the scope without asking what the assistant can see.",
      },
    ],
  },
];
