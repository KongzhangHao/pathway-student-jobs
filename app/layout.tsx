import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Pathway | Find the work that fits you",
  description: "Smart, explainable job matching and tailored applications for university students.",
  openGraph: {
    title: "Pathway | Find the work that fits you",
    description: "Explainable job matches and tailored applications for university students.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Pathway student job matching" }]
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
