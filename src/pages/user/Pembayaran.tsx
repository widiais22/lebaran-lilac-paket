import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PackageWithPayments {
  id: string;
  name: string;
  paymentSystem: "harian" | "periode";
  installments: number;
  totalAmount: number;  // Total of all payments
  dueAmount: number;    // Amount due now
  nextDueDate: string;  // Next payment date
  payments: Payment[];
  userPackageId: string;
}

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
}

const Pembayaran = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedPackage, setSelectedPackage] = useState<PackageWithPayments | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  
  // Fetch user packages and their payments
  const { data: userPackages = [], isLoading } = useQuery({
    queryKey: ['userPackages', 'payments'],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      // Fetch user packages
      const { data: userPackagesData, error: packagesError } = await supabase
        .from('user_packages')
        .select(`
          id,
          status,
          packages (
            id, 
            name,
            payment_system,
            installments
          )
        `)
        .eq('user_id', user.id);
      
      if (packagesError) throw new Error(packagesError.message);
      
      if (!userPackagesData || userPackagesData.length === 0) {
        return [];
      }
      
      // For each user package, get payments
      const packagesWithPayments = await Promise.all(
        userPackagesData.map(async (userPkg) => {
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('user_package_id', userPkg.id)
            .order('due_date', { ascending: true });
          
          if (paymentsError) throw new Error(paymentsError.message);
          
          // Calculate due amounts
          const now = new Date();
          const pendingPayments = paymentsData.filter(
            payment => payment.status === 'pending' && new Date(payment.due_date) <= now
          );
          
          const dueAmount = pendingPayments.reduce((total, payment) => total + payment.amount, 0);
          
          // Find next payment
          const nextPayment = paymentsData.find(payment => 
            payment.status === 'pending' || payment.status === 'upcoming'
          );
          
          return {
            id: userPkg.packages.id,
            name: userPkg.packages.name,
            paymentSystem: userPkg.packages.payment_system,
            installments: userPkg.packages.installments,
            totalAmount: paymentsData.reduce((total, payment) => total + payment.amount, 0),
            dueAmount: dueAmount,
            nextDueDate: nextPayment ? nextPayment.due_date : '',
            payments: paymentsData.map(payment => ({
              id: payment.id,
              amount: payment.amount,
              dueDate: payment.due_date,
              status: payment.status
            })),
            userPackageId: userPkg.id
          };
        })
      );
      
      return packagesWithPayments as PackageWithPayments[];
    },
    enabled: !!user
  });
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    } catch (e) {
      return '-';
    }
  };
  
  // Open payment dialog
  const handleOpenPayment = (pkg: PackageWithPayments) => {
    setSelectedPackage(pkg);
    setPaymentAmount(pkg.dueAmount);
    setIsPaymentDialogOpen(true);
  };
  
  // Process payment
  const processPayment = useMutation({
    mutationFn: async ({ packageId, amount }: { packageId: string, amount: number }) => {
      if (!selectedPackage) throw new Error("No package selected");
      
      setIsProcessingPayment(true);
      
      // Get pending payments
      const { data: pendingPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_package_id', selectedPackage.userPackageId)
        .eq('status', 'pending')
        .order('due_date', { ascending: true });
      
      if (paymentsError) throw new Error(paymentsError.message);
      
      // Process payments
      let remainingAmount = amount;
      const paidPayments = [];
      
      for (const payment of pendingPayments) {
        if (remainingAmount <= 0) break;
        
        if (remainingAmount >= payment.amount) {
          // Full payment
          const { error } = await supabase
            .from('payments')
            .update({
              status: 'paid',
              payment_date: new Date().toISOString()
            })
            .eq('id', payment.id);
          
          if (error) throw new Error(error.message);
          
          paidPayments.push(payment);
          remainingAmount -= payment.amount;
        } else {
          // Partial payment - create a record of partial payment and adjust the remaining
          // For simplicity, we're just keeping the record, but you could split the payment
          // into paid and pending portions
          const { error } = await supabase
            .from('payments')
            .update({
              amount: payment.amount - remainingAmount
            })
            .eq('id', payment.id);
          
          if (error) throw new Error(error.message);
          
          paidPayments.push({
            ...payment,
            amount: remainingAmount
          });
          remainingAmount = 0;
        }
      }
      
      // If we've paid all installments, update the package status
      if (pendingPayments.length === paidPayments.length) {
        const { error } = await supabase
          .from('user_packages')
          .update({ status: 'paid' })
          .eq('id', selectedPackage.userPackageId);
        
        if (error) throw new Error(error.message);
      }
      
      return { 
        paidAmount: amount,
        paidPayments
      };
    },
    onSuccess: () => {
      toast({
        title: "Pembayaran berhasil",
        description: "Pembayaran telah diproses dan dicatat dalam sistem."
      });
      queryClient.invalidateQueries({ queryKey: ['userPackages', 'payments'] });
      setIsProcessingPayment(false);
      setShowWhatsApp(true);
    },
    onError: (error) => {
      toast({
        title: "Gagal melakukan pembayaran",
        description: error.message,
        variant: "destructive"
      });
      setIsProcessingPayment(false);
    }
  });
  
  // Handle payment
  const handlePayment = () => {
    if (!selectedPackage) return;
    
    processPayment.mutate({
      packageId: selectedPackage.userPackageId,
      amount: paymentAmount
    });
  };
  
  // Open WhatsApp
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Halo, saya telah melakukan pembayaran untuk paket ${selectedPackage?.name} sebesar ${formatCurrency(paymentAmount)}. Berikut adalah bukti pembayaran saya.`
    );
    window.open(`https://wa.me/6285659261910?text=${message}`, '_blank');
    setIsPaymentDialogOpen(false);
    setShowWhatsApp(false);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-lilac-800">Pembayaran</h1>
        {isMobile && <SidebarTrigger />}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac-600"></div>
        </div>
      ) : userPackages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Anda belum membeli paket apapun
            </p>
            <Button 
              onClick={() => window.location.href = '/belanja'}
              className="bg-lilac-600 hover:bg-lilac-700"
            >
              Belanja Sekarang
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userPackages.map((pkg) => (
            <Card key={pkg.userPackageId} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-lilac-500 to-lilac-600 text-white pb-4">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Tagihan Saat Ini:</span>
                    <span className="font-medium">{formatCurrency(pkg.dueAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tagihan Selanjutnya:</span>
                    <span className="font-medium">{formatDate(pkg.nextDueDate)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                    <span className="font-medium">Total Tagihan:</span>
                    <span className="font-medium text-lilac-800">{formatCurrency(pkg.dueAmount)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <Button
                  onClick={() => handleOpenPayment(pkg)}
                  className="w-full bg-lilac-600 hover:bg-lilac-700"
                  disabled={pkg.dueAmount <= 0}
                >
                  {pkg.dueAmount > 0 ? "Bayar Sekarang" : "Tidak Ada Tagihan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {showWhatsApp ? "Konfirmasi Pembayaran" : "Pembayaran Paket"}
            </DialogTitle>
          </DialogHeader>
          
          {!showWhatsApp ? (
            <>
              <div className="py-4 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Detail Paket</h3>
                  <p className="text-sm text-muted-foreground">{selectedPackage?.name}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Total Tagihan</h3>
                  <p className="text-lg font-bold text-lilac-800">
                    {formatCurrency(selectedPackage?.dueAmount || 0)}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium mb-1">Pilih Metode Pembayaran</h3>
                  <div className="flex space-x-3">
                    <Button
                      type="button" 
                      variant="outline"
                      className={`flex-1 ${paymentAmount === selectedPackage?.dueAmount ? 'border-lilac-600 bg-lilac-50' : ''}`}
                      onClick={() => selectedPackage && setPaymentAmount(selectedPackage.dueAmount)}
                    >
                      Bayar Penuh
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={`flex-1 ${paymentAmount !== selectedPackage?.dueAmount ? 'border-lilac-600 bg-lilac-50' : ''}`}
                      onClick={() => setPaymentAmount(0)}
                    >
                      Nominal Lain
                    </Button>
                  </div>
                </div>
                
                {paymentAmount !== selectedPackage?.dueAmount && (
                  <div>
                    <h3 className="font-medium mb-2">Nominal Pembayaran</h3>
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      placeholder="Masukkan nominal pembayaran"
                      min={0}
                      max={selectedPackage?.dueAmount || 0}
                    />
                    
                    {paymentAmount > (selectedPackage?.dueAmount || 0) && (
                      <p className="text-sm text-red-500 mt-1">
                        Nominal tidak boleh melebihi total tagihan
                      </p>
                    )}
                    
                    {paymentAmount < (selectedPackage?.dueAmount || 0) && paymentAmount > 0 && (
                      <p className="text-sm text-amber-600 mt-1">
                        Sisa tagihan: {formatCurrency((selectedPackage?.dueAmount || 0) - paymentAmount)}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPaymentDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={handlePayment}
                  className="bg-lilac-600 hover:bg-lilac-700"
                  disabled={paymentAmount <= 0 || paymentAmount > (selectedPackage?.dueAmount || 0) || isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="animate-spin mr-2">⚪</span>
                      Memproses...
                    </>
                  ) : (
                    `Bayar ${formatCurrency(paymentAmount)}`
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="py-4 space-y-4 text-center">
                <p className="mb-4">
                  Pembayaran sebesar {formatCurrency(paymentAmount)} telah dicatat.
                </p>
                <p className="text-muted-foreground mb-4">
                  Mohon kirim bukti transfer ke WhatsApp berikut sebagai bukti pembayaran untuk konfirmasi cepat.
                </p>
              </div>
              
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => {
                    setIsPaymentDialogOpen(false);
                    setShowWhatsApp(false);
                  }}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Tutup
                </Button>
                <Button
                  onClick={handleWhatsApp}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Kirim Bukti Pembayaran
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pembayaran;
