
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ShoppingCart, CreditCard, History, ArrowLeft } from "lucide-react";

// Define menu items with access levels
const menuItems = {
  user: [
    { title: "Belanja", path: "/belanja", icon: ShoppingCart },
    { title: "Pembayaran", path: "/pembayaran", icon: CreditCard },
    { title: "Riwayat", path: "/riwayat", icon: History },
  ],
  admin: [
    { title: "Setup Product", path: "/admin/products", icon: ShoppingCart },
    { title: "Setup Package", path: "/admin/packages", icon: ShoppingCart },
    { title: "Setup Termin", path: "/admin/termins", icon: CreditCard },
    { title: "Setup User", path: "/admin/users", icon: History },
  ],
};

interface AppSidebarProps {
  userRole: "user" | "admin";
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  
  // Determine if we're on mobile based on screen width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const items = userRole === 'admin' ? menuItems.admin : menuItems.user;

  return (
    <Sidebar className={cn("border-r border-border", isMobile && "fixed z-50")}>
      <div className="flex items-center h-14 px-4 border-b">
        <h2 className="text-lg font-semibold text-lilac-600">Paket Lebaran</h2>
        {isMobile && <SidebarTrigger className="ml-auto" />}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{userRole === 'admin' ? 'Admin Panel' : 'Menu'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                    <Link to={item.path} className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {userRole === 'admin' && (
          <div className="mt-auto pb-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/" className="flex items-center text-muted-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span>Kembali ke User</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
