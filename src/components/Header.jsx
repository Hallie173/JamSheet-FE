import React, { useState } from "react";
import { Search, SlidersHorizontal, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import logo cho thông báo hệ thống
import whiteLogo from "@/assets/white-logo.png";

export default function Header() {
  // Dữ liệu mẫu cho Bộ lọc
  const instruments = ["Piano", "Guitar", "Violin", "Drums", "Bass", "Vocal"];
  const genres = ["Pop", "Rock", "Acoustic", "Jazz", "Classical"];

  // Dữ liệu mẫu cho Thông báo
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "user",
      user: { name: "Anais desiree", avatar: "https://github.com/shadcn.png" },
      content: "đã yêu cầu bạn sửa bản thu âm của họ",
      time: "11 Mar 2026 - 22:39",
      isRead: false, // Chưa đọc -> Sẽ có nền giống mục Sidebar đang được hover
    },
    {
      id: 2,
      type: "system",
      content: "Phòng Jam 'Thanh Xuân' mà bạn theo dõi đã thêm bản thu mới.",
      time: "1 ngày trước",
      isRead: true, // Đã đọc -> Nền trong suốt
    },
  ]);

  // Kiểm tra xem có thông báo nào chưa đọc không để hiện "chấm trắng"
  const hasUnread = notifications.some((notif) => !notif.isRead);

  // Hàm đánh dấu đã đọc khi click vào thông báo
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <header className="h-20 border-b border-border bg-background flex items-center justify-between px-6 lg:px-8">
      
      {/* Cột trái: Vùng trống để cân bằng bố cục */}
      <div className="flex-1"></div>

      {/* Cột giữa: Thanh Tìm kiếm & Bộ lọc */}
      <div className="flex-1 flex justify-center max-w-2xl w-full">
        <div className="flex items-center w-full gap-2">
          
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm nhạc phổ, phòng Jam..."
              className="pl-10 pr-4 w-full bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          
          <Button variant="secondary" className="shrink-0 font-medium">
            Tìm kiếm
          </Button>

          {/* POPOVER BỘ LỌC */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0" title="Lọc theo Nhạc cụ & Tags">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-semibold leading-none">Bộ lọc tìm kiếm</h4>
                <hr className="border-border" />
                
                {/* Lọc Nhạc cụ */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-muted-foreground">Nhạc cụ</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {instruments.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox id={`inst-${item}`} />
                        <label htmlFor={`inst-${item}`} className="text-sm font-medium leading-none cursor-pointer">
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lọc Thể loại */}
                <div className="space-y-3 pt-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Thể loại (Tags)</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {genres.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox id={`genre-${item}`} />
                        <label htmlFor={`genre-${item}`} className="text-sm font-medium leading-none cursor-pointer">
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Cột phải: Thông báo */}
      <div className="flex-1 flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {/* Chấm trắng hiển thị khi có thông báo chưa đọc */}
              {hasUnread && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full border border-background"></span>
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-96 p-0" align="end">
            <div className="flex items-center justify-between p-4 pb-2">
              <h4 className="font-semibold text-lg">Thông báo</h4>
              <button className="text-xs text-muted-foreground hover:text-foreground">Đánh dấu đã đọc tất cả</button>
            </div>
            
            <div className="flex flex-col max-h-[400px] overflow-y-auto pb-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  // Logic CSS: Nếu chưa đọc thì nền đậm (bg-accent), nếu đã đọc thì nền trong suốt và hover mới đậm
                  className={`flex items-start gap-3 p-3 mx-2 rounded-lg cursor-pointer transition-colors ${
                    notif.isRead 
                      ? "bg-transparent hover:bg-accent" 
                      : "bg-accent"
                  }`}
                >
                  {/* Hiển thị Avatar user hoặc Logo hệ thống */}
                  {notif.type === "user" ? (
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarImage src={notif.user.avatar} alt="User Avatar" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <img src={whiteLogo} alt="System" className="w-6 h-6 object-cover" />
                    </div>
                  )}

                  {/* Nội dung thông báo */}
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <p className="text-sm text-foreground leading-tight">
                      {notif.type === "user" && <span className="font-semibold mr-1">{notif.user.name}</span>}
                      {notif.content}
                    </p>
                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
    </header>
  );
}