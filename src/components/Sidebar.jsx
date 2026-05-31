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
    { icon: Home, label: "Trang chủ", href: "/" },
    { icon: Mic2, label: "Hợp Tấu", href: "/jam-room" },
    { icon: Music, label: "Nhạc phổ", href: "/sheets-library" },
    { icon: Library, label: "Bản thu", href: "/my-records" },
  ];

  return (
    <aside className="fixed sm:relative bottom-0 left-0 right-0 sm:bottom-auto w-full sm:w-64 border-t sm:border-t-0 sm:border-r border-border bg-card flex flex-row sm:flex-col h-16 sm:h-full z-50">
      {/* Logo chỉ hiện trên Desktop */}
      <a
        href="/"
        className="hidden sm:flex h-20 items-center px-6 border-b border-border hover:opacity-80 transition-opacity cursor-pointer shrink-0"
      >
        <img src={blackLogo} alt="App Logo" className="w-10 h-10 mr-3" />
      </a>

      {/* Menu Điều hướng */}
      <nav className="flex-1 flex flex-row sm:flex-col justify-around sm:justify-start items-center sm:items-stretch py-0 sm:py-6 px-2 sm:px-4 sm:space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href={item.href}
              className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 p-2 sm:py-2.5 sm:px-3 rounded-xl sm:rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-1 sm:flex-none"
            >
              <Icon className="w-6 h-6 sm:w-5 sm:h-5" />
              <span className="text-[10px] sm:text-sm sm:font-medium leading-none">{item.label}</span>
            </a>
          );
        })}

        {/* Khu vực Profile gộp vào cuối thanh điều hướng trên Mobile */}
        <div className="flex sm:hidden flex-col items-center justify-center p-2 flex-1">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center gap-1 outline-none">
                  <Avatar className="w-6 h-6 border border-border">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] text-muted-foreground leading-none">Cá nhân</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56 mb-2 shadow-2xl rounded-2xl">
                <a href="/profile" className="w-full">
                  <DropdownMenuItem className="cursor-pointer h-12 text-base">
                    <User className="mr-3 h-5 w-5" /> Thông tin cá nhân
                  </DropdownMenuItem>
                </a>
                <DropdownMenuItem
                  className="cursor-pointer h-12 text-base flex justify-between items-center"
                  onSelect={(e) => { e.preventDefault(); toggleTheme(); }}
                >
                  <div className="flex items-center">
                    <Moon className="mr-3 h-5 w-5" /> Chế độ tối
                  </div>
                  <Switch checked={theme === "dark"} className="pointer-events-none" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer h-12 text-base text-destructive focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-3 h-5 w-5" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <a href="/login" className="flex flex-col items-center gap-1 text-muted-foreground">
              <User className="w-6 h-6" />
              <span className="text-[10px] leading-none">Đăng nhập</span>
            </a>
          )}
        </div>
      </nav>

      {/* Khu vực Profile chỉ hiện ở dưới cùng trên Desktop */}
      <div className="hidden sm:block p-4 border-t border-border shrink-0">
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent transition-colors outline-none text-left">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar_url || "https://github.com/shadcn.png"} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium text-sm truncate">{user.username}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" className="w-56 mb-2">
              <a href="/profile" className="w-full">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" /> <span>Thông tin cá nhân</span>
                </DropdownMenuItem>
              </a>
              <DropdownMenuItem
                className="cursor-pointer flex justify-between items-center"
                onSelect={(e) => { e.preventDefault(); toggleTheme(); }}
              >
                <div className="flex items-center">
                  <Moon className="mr-2 h-4 w-4" /> <span>Chế độ tối</span>
                </div>
                <Switch id="theme-mode" checked={theme === "dark"} className="pointer-events-none" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-col gap-2">
            <a href="/login"><Button variant="outline" className="w-full">Đăng nhập</Button></a>
            <a href="/register"><Button variant="outline" className="w-full">Tạo tài khoản</Button></a>
          </div>
        )}
      </div>
    </aside>
  );
}