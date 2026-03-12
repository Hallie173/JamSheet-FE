import React from "react";
import whiteLogo from "@/assets/white-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 flex flex-col items-center text-center">
          <img src={whiteLogo} alt="JamSheet Logo" className="w-12 h-12 rounded-full object-cover mb-2" />
          <CardTitle className="text-2xl font-bold">Đăng nhập JamSheet</CardTitle>
          <CardDescription>
            Kết nối và hòa âm cùng cộng đồng âm nhạc
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              defaultValue="hsgrandreve04173@gmail.com" 
              placeholder="nhacsi@example.com" 
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              {/* Link tạm thời, sẽ thay bằng thẻ Link của React Router sau */}
              <a href="/reset-password" className="text-sm font-medium text-primary hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <Input 
              id="password" 
              type="password" 
              defaultValue="12345678" 
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full">Đăng nhập</Button>
          <div className="text-sm text-center text-muted-foreground">
            Chưa có tài khoản?{" "}
            <a href="/signup" className="text-primary hover:underline font-medium">
              Đăng ký ngay
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}