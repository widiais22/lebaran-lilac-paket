
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

const Belanja = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-lilac-800">Belanja</h1>
        {isMobile && <SidebarTrigger />}
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Halaman Belanja - Fitur ini akan segera tersedia
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Belanja;
