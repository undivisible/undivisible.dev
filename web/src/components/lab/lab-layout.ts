import type { LabSlug } from "@/data/lab-facts";

/**
 * Every layout takes the same prop: how to move to another one. Routes leave
 * it undefined and the switcher navigates; the share build passes a setter so
 * the switch happens in place.
 */
export type LabLayoutProps = {
  onSelect?: (slug: LabSlug) => void;
};
