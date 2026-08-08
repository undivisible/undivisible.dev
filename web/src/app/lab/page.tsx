import type { Metadata } from "next";
import LabPreview from "@/page-components/lab-preview";

export const metadata: Metadata = {
  title: "layout studies · undivisible.dev",
  description: "Three redesign layouts for undivisible.dev, same content.",
};

export default function Page() {
  return <LabPreview />;
}
