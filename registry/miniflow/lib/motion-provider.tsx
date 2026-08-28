"use client";

import * as React from "react";
import { MotionConfig } from "motion/react";

/*
 * The floor under every animation in the library.
 *
 * `globals.css` already zeroes CSS transitions and CSS keyframes for a reader
 * who has asked for reduced motion, but that rule cannot reach Motion: Motion
 * animates by writing inline styles frame by frame, so it is neither a CSS
 * transition nor a CSS animation and no stylesheet can turn it off. Without
 * this provider, the preference is silently ignored by every component that
 * does not call `useMotionEnabled` by hand -- which was most of them.
 *
 * `reducedMotion="user"` strips transform and layout animation (the part that
 * causes trouble) while leaving opacity and colour intact, so a dialog still
 * fades rather than teleporting. Reduced motion means less movement, not a
 * dead interface.
 *
 * The catch that this component exists to close: `"user"` watches the OS media
 * query and NOTHING else, so the app's own motion switch used to be strictly
 * weaker than the system setting. Flipping it left every Motion-driven
 * transform running -- measured on the select panel, which kept scaling from
 * 0.97 while `data-motion="off"` was set. Promoting the setting to `"always"`
 * while the switch is off makes the two paths behave identically, for every
 * component at once, without any of them opting in.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  /*
   * Starts at "user" and is corrected on mount, for the same reason
   * `useMotionEnabled` starts optimistic: the server cannot know the reader's
   * preference, and a first client render that disagreed with the HTML would
   * be a hydration mismatch. Nothing here decides whether content is visible,
   * so the one-frame correction is invisible.
   */
  const [appSwitchOff, setAppSwitchOff] = React.useState(false);

  React.useEffect(() => {
    const el = document.documentElement;
    const read = () => setAppSwitchOff(el.getAttribute("data-motion") === "off");
    read();
    /* The switch is an attribute on <html> written by the theme script and by
       the header toggle, so an observer is the only way to hear both. */
    const observer = new MutationObserver(read);
    observer.observe(el, { attributes: true, attributeFilter: ["data-motion"] });
    return () => observer.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion={appSwitchOff ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}
