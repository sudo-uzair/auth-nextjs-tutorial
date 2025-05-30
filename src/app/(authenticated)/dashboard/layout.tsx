// src/app/dashboard/layout.tsx
"use client";
import { SessionWrapper } from "@/lib/auth/session-wrapper";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SessionWrapper>
      {children}
    </SessionWrapper>
  );
}
