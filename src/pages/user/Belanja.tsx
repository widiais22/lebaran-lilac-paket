
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
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Fetch packages from Supabase
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      // Fetch packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('*');
      
      if (packagesError) throw new Error(packagesError.message);
      
      // For each package, fetch its products
      const packagesWithProducts = await Promise.all(
        packagesData.map(async (pkg) => {
          const { data: packageProducts, error: productsError } = await supabase
            .from('package_products')
            .select('product_id, qty, products(id, name, unit, thumbnail)')
            .eq('package_id', pkg.id);
          
          if (productsError) throw new Error(productsError.message);
          
          const products = packageProducts.map(item => ({
            id: item.products.id,
            name: item.products.name,
            qty: item.qty,
            unit: item.products.unit,
            thumbnail: item.products.thumbnail
          }));
          
          return {
            id: pkg.id,
            name: pkg.name,
            thumbnail: pkg.thumbnail,
            price: pkg.price,
            paymentSystem: pkg.payment_system,
            installments: pkg.installments,
            installmentAmount: pkg.installment_amount,
            paymentPeriod: pkg.payment_period,
            products
          };
        })
      );
      
      return packagesWithProducts as Package[];
    }
  });

  // Purchase package mutation
  const purchasePackage = useMutation({
    mutationFn: async (packageId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const selectedPkg = packages.find(pkg => pkg.id === packageId);
      if (!selectedPkg) throw new Error("Package not found");
      
      // Calculate due date based on first payment period
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1); // First payment due tomorrow
      
      // Insert user_package record
      const { data: userPackage, error: packageError } = await supabase
        .from('user_packages')
        .insert({
          user_id: user.id,
          package_id: packageId,
          status: 'pending',
          due_date: dueDate.toISOString()
        })
        .select()
        .single();
      
      if (packageError) throw new Error(packageError.message);
      
      // Create payment records for each installment
      const payments = [];
      
      for (let i = 0; i < selectedPkg.installments; i++) {
        const paymentDueDate = new Date();
        if (selectedPkg.paymentSystem === 'harian') {
          // For daily payments, add i days to the first payment date
          paymentDueDate.setDate(paymentDueDate.getDate() + 1 + i);
        } else {
          // For period payments, add i * period days to the first payment date
          paymentDueDate.setDate(paymentDueDate.getDate() + 1 + (i * selectedPkg.paymentPeriod));
        }
        
        payments.push({
          user_package_id: userPackage.id,
          amount: selectedPkg.installmentAmount,
          due_date: paymentDueDate.toISOString(),
          status: i === 0 ? 'pending' : 'upcoming'
        });
      }
      
      const { error: paymentsError } = await supabase
        .from('payments')
        .insert(payments);
      
      if (paymentsError) throw new Error(paymentsError.message);
      
      return userPackage;
    },
    onSuccess: () => {
      toast({
        title: "Paket Berhasil Dibeli",
        description: `${selectedPackage?.name} telah ditambahkan ke dashboard Anda.`,
      });
      queryClient.invalidateQueries({ queryKey: ['userPackages'] });
      setIsConfirmOpen(false);
      setIsDetailOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Gagal Membeli Paket",
        description: error.message,
        variant: "destructive"
      });
    }
  });

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
    if (selectedPackage) {
      purchasePackage.mutate(selectedPackage.id);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-lilac-800">Belanja</h1>
        {isMobile && <SidebarTrigger />}
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="pt-6 flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac-600"></div>
          </CardContent>
        </Card>
      ) : (
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

          {packages.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Tidak ada paket yang tersedia saat ini
                </p>
              </CardContent>
            </Card>
          )}
        </div>
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
              disabled={purchasePackage.isPending}
            >
              {purchasePackage.isPending ? (
                <>
                  <span className="animate-spin mr-2">⚪</span>
                  Memproses...
                </>
              ) : (
                "Ya, Beli Sekarang"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Belanja;
