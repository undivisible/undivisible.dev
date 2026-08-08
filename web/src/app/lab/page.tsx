import type { Metadata } from "next";
import LabAlmanac from "@/page-components/lab-almanac";

export const metadata: Metadata = {
  title: "almanac · undivisible.dev redesign",
  description:
    "The redesign proposal: the site as a daily almanac — sun, weather, music, shipped work, and the route so far.",
};

export default function Page() {
  return <LabAlmanac />;
}
