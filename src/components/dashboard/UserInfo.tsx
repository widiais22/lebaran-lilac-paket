
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserInfoProps {
  name: string;
  phoneNumber: string;
  balance: number;
}

const UserInfo: React.FC<UserInfoProps> = ({ name, phoneNumber, balance }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nama
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{name}</div>
        </CardContent>
      </Card>
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nomor Handphone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{phoneNumber}</div>
        </CardContent>
      </Card>
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tagihan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-lilac-700">
            Rp {balance.toLocaleString('id-ID')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserInfo;
