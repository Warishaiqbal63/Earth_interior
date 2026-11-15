import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Earth Interior | Kitchens and Custom Furniture",
    template: "%s | Earth Interior",
  },
  description:
    "Modern kitchens, wardrobes and custom furniture, designed and installed to your size and budget.",
};

export const viewport: Viewport = {
  themeColor: "#1f5c4a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
