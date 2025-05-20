
import React from "react";
import UserInfo from "@/components/dashboard/UserInfo";
import PackageList from "@/components/dashboard/PackageList";
import ActionButtons from "@/components/dashboard/ActionButtons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

// Sample data for demonstration
const userData = {
  name: "Ahmad Fauzi",
  phoneNumber: "0812-3456-7890",
  balance: 2500000,
};

const samplePackages = [
  {
    id: "pkg-1",
    name: "Paket Lebaran Hemat",
    description: "Paket sembako dengan bahan pokok untuk kebutuhan Lebaran",
    price: 750000,
    status: "paid" as const,
  },
  {
    id: "pkg-2",
    name: "Paket Kue Lebaran",
    description: "Kumpulan kue-kue kering dan basah khas Lebaran",
    price: 450000,
    status: "processing" as const,
    dueDate: "20 Mei 2025",
  },
  {
    id: "pkg-3",
    name: "Paket Fashion Keluarga",
    description: "Busana Lebaran untuk keluarga (2 dewasa, 2 anak)",
    price: 1300000,
    status: "pending" as const,
    dueDate: "15 Mei 2025",
  },
];

const Dashboard = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-lilac-800">Dashboard</h1>
        {isMobile && <SidebarTrigger />}
      </div>
      
      <UserInfo
        name={userData.name}
        phoneNumber={userData.phoneNumber}
        balance={userData.balance}
      />
      
      <PackageList packages={samplePackages} />
      
      <ActionButtons />
    </div>
  );
};

export default Dashboard;
