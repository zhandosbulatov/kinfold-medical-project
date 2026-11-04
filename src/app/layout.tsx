import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Fraunces } from "next/font/google";
import "./globals.css";

const body = Atkinson_Hyperlegible_Next({
  variable: "--font-body",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display-face",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kinfold — know Mom took her pills",
    template: "%s · Kinfold",
  },
  description:
    "Kinfold reads Mom's pill bottles, reminds her, and tells you and your siblings when a dose is missed. Mom doesn't set up anything.",
};

export const viewport: Viewport = {
  themeColor: "#f8f4ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
