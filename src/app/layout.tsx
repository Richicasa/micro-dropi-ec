import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ToastContainer from "@/components/Toast";
import SimulateWebhookDrawer from "@/components/SimulateWebhookDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: "Micro-Dropi Ecuador | Plataforma Privada COD",
  description: "Motor de Social Commerce y liquidación de comisiones contra entrega para Ecuador",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Micro-Dropi EC",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100 selection:bg-emerald-500 selection:text-black">
        <Header />
        
        <main className="flex-1 pb-24 pt-2">
          {children}
        </main>

        <BottomNav />
        <ToastContainer />
        <SimulateWebhookDrawer />
      </body>
    </html>
  );
}
