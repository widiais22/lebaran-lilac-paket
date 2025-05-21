
import React from "react";
import UserInfo from "@/components/dashboard/UserInfo";
import PackageList from "@/components/dashboard/PackageList";
import ActionButtons from "@/components/dashboard/ActionButtons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const isMobile = useIsMobile();
  const { profile, isLoading } = useAuth();
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-lilac-800">Dashboard</h1>
        {isMobile && <SidebarTrigger />}
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac-600"></div>
          </CardContent>
        </Card>
      ) : profile ? (
        <>
          <UserInfo
            name={`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'}
            phoneNumber={profile.phone_number || '-'}
            balance={profile.balance || 0}
          />
          
          <PackageList packages={[]} />
          
          <ActionButtons />
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Profil tidak ditemukan. Silakan keluar dan masuk kembali.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
