import React from "react";
import whiteLogo from "@/assets/white-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 flex flex-col items-center text-center">
          <img src={whiteLogo} alt="JamSheet Logo" className="w-12 h-12 rounded-full object-cover mb-2" />
          <CardTitle className="text-2xl font-bold">Khôi phục mật khẩu</CardTitle>
          <CardDescription>
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email đã đăng ký</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="nhacsi@example.com" 
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full">Gửi liên kết khôi phục</Button>
          <div className="text-sm text-center">
            <a href="/login" className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Đăng nhập
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}