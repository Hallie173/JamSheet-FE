import { Home, Mic2, Music, Library, Settings } from "lucide-react";
import blackLogo from "@/assets/black-logo.png";

export default function Sidebar() {
  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: "Trang chủ" },
    { icon: <Mic2 className="w-5 h-5" />, label: "Phòng Hợp Tấu" },
    { icon: <Music className="w-5 h-5" />, label: "Thư viện Nhạc phổ" },
    { icon: <Library className="w-5 h-5" />, label: "Bản thu của tôi" },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <img src={blackLogo} alt="App Logo" className="w-10 h-10 mr-3" />
      </div>

      {/* Menu Điều hướng */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Nút Cài đặt dưới cùng */}
      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Cài đặt</span>
        </button>
      </div>
    </aside>
  );
}