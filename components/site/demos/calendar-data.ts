import { Code, Dumbbell, Megaphone, Palette, Wrench } from "lucide-react";
import type {
  CalendarEvent,
  CalendarResource,
} from "@/registry/miniflow/ui/event-calendar";

/*
 * Sample schedule for the documentation.
 *
 * Everything is derived from an anchor date the demo resolves in the browser,
 * so the specimen always opens on the reader's own week and the now line lands
 * where they expect it. The pattern is deterministic rather than random: the
 * same day always produces the same events, so a screenshot taken twice on the
 * same afternoon matches itself.
 */

export const demoResources: CalendarResource[] = [
  { id: "design", name: "Design studio", detail: "6 seats", icon: Palette },
  { id: "engineering", name: "Focus room", detail: "4 seats", icon: Code },
  { id: "client", name: "Client suite", detail: "12 seats", icon: Megaphone },
  { id: "lab", name: "Hardware lab", detail: "Restricted", icon: Wrench },
  { id: "wellness", name: "Wellness room", detail: "Bookable", icon: Dumbbell },
];

interface Template {
  title: string;
  resourceId: string;
  hour: number;
  minutes: number;
  location?: string;
}

const TEMPLATES: Template[] = [
  { title: "Design critique", resourceId: "design", hour: 10, minutes: 60, location: "Studio A" },
  { title: "Standup", resourceId: "engineering", hour: 9, minutes: 15 },
  { title: "Pairing block", resourceId: "engineering", hour: 14, minutes: 90 },
  { title: "Client walkthrough", resourceId: "client", hour: 11, minutes: 45, location: "Suite 2" },
  { title: "Roadmap sync", resourceId: "client", hour: 15, minutes: 60 },
  { title: "Mobility class", resourceId: "wellness", hour: 8, minutes: 45 },
  { title: "Board bring-up", resourceId: "lab", hour: 13, minutes: 120, location: "Lab 1" },
  { title: "Retro", resourceId: "engineering", hour: 16, minutes: 45 },
  { title: "Interview loop", resourceId: "client", hour: 10, minutes: 30, location: "Suite 1" },
  { title: "Prototype review", resourceId: "design", hour: 13, minutes: 60, location: "Studio B" },
  { title: "Firmware soak", resourceId: "lab", hour: 9, minutes: 180 },
  { title: "Copy pass", resourceId: "design", hour: 15, minutes: 45 },
];

/** Stable per-day spread, so the same date always draws the same schedule. */
function seed(day: Date) {
  return (day.getDate() * 31 + day.getMonth() * 17 + day.getFullYear()) % 97;
}

function at(day: Date, hour: number, minutes: number) {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minutes);
  return start;
}

/**
 * Roughly three months of schedule around `anchor`, so the year view has real
 * density to weigh and paging a month either way never lands on an empty grid.
 */
export function demoEvents(anchor: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const start = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);

  for (let i = 0; i < 120; i += 1) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    const s = seed(day);
    const count = weekend ? s % 2 : 1 + (s % 4);

    for (let n = 0; n < count; n += 1) {
      const template = TEMPLATES[(s + n * 5) % TEMPLATES.length];
      const startsAt = at(day, template.hour, n === 0 ? 0 : 30);
      events.push({
        id: `${day.toISOString().slice(0, 10)}-${n}`,
        title: template.title,
        start: startsAt,
        end: new Date(startsAt.getTime() + template.minutes * 60_000),
        resourceId: template.resourceId,
        location: template.location,
      });
    }
  }

  /* A deliberate pile-up on the anchor day, so overlap packing is visible. */
  const overlaps: Array<[string, string, number, number, number]> = [
    ["Design critique", "design", 10, 0, 90],
    ["Interview loop", "client", 10, 30, 60],
    ["Board bring-up", "lab", 10, 15, 75],
  ];
  overlaps.forEach(([title, resourceId, hour, minute, length], i) => {
    const startsAt = at(anchor, hour, minute);
    events.push({
      id: `anchor-overlap-${i}`,
      title,
      start: startsAt,
      end: new Date(startsAt.getTime() + length * 60_000),
      resourceId,
      location: i === 0 ? "Studio A" : undefined,
    });
  });

  /* One whole-day item, to show the pinned row above the hour grid. */
  const allDay = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  events.push({
    id: "anchor-allday",
    title: "Release freeze",
    start: allDay,
    end: new Date(allDay.getTime() + 86_400_000),
    allDay: true,
    resourceId: "engineering",
  });

  return events;
}
