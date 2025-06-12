"use client";
import { SessionWrapper } from "@/lib/auth/session-wrapper";
import type { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import Header from "@/components/Navbar/header";

export default function DashboardLayout({ children }: { children: ReactNode }) {

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
      <div className="flex items-center justify-between">

          <SidebarTrigger />
        <Header/>
      </div>
          <SessionWrapper>
            {children}
          </SessionWrapper>
        </main>
      </div>
    </SidebarProvider>
  );
}