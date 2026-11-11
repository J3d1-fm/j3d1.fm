import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const grotesk = localFont({
  src: "./fonts/space-grotesk.woff2",
  variable: "--font-grotesk",
  weight: "300 700",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/jetbrains-mono.woff2",
  variable: "--font-mono",
  weight: "400 700",
  display: "swap",
});

const description = "J3D1.FM is an independent frequency: signal over noise.";

export const metadata: Metadata = {
  metadataBase: new URL("https://j3d1.fm"),
  title: "J3D1.FM — Signal Over Noise",
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "J3D1.FM — Signal Over Noise",
    description,
    url: "https://j3d1.fm",
    siteName: "J3D1.FM",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "J3D1.FM — Signal Over Noise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "J3D1.FM — Signal Over Noise",
    description,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${grotesk.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
