import type { Metadata } from "next";
import LabLedger from "@/page-components/lab-ledger";

export const metadata: Metadata = {
  title: "ledger · layout study · undivisible.dev",
  description: "A layout study for undivisible.dev — ledger.",
};

export default function Page() {
  return <LabLedger />;
}
