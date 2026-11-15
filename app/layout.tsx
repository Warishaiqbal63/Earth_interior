import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Earth Interior | Custom Furniture Made in Lahore",
    template: "%s | Earth Interior",
  },
  description:
    "Made-to-order furniture built in our Lahore workshop: sofas, beds, dining sets, wardrobes and office furniture in your size, wood and fabric.",
};

export const viewport: Viewport = {
  themeColor: "#1f5c4a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
