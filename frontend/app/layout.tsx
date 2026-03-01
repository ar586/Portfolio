import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aryan Anand Portfolio",
  description: "Sophomore at NSUT.Doing btech in CSAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${inter.variable} antialiased font-sans bg-surface text-text-main`}
      >
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
