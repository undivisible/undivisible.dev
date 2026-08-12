import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono, Young_Serif } from "next/font/google";
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

export const metadata: Metadata = {
  title: "undivisible.dev",
  description: "Max Carter — software systems builder.",
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20viewBox%3D%220%200%2032%2032%22%3E%3Ccircle%20cx%3D%2216%22%20cy%3D%2216%22%20r%3D%2210%22%20fill%3D%22%23FFFFFF%22/%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${youngSerif.variable} ${jetBrainsMono.variable} ${instrumentSans.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
