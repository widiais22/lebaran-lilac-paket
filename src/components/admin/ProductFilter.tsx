
import React, { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  thumbnail: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

interface ProductFilterProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onApply: (filteredProducts: Product[]) => void;
}

export const ProductFilter = ({ isOpen, onClose, products, onApply }: ProductFilterProps) => {
  const [filters, setFilters] = useState({
    name: "",
    minPrice: "",
    maxPrice: "",
    unit: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleReset = () => {
    setFilters({
      name: "",
      minPrice: "",
      maxPrice: "",
      unit: ""
    });
  };

  const handleApply = () => {
    let result = [...products];

    // Filter by name
    if (filters.name) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by min price
    if (filters.minPrice) {
      result = result.filter(product => 
        product.price >= Number(filters.minPrice)
      );
    }

    // Filter by max price
    if (filters.maxPrice) {
      result = result.filter(product => 
        product.price <= Number(filters.maxPrice)
      );
    }

    // Filter by unit
    if (filters.unit) {
      result = result.filter(product => 
        product.unit.toLowerCase() === filters.unit.toLowerCase()
      );
    }

    onApply(result);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl text-lilac-800">Filter Product</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Product</Label>
            <Input
              id="name"
              name="name"
              value={filters.name}
              onChange={handleChange}
              placeholder="Cari nama product"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPrice">Harga Minimum</Label>
              <Input
                id="minPrice"
                name="minPrice"
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={handleChange}
                placeholder="Min"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Harga Maksimum</Label>
              <Input
                id="maxPrice"
                name="maxPrice"
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={handleChange}
                placeholder="Max"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              name="unit"
              value={filters.unit}
              onChange={handleChange}
              placeholder="kg, pcs, etc."
            />
          </div>
        </div>
        
        <SheetFooter className="sm:justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
          <Button 
            onClick={handleApply}
            className="w-full sm:w-auto bg-lilac-600 hover:bg-lilac-700"
          >
            Terapkan Filter
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
