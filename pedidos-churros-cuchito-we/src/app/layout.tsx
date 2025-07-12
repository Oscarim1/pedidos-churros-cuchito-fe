// src/app/layout.tsx

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

/**
 * Aquí defines el <title> y el favicon de toda la app.
 */
export const metadata: Metadata = {
  title: "Churros Cuchito",              // <-- nuevo título
  description: "Tus churros favoritos al instante",
  icons: {
    icon: "/favicon.ico",               // <-- favicon en public/favicon.ico
    apple: "/apple-touch-icon.png",     // opcional para iOS
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
