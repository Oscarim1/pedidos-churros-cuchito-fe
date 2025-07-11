import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import OptionalTopBar from "./components/OptionalTopBar";
import { CartProvider } from "../context/CartContext";
import { LoadingProvider } from "../context/LoadingContext";
import LoadingOverlay from "./components/LoadingOverlay";
import RouteChangeHandler from "./components/RouteChangeHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingProvider>
          <CartProvider>
            <OptionalTopBar />
            <RouteChangeHandler />
            <LoadingOverlay />
            {children}
          </CartProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
