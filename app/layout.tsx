import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://j3d1.fm"),
  title: "J3D1.FM — Signal Over Noise",
  description:
    "An independent frequency for products, games and applied AI.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "J3D1.FM — Signal Over Noise",
    description:
      "An independent frequency for products, games and applied AI.",
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
    description:
      "An independent frequency for products, games and applied AI.",
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
      <body>{children}</body>
    </html>
  );
}
