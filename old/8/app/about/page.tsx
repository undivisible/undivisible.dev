import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "artificer, architect, generalist.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Max Carter",
    description: "artificer, architect, generalist.",
    url: "https://undivisible.dev/about",
  },
};

export default function About() {
  return null;
}
