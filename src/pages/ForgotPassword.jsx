import React from "react";
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

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!email) {
      setMessage({ type: "error", text: "Vui lòng nhập email đã đăng ký!" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        getApiUrl(API_ENDPOINTS.FORGOT_PASSWORD),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gửi yêu cầu thất bại! Vui lòng thử lại!",
        );
      }

      setMessage({
        type: "success",
        text: "Liên kết khôi phục đã được gửi đến email của bạn! Vui lòng kiểm tra hộp thư!",
      });
      setEmail("");
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
          title="Khôi phục mật khẩu"
          description="Nhập email của bạn để nhận liên kết đặt lại mật khẩu"
        />
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <AlertMessage message={message.text} type={message.type} />
            <div className="space-y-2">
              <Label htmlFor="email">Email đã đăng ký</Label>
              <Input
                id="email"
                type="email"
                placeholder="nhacsi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang gửi email..." : "Gửi liên kết khôi phục"}
            </Button>
            <div className="text-sm text-center">
              <a
                href="/login"
                className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại Đăng nhập
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
