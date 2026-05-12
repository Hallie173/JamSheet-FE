import { Home, Mic2, Music, Library, User, LogOut, Moon } from "lucide-react";
import blackLogo from "@/assets/black-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";

export default function Sidebar() {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const isLoggedIn = !!user;
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const menuItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Trang chủ",
      href: "/",
    },
    {
      icon: <Mic2 className="w-5 h-5" />,
      label: "Phòng Hợp Tấu",
      href: "/jam-room",
    },
    {
      icon: <Music className="w-5 h-5" />,
      label: "Thư viện Nhạc phổ",
      href: "/sheets-library",
    },
    {
      icon: <Library className="w-5 h-5" />,
      label: "Bản thu của tôi",
      href: "/my-records",
    },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full">
      <a
        href="/"
        className="h-20 flex items-center px-6 border-b border-border hover:opacity-80 transition-opacity cursor-pointer"
      >
        <img src={blackLogo} alt="App Logo" className="w-10 h-10 mr-3" />
      </a>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent transition-colors outline-none text-left">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={user.avatar_url || "https://github.com/shadcn.png"}
                    alt="Avatar"
                  />
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium text-sm truncate">
                    {user.username}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="top" className="w-56 mb-2">
              <a href="/profile" className="w-full">
                <DropdownMenuItem className="cursor-pointer">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Thông tin cá nhân</span>
                  </div>
                </DropdownMenuItem>
              </a>

              <DropdownMenuItem
                className="cursor-pointer flex justify-between items-center"
                onSelect={(e) => {
                  e.preventDefault(); 
                  toggleTheme(); 
                }}
              >
                <div className="flex items-center">
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Chế độ tối</span>
                </div>
                {/* Switch cực kỳ gọn nhẹ, sẽ tự động áp dụng CSS đã cập nhật trong file switch.jsx */}
                <Switch
                  id="theme-mode"
                  checked={theme === "dark"}
                  className="pointer-events-none"
                />
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={handleLogout}
              >
                <a href="/login" className="flex items-center w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-col gap-2">
            <a href="/login">
              <Button variant="outline" className="w-full">
                Đăng nhập
              </Button>
            </a>
            <a href="/register">
              <Button variant="outline" className="w-full">
                Tạo tài khoản
              </Button>
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}