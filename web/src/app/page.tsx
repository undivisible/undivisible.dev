import type { Metadata } from "next";
import Home from "@/page-components/home";

const title = "undivisible.dev";
const description = "Max Carter — software systems builder.";
const image = {
  url: "https://undivisible.dev/og/home.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Max Carter’s integrated ASCII banner with his homepage introduction and project links.",
};

export const metadata: Metadata = {
  openGraph: {
    title,
    description,
    type: "website",
    url: "https://undivisible.dev/",
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [{ url: image.url, alt: image.alt }],
  },
};

export default function Page() {
  return <Home />;
}
