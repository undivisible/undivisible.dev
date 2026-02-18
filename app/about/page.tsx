import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Max Carter — Cantonese-Australian polyglot, self-taught developer since age 8, Nasdaq futures trader, and founder of three software startups.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Max Carter",
    description:
      "Cantonese-Australian polyglot, self-taught developer since age 8, Nasdaq futures trader, and founder of three software startups.",
    url: "https://undivisible.dev/about",
  },
};

export default function About() {
  return null;
}
