import React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import AuthHeader from "@/components/ui/auth-header";
import AlertMessage from "@/components/ui/alert-message";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Đăng nhập thất bại! Vui lòng kiểm tra lại!",
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <Card className="w-full max-w-[95%] sm:max-w-md rounded-2xl sm:rounded-xl shadow-2xl sm:shadow-lg border-border/50 sm:border-border">
        <AuthHeader
          title="Đăng nhập JamSheet"
          description="Kết nối và hòa âm cùng cộng đồng âm nhạc"
        />
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 sm:space-y-4">
            <AlertMessage message={error} type="error" />
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nhacsi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 sm:h-10 text-base sm:text-sm rounded-xl sm:rounded-md"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">
                  Mật khẩu
                </Label>
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative w-full">
                <Input
                  className="pr-12 h-12 sm:h-10 text-base sm:text-sm rounded-xl sm:rounded-md"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 sm:w-4 sm:h-4" />
                  ) : (
                    <Eye className="w-5 h-5 sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full h-12 sm:h-10 text-base sm:text-sm font-semibold rounded-xl sm:rounded-md transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Chưa có tài khoản?{" "}
              <a
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Đăng ký ngay
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
