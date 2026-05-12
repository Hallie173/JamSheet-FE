import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import AuthHeader from "@/components/ui/auth-header";
import AlertMessage from "@/components/ui/alert-message";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [message, setMessage] = React.useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!newPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập mật khẩu mới!" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu phải có ít nhất 6 ký tự!" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        getApiUrl(API_ENDPOINTS.RESET_PASSWORD(token)),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Đặt lại mật khẩu thất bại! Vui lòng thử lại!",
        );
      }

      setMessage({
        type: "success",
        text: "Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập lại!",
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <AuthHeader
          title="Tạo mật khẩu mới"
          description="Vui lòng nhập mật khẩu mới cho tài khoản của bạn"
        />
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <AlertMessage message={message.text} type={message.type} />
            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <div className="relative w-full">
                <Input
                  className="pr-10"
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
              <div className="relative w-full">
                <Input
                  className="pr-10"
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Quay lại{" "}
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
