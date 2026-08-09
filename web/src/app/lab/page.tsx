import type { Metadata } from "next";
import MachineRoot from "@/components/os/MachineRoot";

export const metadata: Metadata = {
  title: "alpenglow · undivisible.dev",
  description:
    "The page is the machine: a real i686 PC emulated in your browser, booting the real Alpenglow Linux, with the site's content as programs on it.",
};

export default function Page() {
  return <MachineRoot />;
}
