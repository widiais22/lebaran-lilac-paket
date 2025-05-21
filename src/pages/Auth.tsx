
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    // If user is already authenticated, redirect
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let error;

      if (isLogin) {
        const result = await signIn(email, password);
        error = result.error;
      } else {
        const result = await signUp(email, password);
        error = result.error;

        if (!error) {
          toast({
            title: "Akun berhasil dibuat",
            description: "Silahkan cek email Anda untuk verifikasi.",
          });
        }
      }

      if (error) {
        let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";
        
        if (error.message.includes('credentials')) {
          errorMessage = "Email atau password salah.";
        } else if (error.message.includes('already')) {
          errorMessage = "Email sudah terdaftar.";
        } else if (error.message.includes('valid')) {
          errorMessage = "Masukkan email yang valid.";
        }

        toast({
          title: "Gagal",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Terjadi kesalahan",
        description: "Tidak dapat terhubung ke server. Silakan coba lagi nanti.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-lilac-800">
              {isLogin ? "Masuk" : "Daftar"}
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-lilac-600 hover:bg-lilac-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⚪</span>
                    {isLogin ? "Masuk..." : "Daftar..."}
                  </>
                ) : (
                  <>{isLogin ? "Masuk" : "Daftar"}</>
                )}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin
                  ? "Belum punya akun? Daftar"
                  : "Sudah punya akun? Masuk"}
              </Button>
              <div className="text-center mt-4">
                <Link to="/" className="text-lilac-600 hover:underline text-sm">
                  Kembali ke Beranda
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
