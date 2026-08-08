import type { Metadata } from "next";
import LabMargin from "@/page-components/lab-margin";

export const metadata: Metadata = {
  title: "margin · layout study · undivisible.dev",
  description: "A layout study for undivisible.dev — margin.",
};

export default function Page() {
  return <LabMargin />;
}
