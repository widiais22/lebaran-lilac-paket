
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
import { Card } from "@/components/ui/card";

interface ProductData {
  id?: string;
  thumbnail: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductData) => void;
  product: ProductData | null;
}

export const ProductDialog = ({ isOpen, onClose, onSave, product }: ProductDialogProps) => {
  const [formData, setFormData] = useState<ProductData>({
    thumbnail: "/placeholder.svg",
    name: "",
    qty: 0,
    unit: "kg",
    price: 0,
  });

  // Reset form when dialog opens or product changes
  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        thumbnail: "/placeholder.svg",
        name: "",
        qty: 0,
        unit: "kg",
        price: 0,
      });
    }
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "qty" || name === "price" ? Number(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-lilac-800">
            {product ? "Edit Product" : "Tambah Product Baru"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <div className="flex items-center gap-4">
                <Card className="w-20 h-20 flex items-center justify-center overflow-hidden p-1">
                  <img
                    src={formData.thumbnail || "/placeholder.svg"}
                    alt="Thumbnail Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </Card>
                <Input
                  id="thumbnail"
                  name="thumbnail"
                  type="text"
                  placeholder="URL gambar"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nama Product</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama product"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qty">Qty</Label>
                <Input
                  id="qty"
                  name="qty"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.qty}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="kg, pcs, etc."
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Harga</Label>
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
              {product ? "Simpan Perubahan" : "Tambah Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
