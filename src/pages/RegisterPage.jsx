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

export default function RegisterPage() {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.REGISTER), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại! Vui lòng thử lại!");
      }

      alert("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ!");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <Card className="w-full max-w-[95%] sm:max-w-md rounded-2xl sm:rounded-xl shadow-2xl sm:shadow-lg border-border/50 sm:border-border my-8">
        <AuthHeader
          title="Tạo tài khoản mới"
          description="Bắt đầu hành trình sáng tạo âm nhạc của bạn"
        />

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <AlertMessage message={error} type="error" />
            <div className="space-y-1.5">
              <Label htmlFor="username">Tên hiển thị (Username)</Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên hiển thị"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 sm:h-10 text-base sm:text-sm rounded-xl sm:rounded-md"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
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
            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative w-full">
                <Input
                  className="pr-12 h-12 sm:h-10 text-base sm:text-sm rounded-xl sm:rounded-md"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
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
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
              <div className="relative w-full">
                <Input
                  className="pr-12 h-12 sm:h-10 text-base sm:text-sm rounded-xl sm:rounded-md"
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Đã có tài khoản?{" "}
              <a
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Đăng nhập
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
