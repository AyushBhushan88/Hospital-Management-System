import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hospital Management System",
  description: "Modern hospital management and EMR platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <div className="flex pt-16 overflow-hidden bg-gray-50 h-screen">
          <Sidebar />
          <div className="relative w-full h-full overflow-y-auto lg:ml-64">
            <main className="p-4 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
