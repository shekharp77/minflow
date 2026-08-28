import type { ComponentDoc } from "@/lib/catalog/types";

/*
 * Scheduling surfaces. One entry today, kept apart from the display catalog
 * because a calendar carries far more guidance than a chip does.
 */
export const schedulingComponents: ComponentDoc[] = [
  {
    slug: "minimilist-event-calendar",
    name: "Event calendar",
    category: "Patterns",
    summary: "Seven views of one schedule, from a year down to a single room's day.",
    description:
      "A scheduling calendar that projects the same events onto whichever coordinate system the question needs: a year to see where the pressure is, a month to plan around, a week or a day to work in, an agenda to read down, and two resource views for rooms, people or equipment. Paging animates in the direction of travel so a user keeps their place, and the current time is the one thing wearing the accent, because on a calendar it is always the most important state. Calendars and resources are told apart by their glyph rather than by a colour swatch, which survives dark mode, printing, and colour blindness.",
    wide: true,
    whereToUse: [
      "Booking and operations surfaces where the same events have to be read at several zoom levels, and where a room or a person needs its own lane.",
      "Team planning views: the agenda for a read-down of the week, the timeline for who has which room when.",
      "Never as a date field. Choosing a single date is the date picker's job, and the calendar picker is the one to embed when a month grid is all that is wanted.",
    ],
    variants: [
      {
        id: "default",
        title: "The whole switcher",
        when: "The default. Every view is one press away, grouped into the four calendar ranges and the three schedule views, so a user can move from a year down to a single room without leaving the surface.",
      },
      {
        id: "month",
        title: "Month and year",
        when: "Planning rather than working. The month keeps three items per day with the rest behind a count, and the year weighs each day by how busy it is instead of tinting it, so density reads without spending a colour.",
      },
      {
        id: "agenda",
        title: "Agenda",
        when: "When the schedule is read rather than arranged, and on narrow screens where seven columns stop being legible. Empty days drop out instead of standing as blanks.",
      },
      {
        id: "timeline",
        title: "Resources on a timeline",
        when: "Room and equipment booking: resources are the rows, time runs left to right, and a clash is visible as two bars in the same lane. The resource names stay pinned while the axis scrolls.",
      },
      {
        id: "timeline-week",
        title: "A week of resources",
        when: "The same timeline with a day-wide axis, for occupancy over a week rather than a single afternoon. Reach for it when the question is which days are free, not which hours.",
      },
      {
        id: "resources",
        title: "Resources as columns",
        when: "One day, one column per resource, standing on a shared hour axis. It beats the timeline when the hours matter more than the span, such as comparing a morning across four rooms.",
      },
    ],
  },
];
