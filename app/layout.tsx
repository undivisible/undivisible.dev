import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/SiteShell";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Max Carter | undivisible.dev",
    template: "%s | undivisible.dev",
  },
  description: "Max Carter — Making things for people.",
  keywords: [
    "Max Carter",
    "undivisible",
    "software developer",
    "full stack developer",
    "entrepreneur",
    "Soliloquy",
    "Atmosphere",
    "Graft AI",
    "Pava",
    "Subspace",
    "Rust developer",
    "Go developer",
  ],
  authors: [{ name: "Max Carter", url: "https://undivisible.dev" }],
  creator: "Max Carter",
  metadataBase: new URL("https://undivisible.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Max Carter | Making things for people.",
    description:
      "Cantonese-Australian serial entrepreneur and software developer. Building atechnology.company, graftai.com.au and pava.studio.",
    url: "https://undivisible.dev",
    siteName: "undivisible.dev",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Max Carter | Making things for people",
    description:
      "Cantonese-Australian serial entrepreneur and software developer. Building atechnology.company, graftai.com.au and pava.studio.",
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
    <html lang="en">
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <SiteShell />
        {children}
      </body>
    </html>
  );
}
