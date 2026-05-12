import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Bell, Music, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import whiteLogo from "@/assets/white-logo.png";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";

export default function Header() {
  const isLoggedIn = !!localStorage.getItem("token");
  
  // Dữ liệu bộ lọc (Đã thêm Flute và Other)
  const instruments = ["Piano", "Guitar", "Violin", "Drums", "Bass", "Vocal", "Flute", "Other"];
  const genres = ["Pop", "Rock", "Acoustic", "Jazz", "Classical", "Other"];

  // State Tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInsts, setSelectedInsts] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  // State Thông báo
  const [notifications, setNotifications] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const fetchNotifications = async () => {
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.NOTIFICATIONS), {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
  };
  
  // Lấy thông báo từ Backend khi đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      // Tùy chọn: Đặt interval để polling thông báo tự động mỗi 30s
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // LOGIC TÌM KIẾM
  const handleSearch = () => {
    // Nếu rỗng tất cả -> Không làm gì cả, không báo lỗi
    if (!searchQuery.trim() && selectedInsts.length === 0 && selectedGenres.length === 0) {
      return; 
    }

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append("q", searchQuery.trim());
    if (selectedInsts.length > 0) params.append("inst", selectedInsts.join(","));
    if (selectedGenres.length > 0) params.append("genre", selectedGenres.join(","));

    // Chuyển hướng sang trang thư viện để hiển thị kết quả
    window.location.href = `/sheets-library?${params.toString()}`;
  };

  const toggleFilter = (item, type) => {
    if (type === "inst") {
      setSelectedInsts(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    } else {
      setSelectedGenres(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    }
  };

  // LOGIC ĐỌC THÔNG BÁO
  const hasUnread = notifications.some((notif) => !notif.is_read);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      setNotifications(notifications.map((n) => (n._id === notif._id ? { ...n, is_read: true } : n)));
      try {
        await fetch(`${getApiUrl(API_ENDPOINTS.NOTIFICATIONS_READ(notif._id))}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
      } catch (error) { console.error(error) }
    }
    // Chuyển hướng dựa trên target_link
    if (notif.target_link) {
      window.location.href = notif.target_link;
    }
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    try {
      await fetch(getApiUrl(API_ENDPOINTS.NOTIFICATIONS_READ_ALL), {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
    } catch (error) { console.error(error) }
  };

  // HÀM RENDER NỘI DUNG THÔNG BÁO THEO TYPE
  const renderNotificationContent = (notif) => {
    switch (notif.type) {
      case "sheet_like":
        return <><span className="font-semibold text-foreground">{notif.sender_name}</span> đã thích nhạc phổ <span className="font-semibold text-primary">{notif.target_name}</span> của bạn.</>;
      case "room_new_track_owner":
        return <>Phòng thu <span className="font-semibold text-primary">{notif.target_name}</span> vừa được cập nhật bản thu mới.</>;
      case "room_new_track_participant":
        return <>Xem ngay cập nhật mới trong phòng thu <span className="font-semibold text-primary">{notif.target_name}</span>.</>;
      case "track_likes":
        return <>Bản thu <span className="font-semibold text-primary">{notif.target_name}</span> của bạn vừa nhận được <span className="font-bold text-destructive">{notif.count} lượt thích mới</span>.</>;
      default:
        return <>{notif.message}</>;
    }
  };

  return (
    <header className="h-20 border-b border-border bg-background flex items-center justify-between px-6 lg:px-8">
      <div className="flex-1"></div>

      {/* THANH TÌM KIẾM & BỘ LỌC */}
      <div className="flex-1 flex justify-center max-w-2xl w-full">
        <div className="flex items-center w-full gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm tên nhạc phổ..."
              className="pl-10 pr-4 w-full bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <Button variant="secondary" className="shrink-0 font-medium" onClick={handleSearch}>
            Tìm kiếm
          </Button>

          {/* BỘ LỌC */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 relative">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                {(selectedInsts.length > 0 || selectedGenres.length > 0) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full"></span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 shadow-xl" align="end">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold leading-none">Bộ lọc</h4>
                  {(selectedInsts.length > 0 || selectedGenres.length > 0) && (
                    <button 
                      className="text-xs text-muted-foreground hover:text-primary"
                      onClick={() => { setSelectedInsts([]); setSelectedGenres([]); }}
                    >
                      Xóa lọc
                    </button>
                  )}
                </div>
                <hr className="border-border" />

                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-muted-foreground">Nhạc cụ</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {instruments.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`inst-${item}`} 
                          checked={selectedInsts.includes(item)}
                          onCheckedChange={() => toggleFilter(item, "inst")}
                        />
                        <label htmlFor={`inst-${item}`} className="text-sm font-medium leading-none cursor-pointer">
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Thể loại</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {genres.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`genre-${item}`} 
                          checked={selectedGenres.includes(item)}
                          onCheckedChange={() => toggleFilter(item, "genre")}
                        />
                        <label htmlFor={`genre-${item}`} className="text-sm font-medium leading-none cursor-pointer">
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-2" 
                  onClick={() => { 
                    document.body.click(); // Mẹo nhỏ để tự động đóng popover
                    handleSearch(); 
                  }}
                >
                  Áp dụng & Tìm kiếm
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* THÔNG BÁO */}
      <div className="flex-1 flex justify-end">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {isLoggedIn && hasUnread && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full shadow-[0_0_0_2px_hsl(var(--background))]"></span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[400px] p-0 shadow-2xl" align="end">
            <div className="flex items-center justify-between p-4 pb-3 border-b border-border/50">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" /> Thông báo
              </h4>
              {isLoggedIn && hasUnread && (
                <button className="text-xs text-primary hover:underline flex items-center gap-1 font-medium" onClick={markAllAsRead}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đánh dấu đã đọc
                </button>
              )}
            </div>

            {!isLoggedIn ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Vui lòng <a href="/login" className="text-primary hover:underline font-bold">Đăng nhập</a> để xem thông báo.
              </div>
            ) : notifications.length === 0 ? (
               <div className="p-10 text-center text-muted-foreground flex flex-col items-center">
                 <Music className="w-10 h-10 mb-3 opacity-20" />
                 <p>Bạn chưa có thông báo nào.</p>
               </div>
            ) : (
              <div className="flex flex-col max-h-[450px] overflow-y-auto py-2 custom-scrollbar">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start gap-3 p-3 mx-2 my-0.5 rounded-lg cursor-pointer transition-all ${
                      notif.is_read ? "bg-transparent hover:bg-muted/50 opacity-70" : "bg-primary/10 hover:bg-primary/15"
                    }`}
                  >
                    {/* AVATAR */}
                    {notif.sender_avatar ? (
                      <Avatar className="w-10 h-10 shrink-0 border border-border/50 shadow-sm">
                        <AvatarImage src={notif.sender_avatar} />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">U</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${notif.type === 'track_likes' ? 'bg-destructive/10 text-destructive' : 'bg-primary/20 text-primary'}`}>
                         <img src={whiteLogo} alt="System" className="w-5 h-5 object-contain opacity-50" />
                      </div>
                    )}

                    {/* NỘI DUNG */}
                    <div className="flex flex-col gap-1 overflow-hidden flex-1 pt-0.5">
                      <p className="text-[13px] text-muted-foreground leading-snug">
                        {renderNotificationContent(notif)}
                      </p>
                      <span className="text-[11px] font-medium text-muted-foreground/70 mt-0.5 flex items-center gap-2">
                        {new Date(notif.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute:'2-digit', day: '2-digit', month:'2-digit' })}
                        {!notif.is_read && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}