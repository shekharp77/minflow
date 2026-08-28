"use client";

import * as React from "react";
import {
  EventCalendar,
  startOfDay,
  type EventCalendarProps,
} from "@/registry/miniflow/ui/event-calendar";
import { demoEvents, demoResources } from "@/components/site/demos/calendar-data";
import type { DemoSet } from "@/components/site/demos/types";

/*
 * Every specimen opens on the reader's own week.
 *
 * The anchor is resolved in an effect rather than at render, because this page
 * is pre-rendered: reading the clock during the server pass would bake the
 * build date into the HTML and disagree with the browser a moment later. The
 * reserved height means the swap costs no layout shift.
 */
function Schedule(props: Partial<EventCalendarProps>) {
  const [anchor, setAnchor] = React.useState<Date | null>(null);

  React.useEffect(() => setAnchor(startOfDay(new Date())), []);

  const events = React.useMemo(() => (anchor ? demoEvents(anchor) : []), [anchor]);

  if (!anchor) return <div className="min-h-[28rem] w-full" aria-busy="true" />;

  return (
    <EventCalendar
      events={events}
      resources={demoResources}
      initialDate={anchor}
      className="w-full"
      {...props}
    />
  );
}

export const schedulingDemos: DemoSet = {
  "minimilist-event-calendar": {
    default: <Schedule initialView="week" />,
    month: <Schedule initialView="month" views={["month", "year"]} />,
    agenda: <Schedule initialView="agenda" views={["agenda", "day"]} />,
    timeline: (
      <Schedule initialView="timeline" views={["timeline", "resources"]} />
    ),
    "timeline-week": (
      <Schedule initialView="timeline" views={["timeline"]} timelineUnit="day" />
    ),
    resources: (
      <Schedule initialView="resources" views={["resources", "timeline"]} />
    ),
  },
};
