
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  userRole: "user" | "admin";
}

export function AppLayout({ userRole = "user" }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SidebarProvider
      defaultIsOpen={true}
      onOpenChange={setIsSidebarOpen}
    >
      <div className="min-h-screen flex w-full">
        <AppSidebar userRole={userRole} />
        <div className={cn(
          "flex-1 w-full transition-all duration-300 overflow-auto",
          isSidebarOpen ? "md:pl-64" : ""
        )}>
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
