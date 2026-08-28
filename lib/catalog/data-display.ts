import type { ComponentDoc } from "@/lib/catalog/types";

/*
 * Display components: things that present content rather than collect it.
 *
 * Several of these are the library's answer to a pattern that normally arrives
 * wrapped in chrome - a table with gridlines, a gallery with framed tiles, a
 * terminal with fake window furniture. The entries say so explicitly, because
 * "where the box went" is the first question a reader has.
 */
export const dataDisplayComponents: ComponentDoc[] = [
  {
    slug: "minimilist-avatar",
    name: "Avatar",
    category: "Display",
    summary: "A person as two letters and a colour derived from their name.",
    description:
      "An avatar answers one question - whose is this - and it has to answer it at 20 pixels. Initials do that reliably where a photograph does not, so initials are the base state and a photo is an enhancement layered over them. The tint is computed from the name rather than passed in, which means one person is the same colour in every list in the app without anybody maintaining a mapping, and because it draws from the palette's identity tones, a custom theme restyles every avatar for free.",
    whereToUse: [
      "Assignees, authors, participants, and anywhere a name is repeated down a list.",
      "Stacked into a group when a row needs to show who is involved without spending a line on it.",
      "Not as decoration next to a name that is already spelled out in full - that is two of the same signal.",
    ],
    variants: [
      {
        id: "sizes",
        title: "Sizes",
        when: "Four sizes and no more. 20 and 24 are for inline and dense rows, 32 is the default, 40 is for a profile header.",
      },
      {
        id: "status",
        title: "Presence",
        when: "When availability changes what someone will do next - assigning work, starting a call. Leave it off when presence is not actionable, because a permanent dot stops being read.",
      },
      {
        id: "group",
        title: "Group",
        when: "Several people in the space of one. The stack opens on hover, so the overlap never permanently hides anybody, and the overflow collapses into a count.",
      },
      {
        id: "image",
        title: "With a photograph",
        when: "When you actually have one. Initials stay underneath, so a slow or broken image degrades to a readable avatar rather than an empty hole.",
      },
    ],
  },
  {
    slug: "minimilist-terminal",
    name: "Terminal",
    category: "Display",
    summary: "A command-line transcript that types itself out.",
    description:
      "A terminal in a product page is usually a still image of a command, which asks the reader to imagine the part that matters: the pause between typing a command and getting an answer. This one plays. Commands type a character at a time, output arrives as a block the way it really does, and the prompt keeps blinking at the end so the session reads as alive rather than finished. The macOS window furniture is gone - three coloured dots carry no information - and what is left tells you what you typed and what the machine said.",
    whereToUse: [
      "Install instructions, CLI documentation, and any flow whose real interface is a shell.",
      "Landing pages, where watching a command run explains a tool faster than a paragraph about it.",
      "Not for a single copyable command - that is a copy line, and animating it just delays the copy.",
    ],
    variants: [
      {
        id: "session",
        title: "Playing session",
        when: "The default. Use it when the sequence is the point: what you run, what comes back, what you run next.",
      },
      {
        id: "static",
        title: "Already finished",
        when: "Reference output a reader will scan rather than watch, and the state everyone sees when motion is switched off.",
      },
      {
        id: "failure",
        title: "Failure and recovery",
        when: "Showing a real error and the command that fixes it. Error lines take the status colour; nothing else in the transcript is coloured, so the failure is the only thing that stands out.",
      },
    ],
  },
  {
    slug: "minimilist-device-mockup",
    name: "Device mockup",
    category: "Display",
    summary: "Phone, tablet, and browser frames for showing an interface in context.",
    description:
      "This is the one component in the library that draws a box on purpose. Everywhere else an outline would be grouping content it has no business grouping; here the outline is the content - it is what says 'phone', and without it a screenshot is just a screenshot. So the bezel is a hairline and nothing else survives unless it carries meaning: the status bar makes it a phone, the address pill makes it a browser, the home indicator makes it a modern one. No glass gradients, no drop shadows, no coloured window dots.",
    whereToUse: [
      "Marketing and documentation, where a screen needs to be identifiable as mobile or desktop at a glance.",
      "Design review, to check a layout inside a realistic frame and aspect ratio rather than a browser window.",
      "Not as a wrapper around a live app on a real device - the frame is a picture of hardware, and doubling it is noise.",
    ],
    variants: [
      {
        id: "phone",
        title: "Phone",
        when: "Anything whose primary surface is mobile. The 9:19.5 ratio and the status bar do the identifying, so the content inside needs no explanation.",
      },
      {
        id: "browser",
        title: "Browser",
        when: "Web products, where the address is worth showing. The pill is the only chrome, because a URL is information and window dots are not.",
      },
      {
        id: "tablet",
        title: "Tablet",
        when: "Layouts that only make sense at a middle width - split views, canvases, anything that is neither phone nor desktop.",
      },
    ],
  },
  {
    slug: "minimilist-list",
    name: "List",
    category: "Display",
    summary: "A run of records separated by space instead of rules.",
    description:
      "A list is the most common thing in an interface and the easiest to over-build. There are no rules between these rows: the leading column lining up and the space each row is given is enough for the eye, and it leaves the page quiet enough that the content is what you notice. The hover fill only appears on rows that actually do something, so hovering tells you truthfully whether there is anything to click.",
    whereToUse: [
      "Inboxes, search results, settings, notifications - any vertical run of records.",
      "Dense mode when the list is long and being scanned rather than read.",
      "Reach for Data table instead once rows need to be compared column by column.",
    ],
    variants: [
      {
        id: "default",
        title: "With supporting text",
        when: "The standard row: a leading glyph, a title, one supporting line, and meta on the right. Two lines is the ceiling - a third turns a list into a table.",
      },
      {
        id: "dense",
        title: "Dense",
        when: "Long lists that get scanned. Titles only, tighter rows, and no supporting line to slow the eye down.",
      },
      {
        id: "interactive",
        title: "Selectable",
        when: "When a row is a destination or a choice. The selected row takes a fill rather than a check, because the fill also survives being scrolled past and glanced at.",
      },
    ],
  },
  {
    slug: "minimilist-data-table",
    name: "Data table",
    category: "Display",
    summary: "Tabular data held together by alignment rather than gridlines.",
    description:
      "Once the columns line up, the lines between them are redundant - so they are gone, along with the zebra striping and the outer border. What replaces them is discipline: numeric columns are right aligned and set in tabular figures, so the digits form their own vertical rule. Sorting animates by row identity, which means a re-sort is rows travelling to new positions rather than the whole block blinking and redrawing, and it stays possible to follow one row through the change.",
    whereToUse: [
      "Anywhere values need comparing down a column: usage, billing, metrics, inventory.",
      "With sortable headers when the interesting question is 'which is the largest', not 'what is in row four'.",
      "Reach for List instead when rows are read one at a time and never compared.",
    ],
    variants: [
      {
        id: "sortable",
        title: "Sortable",
        when: "The default for numeric data. Only the active column shows its caret, and the caret rotates between directions rather than being swapped out.",
      },
      {
        id: "plain",
        title: "Read-only",
        when: "Short, fixed sets where sorting would be theatre - a summary, a comparison of three plans, a set of totals.",
      },
    ],
  },
  {
    slug: "minimilist-image-list",
    name: "Image list",
    category: "Display",
    summary: "A wall of images in either a uniform grid or true masonry.",
    description:
      "The choice between the two layouts is the whole design decision. A grid crops every tile to one ratio, which is right when the set is being compared and wrong when the images are the content; masonry keeps each image's own proportions, which is the opposite trade. Tiles fade in as they decode rather than on mount, so a slow image arrives gracefully instead of snapping in after its neighbours have settled, and captions stay out of the way until hover.",
    whereToUse: [
      "Galleries, moodboards, asset pickers, and media libraries.",
      "Masonry when the images vary in shape and cropping would lose the subject.",
      "Not for a set of two or three - at that size a grid is just three images with extra rules.",
    ],
    variants: [
      {
        id: "grid",
        title: "Uniform grid",
        when: "Comparable items - avatars, thumbnails, product shots. One ratio makes the set scannable and the differences between tiles legible.",
      },
      {
        id: "masonry",
        title: "Masonry",
        when: "Photography and artwork, where cropping to a square would throw away the composition.",
      },
    ],
  },
  {
    slug: "minimilist-typography",
    name: "Typography",
    category: "Display",
    summary: "Six sizes, two faces, and a component that keeps them honest.",
    description:
      "Six sizes is the entire scale, and the shortness is the point: every extra size is one more decision, and on a quiet page hierarchy comes from weight and colour long before it comes from size. When in doubt, take the smaller one. The component separates the three things that usually get tangled - size, colour, and element - so a visually small heading can still be an h2 and the document outline survives the design.",
    whereToUse: [
      "Everywhere. This is the scale the rest of the library is built on.",
      "Whenever a heading needs to look smaller than its level - set the element with `as` and the size with `variant`.",
      "Not as a replacement for semantic HTML: this styles an element, it does not choose one for you.",
    ],
    variants: [
      {
        id: "scale",
        title: "The scale",
        when: "The whole vocabulary in one place, for design review and for deciding which step a new piece of text belongs on.",
      },
      {
        id: "tones",
        title: "Tones",
        when: "Colour as hierarchy. Muted is for anything supporting; the status tones are reserved for status and never used decoratively.",
      },
    ],
  },
];
