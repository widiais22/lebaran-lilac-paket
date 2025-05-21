import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
import { 
  ShoppingCart, 
  CreditCard, 
  History, 
  Package2, 
  Settings, 
  Users, 
  LogOut, 
  Home,
  UserCog
} from "lucide-react";

export function AppSidebar() {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isSpecialAdmin, setIsSpecialAdmin] = useState(false);
  
  // Check for special admin access
  useEffect(() => {
    const checkSpecialAdmin = async () => {
      if (!user) return;
      
      // First check if the email is the special admin email
      const isSpecialEmail = user.email === 'widiahmadibnu@gmail.com';
      
      if (isSpecialEmail) {
        setIsSpecialAdmin(true);
        return;
      }
      
      // Otherwise check for admin role in the database
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin');
          
        setIsSpecialAdmin(data && data.length > 0);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    checkSpecialAdmin();
  }, [user]);
  
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

  // User menu items
  const userItems = [
    { title: "Dashboard", path: "/", icon: Home },
    { title: "Belanja", path: "/belanja", icon: ShoppingCart },
    { title: "Pembayaran", path: "/pembayaran", icon: CreditCard },
    { title: "Riwayat", path: "/riwayat", icon: History },
  ];

  // Admin menu items
  const adminItems = [
    { title: "Setup Product", path: "/admin/products", icon: ShoppingCart },
    { title: "Setup Package", path: "/admin/packages", icon: Package2 },
    { title: "Setup Termin", path: "/admin/termins", icon: CreditCard },
    { title: "Setup User", path: "/admin/users", icon: Users },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Sidebar className={cn("border-r border-border", isMobile && "fixed z-50")}>
      <div className="flex items-center h-14 px-4 border-b">
        <h2 className="text-lg font-semibold text-lilac-600">Paket Lebaran</h2>
        {isMobile && <SidebarTrigger className="ml-auto" />}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
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

        {/* Show admin menu if user has admin role or is special admin */}
        {(isAdmin || isSpecialAdmin) && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
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
        )}

        <div className="mt-auto pb-4">
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild onClick={handleLogout}>
                    <button className="flex items-center text-muted-foreground w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
