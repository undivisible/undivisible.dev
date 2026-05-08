import type { Metadata } from "next";
import {
  Chivo_Mono,
  Instrument_Sans,
  Instrument_Serif,
  JetBrains_Mono,
  Young_Serif,
} from "next/font/google";
import "@/index.css";

const youngSerif = Young_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-young-serif",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-instrument-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

const chivoMono = Chivo_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-chivo-mono",
});

export const metadata: Metadata = {
  title: "undivisible.dev",
  description: "Max Carter — software systems builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${youngSerif.variable} ${jetBrainsMono.variable} ${instrumentSans.variable} ${instrumentSerif.variable} ${chivoMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
