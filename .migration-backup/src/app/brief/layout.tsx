import type { Metadata } from "next";
import "./brief.css";

export const metadata: Metadata = {
  title: "Max Carter — Builder",
  description: "Software engineer building the unthought of. Operating systems, AI agents, eCommerce, and everything in between.",
};

export default function BriefLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&family=Chivo+Mono:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
