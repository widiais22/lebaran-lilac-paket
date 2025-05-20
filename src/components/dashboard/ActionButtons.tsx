
import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, History } from "lucide-react";
import { Link } from "react-router-dom";

const ActionButtons = () => {
  return (
    <div className="mt-8 mb-10">
      <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
      <div className="grid grid-cols-3 gap-4">
        <Button
          asChild
          variant="outline"
          className="flex flex-col items-center justify-center h-24 bg-white border-lilac-200 hover:bg-lilac-50"
        >
          <Link to="/belanja">
            <ShoppingCart className="h-6 w-6 mb-2 text-lilac-600" />
            <span>Belanja</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="flex flex-col items-center justify-center h-24 bg-white border-lilac-200 hover:bg-lilac-50"
        >
          <Link to="/pembayaran">
            <CreditCard className="h-6 w-6 mb-2 text-lilac-600" />
            <span>Pembayaran</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="flex flex-col items-center justify-center h-24 bg-white border-lilac-200 hover:bg-lilac-50"
        >
          <Link to="/riwayat">
            <History className="h-6 w-6 mb-2 text-lilac-600" />
            <span>Riwayat</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
