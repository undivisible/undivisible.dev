import type { Metadata } from "next";
import LabSentence from "@/page-components/lab-sentence";

export const metadata: Metadata = {
  title: "sentence · layout study · undivisible.dev",
  description: "A layout study for undivisible.dev — sentence.",
};

export default function Page() {
  return <LabSentence />;
}
