import type { Metadata } from "next";
import LabPage from "@/components/os/LabPage";

export const metadata: Metadata = {
  title: "Alpenglow lab · Max Carter",
  description:
    "An optional Linux desktop experiment running in your browser with v86.",
};

export default function Page() {
  return <LabPage />;
}
