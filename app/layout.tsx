"use client";
import { ThirdwebProvider } from "thirdweb/react";
import "./globals.css";
import Navbar from "./components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import Footer from "./components/Footer";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>WidCoin Presale</title>
      </head>
      <ThirdwebProvider>
        <body>
          <div className="flex flex-col min-h-screen">
            <Suspense>
              <Navbar />
            </Suspense>
            <main className="flex-1 p-4 banner bg-gradient-to-r from-gray-900 to-purple-900">
              {children}
            </main>
            <Footer />
            <Toaster />
          </div>
        </body>
      </ThirdwebProvider>
    </html>
  );
}
