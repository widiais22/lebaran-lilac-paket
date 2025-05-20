
import React, { useEffect, useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";

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

interface PackageDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (packageData: PackageData) => void;
  onDelete: (id: string) => void;
  package: PackageData | null;
  availableProducts: Product[];
}

export const PackageDetailDialog = ({ 
  isOpen, 
  onClose, 
  onEdit,
  onDelete,
  package: packageData, 
  availableProducts 
}: PackageDetailDialogProps) => {
  const [products, setProducts] = useState<Array<Product & { qty: number }>>([]);

  useEffect(() => {
    if (packageData && availableProducts.length > 0) {
      // Map package products to their full details
      const productDetails = packageData.products.map(item => {
        const product = availableProducts.find(p => p.id === item.productId);
        if (product) {
          return {
            ...product,
            qty: item.qty
          };
        }
        return null;
      }).filter(Boolean) as Array<Product & { qty: number }>;
      
      setProducts(productDetails);
    } else {
      setProducts([]);
    }
  }, [packageData, availableProducts]);

  if (!packageData) return null;

  const handleEdit = () => {
    if (packageData) {
      onEdit(packageData);
      onClose();
    }
  };

  const handleDelete = () => {
    if (packageData) {
      onDelete(packageData.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-lilac-800 flex items-center justify-between">
            <span>Detail Paket</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Hapus
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Basic info */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <Card className="w-40 h-40 flex items-center justify-center overflow-hidden">
                <img
                  src={packageData.thumbnail}
                  alt={packageData.name}
                  className="max-w-full max-h-full object-contain"
                />
              </Card>
            </div>
            
            <div className="flex-grow space-y-2">
              <h3 className="text-xl font-bold">{packageData.name}</h3>
              
              <div className="text-lg font-semibold text-lilac-700">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(packageData.price)}
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                <div className="text-muted-foreground">Sistem Pembayaran:</div>
                <div className="font-medium">
                  {packageData.paymentSystem === "harian" ? "Bayar Harian" : "Periode"}
                </div>
                
                <div className="text-muted-foreground">Jarak Pembayaran:</div>
                <div className="font-medium">
                  {packageData.paymentPeriod} Hari
                </div>
                
                <div className="text-muted-foreground">Jumlah Cicilan:</div>
                <div className="font-medium">
                  {packageData.installments} kali
                </div>
                
                <div className="text-muted-foreground">Nominal per Cicilan:</div>
                <div className="font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(packageData.installmentAmount)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product list */}
          <div className="space-y-3">
            <h4 className="font-medium">Produk dalam Paket</h4>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Thumbnail</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img 
                            src={product.thumbnail} 
                            alt={product.name} 
                            className="w-10 h-10 object-cover rounded-md"
                          />
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className="text-right">{product.qty}</TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(product.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(product.price * product.qty)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {products.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Tidak ada produk dalam paket ini
                        </TableCell>
                      </TableRow>
                    )}
                    {products.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="font-medium text-right">
                          Total Harga Produk:
                        </TableCell>
                        <TableCell className="font-bold text-right">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(products.reduce((total, p) => total + (p.price * p.qty), 0))}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={onClose}
            className="bg-lilac-600 hover:bg-lilac-700"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
