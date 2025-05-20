
import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PackageDetailView } from "@/components/user/PackageDetailView";
import { useToast } from "@/hooks/use-toast";

// Sample package data for demonstration
const samplePackages = [
  {
    id: "1",
    thumbnail: "/placeholder.svg",
    name: "Paket Sembako Hemat",
    price: 250000,
    paymentSystem: "harian" as const,
    installments: 5,
    installmentAmount: 50000,
    paymentPeriod: 10, // days between payments
    products: [
      { 
        id: "1", 
        name: "Beras Premium", 
        qty: 10, 
        unit: "kg", 
        thumbnail: "/placeholder.svg" 
      },
      { 
        id: "3", 
        name: "Gula Pasir", 
        qty: 5, 
        unit: "kg", 
        thumbnail: "/placeholder.svg" 
      },
    ],
  },
  {
    id: "2",
    thumbnail: "/placeholder.svg",
    name: "Paket Lebaran Lengkap",
    price: 500000,
    paymentSystem: "periode" as const,
    installments: 2,
    installmentAmount: 250000,
    paymentPeriod: 30, // days between payments
    products: [
      { 
        id: "1", 
        name: "Beras Premium", 
        qty: 2, 
        unit: "kg", 
        thumbnail: "/placeholder.svg" 
      },
      { 
        id: "2", 
        name: "Minyak Goreng", 
        qty: 3, 
        unit: "liter", 
        thumbnail: "/placeholder.svg" 
      },
      { 
        id: "3", 
        name: "Gula Pasir", 
        qty: 2, 
        unit: "kg", 
        thumbnail: "/placeholder.svg" 
      },
      { 
        id: "4", 
        name: "Tepung Terigu", 
        qty: 1, 
        unit: "kg", 
        thumbnail: "/placeholder.svg" 
      },
    ],
  }
];

interface PackageProduct {
  id: string;
  name: string;
  qty: number;
  unit: string;
  thumbnail: string;
}

interface Package {
  id: string;
  thumbnail: string;
  name: string;
  price: number;
  paymentSystem: "harian" | "periode";
  installments: number;
  installmentAmount: number;
  paymentPeriod: number;
  products: PackageProduct[];
}

const Belanja = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>(samplePackages);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Function to handle package selection
  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsDetailOpen(true);
  };

  // Function to handle package purchase
  const handlePurchase = () => {
    setIsConfirmOpen(true);
  };

  // Function to confirm purchase
  const handleConfirmPurchase = () => {
    // Here we would normally make an API call to purchase the package
    // For now, we'll just show a toast message
    toast({
      title: "Paket Berhasil Dibeli",
      description: `${selectedPackage?.name} telah ditambahkan ke dashboard Anda.`,
    });
    setIsConfirmOpen(false);
    setIsDetailOpen(false);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-lilac-800">Belanja</h1>
        {isMobile && <SidebarTrigger />}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card 
            key={pkg.id} 
            className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleSelectPackage(pkg)}
          >
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              <img 
                src={pkg.thumbnail} 
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Cicilan</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(pkg.installmentAmount)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Sistem</span>
                <span className="font-medium">
                  {pkg.paymentSystem === "harian" ? "Harian" : "Periode"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pembayaran</span>
                <span className="font-medium">{pkg.installments}x</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="link"
                className="text-lilac-600 hover:text-lilac-800 p-0 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPackage(pkg);
                }}
              >
                Lihat Detail
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground mb-4">
              Tidak ada paket yang tersedia saat ini
            </p>
          </CardContent>
        </Card>
      )}
      
      {selectedPackage && (
        <PackageDetailView
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          package={selectedPackage}
          onPurchase={handlePurchase}
        />
      )}

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pembelian</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membeli paket {selectedPackage?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPurchase}
              className="bg-lilac-600 hover:bg-lilac-700"
            >
              Ya, Beli Sekarang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Belanja;
