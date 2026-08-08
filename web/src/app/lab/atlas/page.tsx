import type { Metadata } from "next";
import LabAtlas from "@/page-components/lab-atlas";

export const metadata: Metadata = {
  title: "atlas · layout study · undivisible.dev",
  description: "A layout study for undivisible.dev — atlas.",
};

export default function Page() {
  return <LabAtlas />;
}
