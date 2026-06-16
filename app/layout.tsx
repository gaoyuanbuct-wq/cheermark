import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Fredoka, Chewy, Patrick_Hand } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AgentationGuard } from "@/components/AgentationGuard";
import { HappySeedsWatermark } from "@/components/HappySeedsWatermark";
import "./globals.css";
import "./cheermark-themes.css";
import jsonMetadata from "../metadata.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const chewy = Chewy({
  variable: "--font-chewy",
  weight: "400",
  subsets: ["latin"],
});

const patrickHand = Patrick_Hand({
  variable: "--font-patrick-hand",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = jsonMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-page-style="comic" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "production" && (
          <Script
            async
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} ${chewy.variable} ${patrickHand.variable} antialiased`}
      >
        {children}
        <HappySeedsWatermark />
        <AgentationGuard />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
