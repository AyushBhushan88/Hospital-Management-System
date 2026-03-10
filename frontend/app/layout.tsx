import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { GoogleOAuthProvider } from '@react-oauth/google';

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
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your_placeholder_client_id';

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <div className="no-print">
            <Header />
          </div>
          <div className="flex pt-16 overflow-hidden bg-gray-50 h-screen print:pt-0 print:bg-white print:h-auto">
            <div className="no-print">
              <Sidebar />
            </div>
            <div className="relative w-full h-full overflow-y-auto lg:ml-64 print:ml-0 print:h-auto print:overflow-visible">
              <main className="p-4 lg:p-8 print:p-0">
                {children}
              </main>
            </div>
          </div>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
