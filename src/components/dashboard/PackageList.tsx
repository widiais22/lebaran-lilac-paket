
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  status: "paid" | "pending" | "processing";
  dueDate?: string;
}

interface PackageListProps {
  packages: Package[];
}

const PackageList: React.FC<PackageListProps> = ({ packages }) => {
  // Helper function for status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    }
  };

  // Helper function for status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Lunas";
      case "pending":
        return "Menunggu Pembayaran";
      case "processing":
        return "Diproses";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mt-6 mb-3">Paket Anda</h2>
      {packages.length === 0 ? (
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6 text-center text-muted-foreground">
            Anda belum memiliki paket. Silakan belanja terlebih dahulu.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="bg-white shadow-sm overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-lilac-100 to-lilac-50">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">{pkg.name}</CardTitle>
                  <Badge className={getStatusColor(pkg.status)}>
                    {getStatusText(pkg.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>
                <div className="text-lg font-bold text-lilac-700 mb-2">
                  Rp {pkg.price.toLocaleString('id-ID')}
                </div>
                {pkg.dueDate && (
                  <div className="text-sm text-muted-foreground">
                    Jatuh tempo: {pkg.dueDate}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-gray-50 py-2">
                <Button variant="link" className="text-lilac-600 hover:text-lilac-800 text-sm p-0">
                  Lihat Detail
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackageList;
