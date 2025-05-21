import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { 
  Plus, 
  Filter, 
  ArrowUp, 
  ArrowDown, 
  ChevronRight 
} from "lucide-react";
import { PackageDialog } from "@/components/admin/PackageDialog";
import { PackageDetailDialog } from "@/components/admin/PackageDetailDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Product {
  id: string;
  thumbnail: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

interface PackageProduct {
  productId: string;
  qty: number;
}

interface PackageData {
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

type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "price" | null;

const Packages = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<PackageData | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw new Error(error.message);
      return data as Product[];
    }
  });

  // Fetch packages
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
            .select('*')
            .eq('package_id', pkg.id);
          
          if (productsError) throw new Error(productsError.message);
          
          const products = packageProducts.map(item => ({
            productId: item.product_id,
            qty: item.qty
          }));
          
          return {
            id: pkg.id,
            name: pkg.name,
            thumbnail: pkg.thumbnail || '/placeholder.svg',
            price: pkg.price,
            paymentSystem: pkg.payment_system,
            installments: pkg.installments,
            installmentAmount: pkg.installment_amount,
            paymentPeriod: pkg.payment_period,
            products
          };
        })
      );
      
      return packagesWithProducts as PackageData[];
    }
  });

  // Create package mutation
  const createPackage = useMutation({
    mutationFn: async (packageData: Omit<PackageData, 'id'>) => {
      // First insert the package
      const { data: newPackage, error: packageError } = await supabase
        .from('packages')
        .insert({
          name: packageData.name,
          thumbnail: packageData.thumbnail,
          price: packageData.price,
          payment_system: packageData.paymentSystem,
          installments: packageData.installments,
          installment_amount: packageData.installmentAmount,
          payment_period: packageData.paymentPeriod
        })
        .select()
        .single();
      
      if (packageError) throw new Error(packageError.message);
      
      // Then insert the package_products
      if (packageData.products.length > 0) {
        const productInserts = packageData.products.map(prod => ({
          package_id: newPackage.id,
          product_id: prod.productId,
          qty: prod.qty
        }));
        
        const { error: productsError } = await supabase
          .from('package_products')
          .insert(productInserts);
        
        if (productsError) throw new Error(productsError.message);
      }
      
      return newPackage;
    },
    onSuccess: () => {
      toast({
        title: "Paket berhasil ditambahkan",
        description: "Paket baru telah ditambahkan ke database."
      });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Gagal menambahkan paket",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update package mutation
  const updatePackage = useMutation({
    mutationFn: async (packageData: PackageData) => {
      // Update the package
      const { data: updatedPackage, error: packageError } = await supabase
        .from('packages')
        .update({
          name: packageData.name,
          thumbnail: packageData.thumbnail,
          price: packageData.price,
          payment_system: packageData.paymentSystem,
          installments: packageData.installments,
          installment_amount: packageData.installmentAmount,
          payment_period: packageData.paymentPeriod
        })
        .eq('id', packageData.id)
        .select()
        .single();
      
      if (packageError) throw new Error(packageError.message);
      
      // Delete existing package_products
      const { error: deleteError } = await supabase
        .from('package_products')
        .delete()
        .eq('package_id', packageData.id);
      
      if (deleteError) throw new Error(deleteError.message);
      
      // Insert new package_products
      if (packageData.products.length > 0) {
        const productInserts = packageData.products.map(prod => ({
          package_id: packageData.id,
          product_id: prod.productId,
          qty: prod.qty
        }));
        
        const { error: productsError } = await supabase
          .from('package_products')
          .insert(productInserts);
        
        if (productsError) throw new Error(productsError.message);
      }
      
      return updatedPackage;
    },
    onSuccess: () => {
      toast({
        title: "Paket berhasil diperbarui",
        description: "Perubahan paket telah disimpan."
      });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setIsDialogOpen(false);
      setCurrentPackage(null);
    },
    onError: (error) => {
      toast({
        title: "Gagal memperbarui paket",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete package mutation
  const deletePackage = useMutation({
    mutationFn: async (id: string) => {
      // Delete package (cascade will delete the package_products)
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Paket berhasil dihapus",
        description: "Paket telah dihapus dari database."
      });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setIsDetailOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Gagal menghapus paket",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Sorting function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sorted packages
  const getSortedPackages = () => {
    if (!sortField || !sortDirection) return packages;
    
    return [...packages].sort((a, b) => {
      if (sortDirection === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
  };

  // Open package detail
  const handleOpenDetail = (pkg: PackageData) => {
    setCurrentPackage(pkg);
    setIsDetailOpen(true);
  };

  // Handle creating a new package
  const handleCreatePackage = (packageData: Omit<PackageData, 'id'>) => {
    createPackage.mutate(packageData);
  };

  // Handle editing a package
  const handleEditPackage = (pkg: PackageData) => {
    setCurrentPackage(pkg);
    setIsDialogOpen(true);
  };

  // Handle saving an edited package
  const handleSaveEdit = (packageData: PackageData) => {
    updatePackage.mutate(packageData);
  };

  // Handle deleting a package
  const handleDeletePackage = (id: string) => {
    if (confirm("Apakah anda yakin ingin menghapus paket ini?")) {
      deletePackage.mutate(id);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-lilac-800">Setup Package</h1>
        {isMobile && <SidebarTrigger />}
      </div>
      
      <div className="mb-6">
        <Button 
          onClick={() => {
            setCurrentPackage(null);
            setIsDialogOpen(true);
          }}
          className="bg-lilac-600 hover:bg-lilac-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Paket Baru
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0 overflow-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Thumbnail</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Nama Paket
                      {sortField === "name" && sortDirection === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
                      {sortField === "name" && sortDirection === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center">
                      Harga
                      {sortField === "price" && sortDirection === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
                      {sortField === "price" && sortDirection === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead>Sistem</TableHead>
                  <TableHead>Cicilan</TableHead>
                  <TableHead className="text-right w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSortedPackages().map((pkg) => (
                  <TableRow 
                    key={pkg.id} 
                    className="cursor-pointer hover:bg-lilac-50"
                    onClick={() => handleOpenDetail(pkg)}
                  >
                    <TableCell>
                      <img 
                        src={pkg.thumbnail} 
                        alt={pkg.name} 
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(pkg.price)}
                    </TableCell>
                    <TableCell>
                      {pkg.paymentSystem === "harian" ? "Bayar Harian" : "Periode"}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(pkg.installmentAmount)} × {pkg.installments}
                    </TableCell>
                    <TableCell className="text-right">
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </TableCell>
                  </TableRow>
                ))}
                {packages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data paket
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PackageDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setCurrentPackage(null);
        }}
        onSave={currentPackage ? handleSaveEdit : handleCreatePackage}
        package={currentPackage}
        availableProducts={products}
      />

      <PackageDetailDialog
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setCurrentPackage(null);
        }}
        onEdit={handleEditPackage}
        onDelete={handleDeletePackage}
        package={currentPackage}
        availableProducts={products}
      />
    </div>
  );
};

export default Packages;
