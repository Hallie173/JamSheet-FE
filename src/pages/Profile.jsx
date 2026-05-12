import React, { useState, useEffect, useMemo, useRef } from "react";
import { User, Heart, Mic2, UploadCloud, Disc, Edit3, Camera, Calendar, X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverInputRef = useRef(null);
  
  // Ref để gọi input file ẩn
  const fileInputRef = useRef(null);

  const [editData, setEditData] = useState({ 
    username: "", 
    bio: "", 
    avatar_url: "", 
    instruments: "" 
  });

  // Tải dữ liệu hồ sơ khi vào trang
  useEffect(() => { 
    fetchProfile(); 
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(API_ENDPOINTS.USERS_PROFILE), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setEditData({
          username: data.username || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          cover_url: data.cover_url || "",
          instruments: Array.isArray(data.instruments) ? data.instruments.join(", ") : ""
        });
      }
    } catch (error) { 
      console.error(error); 
    }
  };

  // Hàm xử lý lưu hồ sơ
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      // Tách chuỗi thành mảng
      const instrumentsArray = editData.instruments
        .split(",")
        .map(i => i.trim())
        .filter(i => i);

      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...editData,
          instruments: instrumentsArray
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Cập nhật lại state profile
        setProfile((prev) => ({ ...prev, ...data.user }));
        setIsEditing(false);
      } else {
        alert(data.message || "Lỗi cập nhật!");
      }
    } catch (error) {
      alert("Lỗi server: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Hàm xử lý upload Avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(getApiUrl(API_ENDPOINTS.USERS_AVATAR), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setEditData(prev => ({ ...prev, avatar_url: data.avatar_url }));
        // Cập nhật avatar hiển thị ngay lập tức để người dùng xem trước
        setProfile(prev => ({ ...prev, avatar_url: data.avatar_url }));
      } else {
        alert(data.message || "Lỗi tải ảnh!");
      }
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("cover", file); // Phải khớp với 'upload.single("cover")' ở route

      const res = await fetch(getApiUrl(API_ENDPOINTS.USERS_UPLOAD_COVER), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setEditData(prev => ({ ...prev, cover_url: data.cover_url }));
        setProfile(prev => ({ ...prev, cover_url: data.cover_url }));
      } else {
        alert(data.message || "Lỗi tải ảnh bìa!");
      }
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Mảng màu sáng nổi bật cho Badge (Dùng trên nền tối)
  const brightColors = ["#00f2ff", "#70ff00", "#ff00e5", "#ffff00", "#ff9900", "#00ff95", "#ff4d4d"];
  
  // Tính toán dữ liệu Biểu đồ nhiệt (Heatmap) trong 90 ngày
  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        activities: profile?.activity_log?.[dateStr] || []
      });
    }
    return days;
  }, [profile]);

  if (!profile) return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ================= BANNER ================= */}
      <div 
        className="relative h-64 w-full border-b border-border/50 bg-cover bg-center transition-all duration-500"
        style={{ 
          backgroundImage: profile.cover_url 
            ? `url(${profile.cover_url})` 
            : "linear-gradient(to right, #0f172a, #1e293b, #0f172a)" 
        }}
      >
        {/* Lớp phủ đen để nổi bật nội dung */}
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        
        {/* Nút Upload Ảnh Bìa (Chỉ hiện khi bật chế độ Chỉnh sửa) */}
        {isEditing && (
          <div className="absolute top-4 right-8 z-10 animate-in fade-in">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={coverInputRef} 
              onChange={handleCoverChange} 
            />
            <Button 
              variant="secondary" 
              className="gap-2 shadow-xl bg-background/90 hover:bg-background backdrop-blur-sm"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
            >
              {isUploadingCover ? <Loader2 className="w-4 h-4 animate-spin"/> : <Camera className="w-4 h-4"/>}
              {isUploadingCover ? "Đang tải..." : "Đổi ảnh bìa"}
            </Button>
          </div>
        )}

        {/* Nút bật/tắt chế độ chỉnh sửa (Giữ nguyên) */}
        <div className="absolute bottom-4 right-8 z-10">
           <Button 
              variant="secondary" 
              className="gap-2 shadow-xl bg-background/90 hover:bg-background backdrop-blur-sm" 
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="w-4 h-4"/> : <Edit3 className="w-4 h-4"/>}
              {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa hồ sơ"}
           </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 relative -mt-24">
        {/* ================= KHU VỰC THÔNG TIN & AVATAR ================= */}
        {!isEditing ? (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
            {/* Avatar phóng to (Chế độ xem) */}
            <Avatar className="w-44 h-44 border-[6px] border-background shadow-2xl">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-4xl">{profile.username?.[0]}</AvatarFallback>
            </Avatar>

            <div className="mt-6 space-y-2">
              <h1 className="text-4xl font-black tracking-tight">{profile.username}</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg italic">
                "{profile.bio || "Chưa có tiểu sử nào được viết..."}"
              </p>
              
              {/* Nhạc cụ (Badge) */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {profile.instruments?.map((inst, idx) => (
                  <span 
                    key={idx} 
                    style={{ color: brightColors[idx % brightColors.length], borderColor: brightColors[idx % brightColors.length] }}
                    className="px-4 py-1 rounded-full border text-xs font-bold bg-white/5 backdrop-blur-sm shadow-sm"
                  >
                    {inst}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ================= CHẾ ĐỘ CHỈNH SỬA ================= */
          <Card className="max-w-3xl mx-auto animate-in fade-in duration-300 bg-card border-primary/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Khu vực Upload Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="w-40 h-40 border-[4px] border-background shadow-xl">
                      <AvatarImage src={editData.avatar_url} />
                      <AvatarFallback className="text-4xl">{editData.username?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploadingAvatar ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white mb-1" />}
                      <span className="text-white text-xs font-medium">Đổi ảnh</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleAvatarChange} 
                  />
                </div>

                {/* Form nhập liệu */}
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Tên hiển thị</Label>
                    <Input 
                      className="h-12 text-lg"
                      value={editData.username} 
                      onChange={(e) => setEditData({...editData, username: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Nhạc cụ có thể chơi</Label>
                    <Input 
                      placeholder="VD: Piano, Guitar Acoustic..." 
                      value={editData.instruments} 
                      onChange={(e) => setEditData({...editData, instruments: e.target.value})} 
                    />
                    <p className="text-[10px] text-muted-foreground">Ngăn cách các nhạc cụ bằng dấu phẩy (,)</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Tiểu sử</Label>
                    <Textarea 
                      rows={4} 
                      placeholder="Giới thiệu một chút về phong cách âm nhạc của bạn..." 
                      value={editData.bio} 
                      onChange={(e) => setEditData({...editData, bio: e.target.value})} 
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Hủy</Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving || isUploadingAvatar} className="shadow-lg shadow-primary/20">
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Lưu thay đổi
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================= DÀN NGANG THÀNH TÍCH ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { label: "Lượt tim nhận được", value: profile.total_likes_received || 0, icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "Bản thu đóng góp", value: profile.total_tracks_contributed || 0, icon: Mic2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Dự án tham gia", value: profile.total_projects_joined || 0, icon: Disc, color: "text-primary", bg: "bg-primary/10" },
            { label: "Nhạc phổ tải lên", value: profile.total_sheets_uploaded || 0, icon: UploadCloud, color: "text-amber-500", bg: "bg-amber-500/10" },
          ].map((item, idx) => (
            <Card key={idx} className="bg-card/50 border-border/50 hover:border-border transition-all shadow-sm">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 ${item.bg}`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="text-3xl font-black">{item.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{item.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ================= BIỂU ĐỒ NHIỆT (ACTIVITY HEATMAP) ================= */}
        <div className="mt-8 bg-card/30 border border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Nhật ký hoạt động (90 ngày qua)</h3>
          </div>
          
          {/* Vùng lưới Heatmap */}
          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
            {heatmapDays.map((day, idx) => (
              <div key={idx} className="relative group cursor-pointer">
                <div 
                  className={`w-4 h-4 rounded-[3px] border border-gray-300 dark:border-gray-600 transition-colors ${
                    day.activities.length === 0 ? "bg-muted/30 hover:bg-muted/50" :
                    day.activities.length === 1 ? "bg-primary/30 hover:bg-primary/50" :
                    day.activities.length === 2 ? "bg-primary/60 hover:bg-primary/80" : "bg-primary hover:bg-primary/90"
                  }`}
                />
                
                {/* Tooltip hiển thị khi Hover */}
                {day.activities.length > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max min-w-[150px] bg-popover border border-border shadow-2xl rounded-lg p-3 text-[14px] z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100">
                    <p className="font-bold border-b border-border pb-1 mb-1 text-primary">{day.date}</p>
                    {day.activities.map((act, i) => (
                      <div key={i} className="py-1 whitespace-nowrap">• {act}</div>
                    ))}
                    {/* Mũi tên chỉ xuống cho tooltip */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-popover"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Chú thích màu sắc */}
          <div className="flex justify-between items-center mt-6 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            <span>90 ngày trước</span>
            <div className="flex items-center gap-2">
              <span>Ít</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-muted/30 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary/30 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary/60 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary rounded-sm"></div>
              </div>
              <span>Nhiều</span>
            </div>
            <span>Hôm nay</span>
          </div>
        </div>
      </div>
    </div>
  );
}