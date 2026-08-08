import type { Metadata } from "next";
import LabSignal from "@/page-components/lab-signal";

export const metadata: Metadata = {
  title: "signal · layout study · undivisible.dev",
  description: "A layout study for undivisible.dev — signal.",
};

export default function Page() {
  return <LabSignal />;
}
