"use client";
import { SessionWrapper } from "@/lib/auth/session-wrapper";
import type { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Header from "@/components/Navbar/header";
import { ClientSidebar } from "@/components/clientsidebar/client-sidebar";
import NotificationCenter from "@/components/notifications/NotificationCenter";

export default function ClientDashboardLayout({ children }: { children: ReactNode }) {

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
         <ClientSidebar/>
        <main className="flex-1 flex flex-col">
      <div className="flex items-center justify-between">
          <SidebarTrigger />
              <div className="flex items-center justify-between">
            <NotificationCenter />
            <Header/>
              </div>
      </div>
          <SessionWrapper>
            {children}
          </SessionWrapper>
        </main>
      </div>
    </SidebarProvider>
  );
}