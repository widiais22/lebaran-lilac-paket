
import React, { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WhatsApp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface PaymentPackage {
  id: string;
  package_name: string;
  total_due: number;
  next_due_date: string | null;
  payments: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  due_date: string;
  status: string;
}

const Pembayaran = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [userPackages, setUserPackages] = useState<PaymentPackage[]>([]);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    fetchUserPackages();
  }, [user]);

  const fetchUserPackages = async () => {
    try {
      setLoading(true);
      
      // Fetch user packages with their packages
      const { data: userPackagesData, error: userPackagesError } = await supabase
        .from('user_packages')
        .select(`
          id,
          packages (
            id,
            name,
            payment_system,
            installment_amount,
            payment_period
          )
        `)
        .eq('user_id', user?.id);
      
      if (userPackagesError) throw userPackagesError;
      
      if (!userPackagesData || userPackagesData.length === 0) {
        setUserPackages([]);
        setLoading(false);
        return;
      }
      
      // Fetch payments for each user package
      const packagesWithPayments = await Promise.all(userPackagesData.map(async (up) => {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('id, amount, due_date, status')
          .eq('user_package_id', up.id)
          .order('due_date', { ascending: true });
          
        if (paymentsError) throw paymentsError;
        
        // Calculate total due amount (pending payments only)
        const totalDue = paymentsData
          .filter(payment => payment.status === 'pending')
          .reduce((sum, payment) => sum + payment.amount, 0);
        
        // Find next payment due date
        const pendingPayments = paymentsData.filter(payment => payment.status === 'pending');
        const nextDueDate = pendingPayments.length > 0 ? pendingPayments[0].due_date : null;
        
        // Initialize payment amount to full amount due
        setPaymentAmounts(prev => ({
          ...prev,
          [up.id]: totalDue
        }));
        
        return {
          id: up.id,
          package_name: up.packages?.name || 'Unknown Package',
          total_due: totalDue,
          next_due_date: nextDueDate,
          payments: paymentsData || []
        };
      }));
      
      setUserPackages(packagesWithPayments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user packages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load payment data. Please try again later."
      });
      setLoading(false);
    }
  };

  const handlePaymentAmountChange = (packageId: string, amount: string) => {
    const numericValue = amount === '' ? 0 : Number(amount);
    setPaymentAmounts(prev => ({
      ...prev,
      [packageId]: numericValue
    }));
  };

  const handlePayFull = (packageId: string, fullAmount: number) => {
    setPaymentAmounts(prev => ({
      ...prev,
      [packageId]: fullAmount
    }));
  };

  const processPayment = async (packageId: string, amount: number) => {
    try {
      const packageData = userPackages.find(pkg => pkg.id === packageId);
      if (!packageData) return;
      
      // Record payment in database
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'processing',
          payment_date: new Date().toISOString()
        })
        .in('id', packageData.payments
          .filter(payment => payment.status === 'pending')
          .slice(0, Math.ceil(amount / packageData.payments[0]?.amount || 1))
          .map(payment => payment.id)
        );
      
      if (error) throw error;
      
      toast({
        title: "Payment Processing",
        description: "Your payment is being processed. Please send the proof of payment via WhatsApp for faster confirmation."
      });
      
      // Refresh data
      fetchUserPackages();
      
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again."
      });
    }
  };

  const openWhatsApp = () => {
    const phoneNumber = "6285659261910";
    const message = encodeURIComponent("Halo, saya ingin konfirmasi pembayaran paket lebaran. Berikut bukti pembayarannya: ");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-lilac-800">Pembayaran</h1>
        {isMobile && <SidebarTrigger />}
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac-600"></div>
          </CardContent>
        </Card>
      ) : userPackages.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Anda belum memiliki paket. Silakan belanja terlebih dahulu.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {userPackages.map((userPackage) => (
            <Card key={userPackage.id} className="overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{userPackage.package_name}</h2>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Tagihan Saat Ini:</span>
                    <span className="font-medium">{formatCurrency(userPackage.total_due)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tagihan Selanjutnya:</span>
                    <span>{formatDate(userPackage.next_due_date)}</span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Button 
                        onClick={() => handlePayFull(userPackage.id, userPackage.total_due)}
                        variant="outline" 
                        size="sm"
                      >
                        Bayar Penuh
                      </Button>
                      <span>atau</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Nominal pembayaran"
                        value={paymentAmounts[userPackage.id] || ''}
                        onChange={(e) => handlePaymentAmountChange(userPackage.id, e.target.value)}
                        className="max-w-xs"
                      />
                      <Button 
                        onClick={() => processPayment(userPackage.id, paymentAmounts[userPackage.id] || 0)}
                        disabled={!paymentAmounts[userPackage.id] || paymentAmounts[userPackage.id] <= 0}
                      >
                        Bayar
                      </Button>
                    </div>
                    
                    {paymentAmounts[userPackage.id] > userPackage.total_due && (
                      <p className="text-sm text-green-600 mt-2">
                        Saldo: {formatCurrency(paymentAmounts[userPackage.id] - userPackage.total_due)}
                      </p>
                    )}
                    {paymentAmounts[userPackage.id] > 0 && paymentAmounts[userPackage.id] < userPackage.total_due && (
                      <p className="text-sm text-amber-600 mt-2">
                        Sisa tagihan: {formatCurrency(userPackage.total_due - paymentAmounts[userPackage.id])}
                      </p>
                    )}
                  </div>
                  
                  {paymentAmounts[userPackage.id] > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 gap-2"
                      onClick={openWhatsApp}
                    >
                      <WhatsApp size={16} />
                      Konfirmasi via WhatsApp
                    </Button>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-6 pt-0 border-t border-border mt-6">
                <div className="w-full flex justify-between items-center">
                  <span className="font-medium">Total Tagihan:</span>
                  <span className="font-bold text-lg">{formatCurrency(userPackage.total_due)}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pembayaran;
