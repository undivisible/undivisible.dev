import type { Metadata } from "next";
import LabPage from "@/components/os/LabPage";

export const metadata: Metadata = {
  title: "Alpenglow · Max Carter",
  description: "Alpenglow Linux running in your browser with v86.",
};

export default function Page() {
  return <LabPage />;
}
