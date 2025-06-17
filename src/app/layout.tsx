"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SocketProvider } from "@/context/SocketContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


type LayoutProps = {
  children: ReactNode;
};
const Layout = ({ children }: LayoutProps) => {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SocketProvider>
            <SessionProvider>
              <main className="">
                <div className="bg-white p-8 w-full">
                  {children}
                  <Toaster />
                </div>
              </main>
            </SessionProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
};

export default Layout;
