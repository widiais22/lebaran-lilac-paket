
import React, { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
  Trash2,
  Upload
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  id?: string;
  thumbnail: string;
  name: string;
  price: number;
  paymentSystem: "harian" | "periode";
  installments: number;
  installmentAmount: number;
  paymentPeriod: number;
  products: PackageProduct[];
}

interface PackageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (packageData: PackageData) => void;
  package: PackageData | null;
  availableProducts: Product[];
}

export const PackageDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  package: packageData, 
  availableProducts 
}: PackageDialogProps) => {
  const [formData, setFormData] = useState<PackageData>({
    thumbnail: "/placeholder.svg",
    name: "",
    price: 0,
    paymentSystem: "periode",
    installments: 1,
    installmentAmount: 0,
    paymentPeriod: 30,
    products: []
  });
  
  const [imagePreview, setImagePreview] = useState<string>("/placeholder.svg");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductQty, setSelectedProductQty] = useState<number>(1);
  const [useCalculatedPrice, setUseCalculatedPrice] = useState<boolean>(true);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  // Reset form when dialog opens or package changes
  useEffect(() => {
    if (packageData) {
      setFormData(packageData);
      setImagePreview(packageData.thumbnail);
      setUseCalculatedPrice(false);
    } else {
      setFormData({
        thumbnail: "/placeholder.svg",
        name: "",
        price: 0,
        paymentSystem: "periode",
        installments: 1,
        installmentAmount: 0,
        paymentPeriod: 30,
        products: []
      });
      setImagePreview("/placeholder.svg");
      setUseCalculatedPrice(true);
    }
  }, [packageData, isOpen]);

  // Calculate total price based on selected products
  useEffect(() => {
    const totalPrice = formData.products.reduce((total, item) => {
      const product = availableProducts.find(p => p.id === item.productId);
      if (product) {
        return total + (product.price * item.qty);
      }
      return total;
    }, 0);
    
    setCalculatedPrice(totalPrice);
    
    if (useCalculatedPrice) {
      setFormData(prev => ({
        ...prev,
        price: totalPrice
      }));
    }
    
    // Recalculate installment amount
    if (formData.installments > 0) {
      const price = useCalculatedPrice ? totalPrice : formData.price;
      setFormData(prev => ({
        ...prev,
        installmentAmount: Math.ceil(price / prev.installments)
      }));
    }
  }, [formData.products, formData.installments, useCalculatedPrice, availableProducts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "price") {
      setUseCalculatedPrice(false);
    }
    
    setFormData({
      ...formData,
      [name]: name === "price" || name === "installments" || name === "paymentPeriod" 
        ? Number(value) 
        : value,
    });
    
    // Recalculate installment amount if installments change
    if (name === "installments" && Number(value) > 0) {
      const price = useCalculatedPrice ? calculatedPrice : formData.price;
      setFormData(prev => ({
        ...prev,
        installmentAmount: Math.ceil(price / Number(value))
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({
          ...formData,
          thumbnail: base64String,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addProduct = () => {
    if (!selectedProductId) return;
    
    // Check if product already exists
    const existingProductIndex = formData.products.findIndex(
      p => p.productId === selectedProductId
    );
    
    if (existingProductIndex >= 0) {
      // Update quantity if product already exists
      const updatedProducts = [...formData.products];
      updatedProducts[existingProductIndex].qty += selectedProductQty;
      
      setFormData({
        ...formData,
        products: updatedProducts
      });
    } else {
      // Add new product
      setFormData({
        ...formData,
        products: [
          ...formData.products,
          {
            productId: selectedProductId,
            qty: selectedProductQty
          }
        ]
      });
    }
    
    // Reset selection
    setSelectedProductId("");
    setSelectedProductQty(1);
  };

  const removeProduct = (productId: string) => {
    setFormData({
      ...formData,
      products: formData.products.filter(p => p.productId !== productId)
    });
  };

  const getProductDetails = (productId: string) => {
    return availableProducts.find(p => p.id === productId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-lilac-800">
            {packageData ? "Edit Paket" : "Tambah Paket Baru"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid gap-6">
            {/* Thumbnail upload */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Card className="w-32 h-32 flex items-center justify-center overflow-hidden p-1">
                  <img
                    src={imagePreview}
                    alt="Thumbnail Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </Card>
                <div className="w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() => document.getElementById('packageThumbnailUpload')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Gambar
                  </Button>
                  <input
                    id="packageThumbnailUpload"
                    name="thumbnailUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            
            {/* Package name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Paket</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama paket"
                required
              />
            </div>

            {/* Product selection */}
            <div className="space-y-4">
              <Label>Daftar Produk</Label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Select
                    value={selectedProductId}
                    onValueChange={(value) => setSelectedProductId(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih produk" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="1"
                    value={selectedProductQty}
                    onChange={(e) => setSelectedProductQty(Number(e.target.value))}
                    placeholder="Qty"
                  />
                </div>
                <Button
                  type="button"
                  onClick={addProduct}
                  disabled={!selectedProductId}
                  className="bg-lilac-600 hover:bg-lilac-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Harga</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.products.map((item) => {
                        const product = getProductDetails(item.productId);
                        return product ? (
                          <TableRow key={item.productId}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell className="text-right">{item.qty}</TableCell>
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
                              }).format(product.price * item.qty)}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                onClick={() => removeProduct(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ) : null;
                      })}
                      {formData.products.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            Belum ada produk ditambahkan
                          </TableCell>
                        </TableRow>
                      )}
                      {formData.products.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="font-medium text-right">
                            Total Harga:
                          </TableCell>
                          <TableCell colSpan={2} className="font-bold text-right">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0
                            }).format(calculatedPrice)}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Price settings */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useCalculatedPrice"
                  checked={useCalculatedPrice}
                  onChange={() => setUseCalculatedPrice(!useCalculatedPrice)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="useCalculatedPrice">Gunakan total harga dari produk</Label>
              </div>
              
              {!useCalculatedPrice && (
                <div className="space-y-2">
                  <Label htmlFor="price">Harga Paket</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
            </div>

            {/* Payment system */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentSystem">Sistem Pembayaran</Label>
                <Select
                  value={formData.paymentSystem}
                  onValueChange={(value) => handleSelectChange("paymentSystem", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sistem pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="harian">Harian</SelectItem>
                    <SelectItem value="periode">Periode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentPeriod">
                  {formData.paymentSystem === "harian" ? "Jarak Hari Pembayaran" : "Jarak Periode (Hari)"}
                </Label>
                <Input
                  id="paymentPeriod"
                  name="paymentPeriod"
                  type="number"
                  min="1"
                  value={formData.paymentPeriod}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Installment settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installments">Jumlah Cicilan</Label>
                <Input
                  id="installments"
                  name="installments"
                  type="number"
                  min="1"
                  value={formData.installments}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="installmentAmount">Nominal per Cicilan</Label>
                <Input
                  id="installmentAmount"
                  name="installmentAmount"
                  type="text"
                  value={new Intl.NumberFormat('id-ID').format(formData.installmentAmount)}
                  readOnly
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-lilac-600 hover:bg-lilac-700"
            >
              {packageData ? "Simpan Perubahan" : "Tambah Paket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
