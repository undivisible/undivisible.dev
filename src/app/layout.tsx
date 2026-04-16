import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "Max Carter | undivisible.dev",
    template: "%s | undivisible.dev",
  },
  description: "Max Carter — Making things for people.",
  keywords: [
    "max carter",
    "undivisible",
    "software developer",
    "full stack developer",
    "entrepreneur",
    "crepuscularity",
    "crepuscularity lite",
    "unthinkmail",
    "unthinkclaw",
    "alphabets",
    "equilibrium",
    "wax",
    "otto",
    "tile",
    "drift",
    "bublik",
    "anywhere",
    "poke around",
    "infrastruct",
    "rust developer",
    "go developer",
    "swift developer",
    "javascript developer",
    "typescript developer",
    "svelte developer",
    "next.js developer",
    "react developer",
    "node.js developer",
  ],
  authors: [{ name: "Max Carter", url: "https://undivisible.dev" }],
  creator: "Max Carter",
  metadataBase: new URL("https://undivisible.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Max Carter | Making things for people.",
    description: "artificer, architect, generalist.",
    url: "https://undivisible.dev",
    siteName: "undivisible.dev",
    locale: "en_AU",
    type: "website",
    images: [
      {
        url: "/banner.png",
        width: 3000,
        height: 1000,
        alt: "Max Carter - undivisible.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Max Carter | Making things for people",
    description: "artificer, architect, generalist.",
    images: ["/banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-mono", jetbrainsMono.variable, "overflow-y-hidden")}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
