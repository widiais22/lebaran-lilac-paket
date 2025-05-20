
import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Edit, Trash2, Plus, Filter, ArrowUp, ArrowDown } from "lucide-react";
import { ProductDialog } from "@/components/admin/ProductDialog";
import { ProductFilter } from "@/components/admin/ProductFilter";

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

type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "qty" | "price" | null;

const Products = () => {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Sorting function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sorted products
  const getSortedProducts = () => {
    if (!sortField || !sortDirection) return products;
    
    return [...products].sort((a, b) => {
      if (sortDirection === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
  };

  // Handle creating a new product
  const handleCreateProduct = (productData) => {
    const newProduct = {
      id: Date.now().toString(),
      ...productData,
    };
    setProducts([...products, newProduct]);
    setIsDialogOpen(false);
  };

  // Handle editing a product
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setIsDialogOpen(true);
  };

  // Handle saving an edited product
  const handleSaveEdit = (productData) => {
    setProducts(products.map(p => 
      p.id === productData.id ? { ...p, ...productData } : p
    ));
    setIsDialogOpen(false);
    setCurrentProduct(null);
  };

  // Handle deleting a product
  const handleDeleteProduct = (id) => {
    if (confirm("Apakah anda yakin ingin menghapus produk ini?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Handle filter apply
  const handleFilterApply = (filteredProducts) => {
    setProducts(filteredProducts);
    setIsFilterOpen(false);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-lilac-800">Setup Product</h1>
        {isMobile && <SidebarTrigger />}
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          className="bg-lilac-600 hover:bg-lilac-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Product Baru
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setIsFilterOpen(true)}
          className="border-lilac-400 text-lilac-700"
        >
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thumbnail</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Nama Product
                    {sortField === "name" && sortDirection === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
                    {sortField === "name" && sortDirection === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("qty")}
                >
                  <div className="flex items-center">
                    Qty
                    {sortField === "qty" && sortDirection === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
                    {sortField === "qty" && sortDirection === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead>Unit</TableHead>
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
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedProducts().map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img 
                      src={product.thumbnail} 
                      alt={product.name} 
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.qty}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(product.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada data product
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setCurrentProduct(null);
        }}
        onSave={currentProduct ? handleSaveEdit : handleCreateProduct}
        product={currentProduct}
      />

      <ProductFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        products={initialProducts}
        onApply={handleFilterApply}
      />
    </div>
  );
};

export default Products;
