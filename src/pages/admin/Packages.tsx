
import React, { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
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

// Sample product data for demonstration
const initialProducts = [
  {
    id: "1",
    thumbnail: "/placeholder.svg",
    name: "Beras Premium",
    qty: 10,
    unit: "kg",
    price: 150000,
  },
  {
    id: "2",
    thumbnail: "/placeholder.svg",
    name: "Minyak Goreng",
    qty: 5,
    unit: "liter",
    price: 78000,
  },
  {
    id: "3",
    thumbnail: "/placeholder.svg",
    name: "Gula Pasir",
    qty: 5,
    unit: "kg",
    price: 85000,
  },
  {
    id: "4",
    thumbnail: "/placeholder.svg",
    name: "Tepung Terigu",
    qty: 3,
    unit: "kg",
    price: 45000,
  },
];

// Sample package data for demonstration with explicit typing for paymentSystem
const initialPackages = [
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
      { productId: "1", qty: 1 },
      { productId: "3", qty: 2 },
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
      { productId: "1", qty: 2 },
      { productId: "2", qty: 3 },
      { productId: "3", qty: 2 },
      { productId: "4", qty: 1 },
    ],
  }
];

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
  const [packages, setPackages] = useState<PackageData[]>(initialPackages);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<PackageData | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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
  const handleCreatePackage = (packageData: PackageData) => {
    const newPackage = {
      id: Date.now().toString(),
      ...packageData,
    };
    setPackages([...packages, newPackage]);
    setIsDialogOpen(false);
  };

  // Handle editing a package
  const handleEditPackage = (pkg: PackageData) => {
    setCurrentPackage(pkg);
    setIsDialogOpen(true);
  };

  // Handle saving an edited package
  const handleSaveEdit = (packageData: PackageData) => {
    setPackages(packages.map(p => 
      p.id === packageData.id ? { ...p, ...packageData } : p
    ));
    setIsDialogOpen(false);
    setCurrentPackage(null);
  };

  // Handle deleting a package
  const handleDeletePackage = (id: string) => {
    if (confirm("Apakah anda yakin ingin menghapus paket ini?")) {
      setPackages(packages.filter(p => p.id !== id));
      setIsDetailOpen(false);
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
          onClick={() => setIsDialogOpen(true)}
          className="bg-lilac-600 hover:bg-lilac-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Paket Baru
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0 overflow-auto">
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
