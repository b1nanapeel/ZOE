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

export const metadata: Metadata = {
  title: "ZOE — See what your child is telling you",
  description:
    "Behavioral documentation and pattern intelligence for families of nonverbal and minimally verbal autistic children.",
  applicationName: "ZOE",
  appleWebApp: {
    capable: true,
    title: "ZOE",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#22c55e",
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
