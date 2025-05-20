
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface PackageDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package;
  onPurchase: () => void;
}

export function PackageDetailView({ isOpen, onClose, package: pkg, onPurchase }: PackageDetailViewProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get payment system text
  const getPaymentSystemText = (system: "harian" | "periode") => {
    return system === "harian" ? "harian" : "periode";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-lilac-800">{pkg.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6 overflow-hidden flex-1">
          <div className="md:w-1/3">
            <div className="aspect-square w-full overflow-hidden rounded-md mb-4">
              <img 
                src={pkg.thumbnail} 
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Harga</p>
                <p className="font-semibold text-lg">{formatCurrency(pkg.price)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cicilan</p>
                <p className="font-semibold">{formatCurrency(pkg.installmentAmount)} × {pkg.installments} kali</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sistem Pembayaran</p>
                <p className="font-semibold capitalize">{getPaymentSystemText(pkg.paymentSystem)}</p>
              </div>
              {pkg.paymentSystem === "periode" && (
                <div>
                  <p className="text-sm text-muted-foreground">Periode Pembayaran</p>
                  <p className="font-semibold">Setiap {pkg.paymentPeriod} hari</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:w-2/3 flex flex-col overflow-hidden">
            <h3 className="font-medium text-lg mb-3">Daftar Barang</h3>
            <ScrollArea className="flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pkg.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img 
                          src={product.thumbnail} 
                          alt={product.name} 
                          className="h-8 w-8 rounded object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">{product.qty} {product.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            
            <div className="mt-6 text-xs text-muted-foreground bg-gray-50 p-3 rounded-md">
              <p>
                Jika Anda beli paket ini, cicilannya seharga {formatCurrency(pkg.installmentAmount)}, 
                tagihan paket akan dimulai dari esok hari semenjak hari pembelian, 
                dengan sistem {getPaymentSystemText(pkg.paymentSystem)}, 
                sebanyak {pkg.installments} kali pembayaran. Dengan membeli paket ini, 
                Anda sudah setuju dengan syarat dan ketentuan berlaku, termasuk penalti. 
                Harap dipahami terlebih dahulu.
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button 
            onClick={onPurchase} 
            className="bg-lilac-600 hover:bg-lilac-700"
          >
            Beli Paket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
