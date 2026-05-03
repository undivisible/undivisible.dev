import type { Metadata } from "next";
import "../src/index.css";

export const metadata: Metadata = {
  title: "undivisible.dev",
  description: "max carter — i make things for people",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
