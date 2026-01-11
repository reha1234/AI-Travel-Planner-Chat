import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Travel AI Planner",
  description: "AI-powered travel itinerary planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ambil pathname dari headers
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";

  // Tentukan halaman yang tidak butuh Navbar
  const hideNavbarPaths = ["/share"];
  const shouldHideNavbar = hideNavbarPaths.some((path) =>
    pathname.startsWith(path)
  );

  return (
    <html lang="en">
      <body className={inter.className}>
        {!shouldHideNavbar && <Navbar />}
        {children}
      </body>
    </html>
  );
}
