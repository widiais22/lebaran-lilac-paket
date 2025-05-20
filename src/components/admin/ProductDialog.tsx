
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
import { Upload } from "lucide-react";

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
  
  const [imagePreview, setImagePreview] = useState<string>("/placeholder.svg");

  // Reset form when dialog opens or product changes
  useEffect(() => {
    if (product) {
      setFormData(product);
      setImagePreview(product.thumbnail);
    } else {
      setFormData({
        thumbnail: "/placeholder.svg",
        name: "",
        qty: 0,
        unit: "kg",
        price: 0,
      });
      setImagePreview("/placeholder.svg");
    }
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "qty" || name === "price" ? Number(value) : value,
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
              <div className="flex flex-col gap-4 items-center">
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
                    onClick={() => document.getElementById('thumbnailUpload')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Gambar
                  </Button>
                  <input
                    id="thumbnailUpload"
                    name="thumbnailUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
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
