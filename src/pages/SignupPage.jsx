import React from "react";
import whiteLogo from "@/assets/white-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 flex flex-col items-center text-center">
          <img src={whiteLogo} alt="JamSheet Logo" className="w-12 h-12 rounded-full object-cover mb-2" />
          <CardTitle className="text-2xl font-bold">Tạo tài khoản mới</CardTitle>
          <CardDescription>
            Bắt đầu hành trình sáng tạo âm nhạc của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Tên hiển thị (Username)</Label>
            <Input 
              id="username" 
              type="text" 
              defaultValue="le duy phuong ha" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="nhacsi@example.com" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Tạo mật khẩu (ít nhất 6 ký tự)" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              placeholder="Nhập lại mật khẩu" 
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full">Đăng ký</Button>
          <div className="text-sm text-center text-muted-foreground">
            Đã có tài khoản?{" "}
            <a href="/login" className="text-primary hover:underline font-medium">
              Đăng nhập
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}