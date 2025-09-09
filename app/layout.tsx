import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "that elephant party - events",
  description: "Event management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-slim min-h-screen grid grid-rows-[auto_1fr_auto] custom-gradient-bg">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}