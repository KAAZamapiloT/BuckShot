import type { Metadata } from "next";
import "./globals.css";
import { MangaShell } from "@/components/MangaShell";

export const metadata: Metadata = {
  title: "BUCKSHOT — Full-Color Manga AI Interview Coach",
  description:
    "Load the Logic. Fire the Proof. Master DSA, Systems, Concurrency, System Design & Frontier AI inside an interactive full-color anime manga book with Sensei Reiko.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-manga-mode="color">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bangers&family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased selection:bg-[#FFC82C] selection:text-[#121218]">
        <MangaShell>{children}</MangaShell>
      </body>
    </html>
  );
}
