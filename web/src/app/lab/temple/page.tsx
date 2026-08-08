import type { Metadata } from "next";
import LabTemple from "@/page-components/lab-temple";

export const metadata: Metadata = {
  title: "temple · layout study · undivisible.dev",
  description: "A layout study for undivisible.dev — temple.",
};

export default function Page() {
  return <LabTemple />;
}
