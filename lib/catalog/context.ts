import type { ComponentDoc } from "@/lib/catalog/types";

/*
 * Standing companion surfaces: things that live beside the page rather than
 * inside it, and outlive whatever route the reader is on.
 */
export const contextComponents: ComponentDoc[] = [
  {
    slug: "minimilist-context-bar",
    name: "Context bar",
    category: "Patterns",
    summary: "A rail that keeps live components beside the page, across routes.",
    description:
      "Send a card over and the card itself travels: the instance is owned above the page, so a running timer keeps counting and a draft keeps its text through a keep, a recall, and a route change. It squeezes the page as a rail or floats over it as a translucent panel, groups what it holds into sections with the newest on top, and overlaps the older ones into a stack that fans out on click. Items carry ids, so code can push and remove them, and a reader can drag one out by hand.",
    whereToUse: [
      "Work a reader carries between pages: a timer, a queue, a draft, a running job, a reference they keep glancing at.",
      "Multi-workspace products, where each organisation gets its own bar through named scopes.",
      "Never for navigation, and never for the page's own controls: those belong on the page, where the reader is looking.",
      "Never as a notification feed. Notifications arrive and expire on their own; a toast does that better and asks for nothing.",
    ],
    variants: [
      {
        id: "default",
        title: "Squeezing the page",
        when: "The default posture. The bar is real layout, so opening it narrows the content column and nothing is ever hidden underneath. Reach for it when the page reflows gracefully and both halves deserve to be readable at once.",
      },
      {
        id: "float",
        title: "Floating over the page",
        when: "When the layout underneath cannot afford to lose the width: a canvas, a table, a map. The panel is translucent with the minimal shadow and the page stays live behind it, so the bar reads as resting on top rather than cutting in. Overlapping is the point, so keep the page's own controls out from under it: a floating bar covers whatever is beneath it, including the affordance that sends cards over.",
      },
      {
        id: "sections",
        title: "Sections and stacks",
        when: "Once a bar holds more than a handful of things. Push into a named section and it appears; the newest card is the face of its stack and older ones tuck beneath it, so a busy section costs a few pixels rather than a scroll. Click the stack to fan it out.",
      },
      {
        id: "scopes",
        title: "One bar per workspace",
        when: "When a single application serves several organisations or projects. Each scope owns its own items, and the header switches between them, so nothing from one client's workspace is ever visible while the reader is in another's.",
      },
    ],
  },
];
