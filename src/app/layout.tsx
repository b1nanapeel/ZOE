import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://zoe4all.vercel.app";
const OG_TITLE = "ZOE — Behavioral Intelligence for Autism Families";
const OG_DESCRIPTION =
  "Record, tag, and track your child's behavioral patterns. Share structured summaries with your therapy team. AI-powered. Privacy-first.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ZOE — See what your child is telling you",
  description:
    "Behavioral documentation and pattern intelligence for families of nonverbal and minimally verbal autistic children.",
  applicationName: "ZOE",
  appleWebApp: {
    capable: true,
    title: "ZOE",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    siteName: "ZOE",
    type: "website",
    url: SITE_URL,
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "ZOE — Behavioral Intelligence for Autism Families",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: ["/api/og"],
  },
};

export const viewport = {
  themeColor: "#0f2035",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full font-sans antialiased text-neutral-900 bg-neutral-50">
        {children}
      </body>
    </html>
  );
}
