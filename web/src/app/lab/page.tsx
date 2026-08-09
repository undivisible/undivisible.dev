import type { Metadata } from "next";
import OsRoot from "@/components/os/OsRoot";

export const metadata: Metadata = {
  title: "alpenglow · undivisible.dev",
  description:
    "The site as the operating system it keeps talking about — alpenglow underneath, alpenglowed on top, everything preinstalled.",
};

export default function Page() {
  return <OsRoot />;
}
