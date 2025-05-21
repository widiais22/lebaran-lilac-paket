
import React, { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "qty" | "price" | null;

interface Product {
  id: string;
  thumbnail: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

const Products = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log("Fetching products...");
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        console.error("Error fetching products:", error);
        throw new Error(error.message);
      }
      
      console.log("Products fetched:", data);
      return data as Product[];
    }
  });

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (productData: Omit<Product, 'id'>) => {
      console.log("Creating product:", productData);
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          thumbnail: productData.thumbnail,
          unit: productData.unit,
          price: productData.price,
          qty: productData.qty
        }])
        .select();
      
      if (error) {
        console.error("Error creating product:", error);
        throw new Error(error.message);
      }
      
      console.log("Product created:", data[0]);
      return data[0];
    },
    onSuccess: () => {
      toast({
        title: "Produk berhasil ditambahkan",
        description: "Produk baru telah ditambahkan ke database."
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Gagal menambahkan produk",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async (productData: Product) => {
      console.log("Updating product:", productData);
      const { id, ...rest } = productData;
      const { data, error } = await supabase
        .from('products')
        .update(rest)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Error updating product:", error);
        throw new Error(error.message);
      }
      
      console.log("Product updated:", data[0]);
      return data[0];
    },
    onSuccess: () => {
      toast({
        title: "Produk berhasil diperbarui",
        description: "Perubahan produk telah disimpan."
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      setCurrentProduct(null);
    },
    onError: (error) => {
      toast({
        title: "Gagal memperbarui produk",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting product:", id);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting product:", error);
        throw new Error(error.message);
      }
      
      console.log("Product deleted successfully");
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "Produk berhasil dihapus",
        description: "Produk telah dihapus dari database."
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast({
        title: "Gagal menghapus produk",
        description: error.message,
        variant: "destructive"
      });
    }
  });

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
  const handleCreateProduct = (productData: Omit<Product, 'id'>) => {
    createProduct.mutate(productData);
  };

  // Handle editing a product
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsDialogOpen(true);
  };

  // Handle saving an edited product
  const handleSaveEdit = (productData: Product) => {
    updateProduct.mutate(productData);
  };

  // Handle deleting a product
  const handleDeleteProduct = (id: string) => {
    if (confirm("Apakah anda yakin ingin menghapus produk ini?")) {
      deleteProduct.mutate(id);
    }
  };

  // Handle filter apply
  const handleFilterApply = (filteredProducts: Product[]) => {
    // Implementation for filtering
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
          onClick={() => {
            setCurrentProduct(null);
            setIsDialogOpen(true);
          }}
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
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac-600"></div>
            </div>
          ) : (
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
          )}
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
        products={products}
        onApply={handleFilterApply}
      />
    </div>
  );
};

export default Products;
