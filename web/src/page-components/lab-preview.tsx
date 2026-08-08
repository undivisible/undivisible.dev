"use client";

import { useState } from "react";
import LabAtlas from "@/page-components/lab-atlas";
import LabMargin from "@/page-components/lab-margin";
import LabSentence from "@/page-components/lab-sentence";
import type { LabSlug } from "@/data/lab-facts";

const LAYOUTS = {
  margin: LabMargin,
  sentence: LabSentence,
  atlas: LabAtlas,
} as const;

/**
 * All three studies behind one switcher, swapping without navigation.
 *
 * This is the route that gets bundled into a single shareable file: the
 * per-layout routes link to each other, which resolves to nothing once the
 * page is lifted out of the site.
 */
export default function LabPreview() {
  const [slug, setSlug] = useState<LabSlug>("margin");
  const Layout = LAYOUTS[slug];
  return <Layout onSelect={setSlug} />;
}
