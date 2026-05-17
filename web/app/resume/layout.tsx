import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Max Carter — Resume",
  description: "Max Carter — resume.",
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
