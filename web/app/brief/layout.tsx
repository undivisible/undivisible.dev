import type { Metadata } from "next";
import "./brief.css";

export const metadata: Metadata = {
  title: "Max Carter — Services Brief",
  description:
    "Software engineer building the unthought of. Operating systems, AI agents, eCommerce, and everything in between.",
};

export default function BriefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
