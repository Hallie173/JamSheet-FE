import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  User,
  Heart,
  Mic2,
  UploadCloud,
  Disc,
  Edit3,
  Camera,
  Calendar,
  X,
  Save,
  Loader2,
} from "lucide-react";
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
  const fileInputRef = useRef(null);

  const [editData, setEditData] = useState({
    username: "",
    bio: "",
    avatar_url: "",
    instruments: "",
  });

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
          instruments: Array.isArray(data.instruments)
            ? data.instruments.join(", ")
            : "",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const instrumentsArray = editData.instruments
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...editData,
            instruments: instrumentsArray,
          }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        const { username, bio, avatar_url, cover_url, instruments } = data.user;
        setProfile((prev) => ({
          ...prev,
          username,
          bio,
          avatar_url,
          cover_url,
          instruments,
        }));
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

  // [CẬP NHẬT KIẾN TRÚC MỚI] Hàm xử lý upload Avatar trực tiếp lên Cloudinary
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      // 1. BẮN FILE THẲNG LÊN CLOUDINARY
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "jamsheet_preset"); // Dùng chung preset với nhạc phổ
      formData.append("folder", "jamsheet_avatars");

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/dfwrrelbq/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const cloudData = await cloudRes.json();
      if (!cloudRes.ok) throw new Error(cloudData.error.message);

      const avatar_url = cloudData.secure_url;

      // 2. GỬI LINK URL VỀ BACKEND RENDER (Giờ chỉ gửi JSON, không gửi Form Data nữa)
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(API_ENDPOINTS.USERS_AVATAR), {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Chú ý: Đã đổi sang JSON
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar_url }),
      });

      const data = await res.json();
      if (res.ok) {
        setEditData((prev) => ({ ...prev, avatar_url: data.avatar_url }));
        setProfile((prev) => ({ ...prev, avatar_url: data.avatar_url }));
      } else {
        alert(data.message || "Lỗi cập nhật link ảnh!");
      }
    } catch (error) {
      alert("Lỗi tải ảnh: " + error.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // [CẬP NHẬT KIẾN TRÚC MỚI] Hàm xử lý upload Cover
  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      // 1. BẮN FILE THẲNG LÊN CLOUDINARY
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "jamsheet_preset");
      formData.append("folder", "jamsheet_covers");

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/dfwrrelbq/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const cloudData = await cloudRes.json();
      if (!cloudRes.ok) throw new Error(cloudData.error.message);

      const cover_url = cloudData.secure_url;

      // 2. GỬI LINK URL VỀ BACKEND RENDER
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(API_ENDPOINTS.USERS_UPLOAD_COVER), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cover_url }),
      });

      const data = await res.json();
      if (res.ok) {
        setEditData((prev) => ({ ...prev, cover_url: data.cover_url }));
        setProfile((prev) => ({ ...prev, cover_url: data.cover_url }));
      } else {
        alert(data.message || "Lỗi cập nhật link ảnh bìa!");
      }
    } catch (error) {
      alert("Lỗi tải ảnh: " + error.message);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const brightColors = [
    "#00f2ff",
    "#70ff00",
    "#ff00e5",
    "#ffff00",
    "#ff9900",
    "#00ff95",
    "#ff4d4d",
  ];

  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        activities: profile?.activity_log?.[dateStr] || [],
      });
    }
    return days;
  }, [profile]);

  if (!profile)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ================= BANNER ================= */}
      <div
        className="relative h-48 sm:h-64 w-full border-b border-border/50 bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: profile.cover_url
            ? `url(${profile.cover_url})`
            : "linear-gradient(to right, #0f172a, #1e293b, #0f172a)",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

        {isEditing && (
          <div className="absolute top-4 right-4 sm:right-8 z-10 animate-in fade-in">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={coverInputRef}
              onChange={handleCoverChange}
            />
            <Button
              variant="secondary"
              className="gap-2 shadow-2xl sm:shadow-xl bg-background/90 hover:bg-background backdrop-blur-sm h-10 sm:h-10 rounded-xl sm:rounded-md text-sm sm:text-sm px-3 sm:px-4"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
            >
              {isUploadingCover ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isUploadingCover ? "Đang tải..." : "Đổi ảnh bìa"}
              </span>
            </Button>
          </div>
        )}

        <div className="absolute bottom-4 right-4 sm:right-8 z-10">
          <Button
            variant="secondary"
            className="gap-2 shadow-2xl sm:shadow-xl bg-background/90 hover:bg-background backdrop-blur-sm h-10 sm:h-10 rounded-xl sm:rounded-md text-sm sm:text-sm px-3 sm:px-4"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <X className="w-4 h-4" />
            ) : (
              <Edit3 className="w-4 h-4" />
            )}
            {isEditing ? (
              "Hủy"
            ) : (
              <span className="hidden sm:inline">Chỉnh sửa hồ sơ</span>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 relative -mt-16 sm:-mt-24">
        {/* ================= KHU VỰC THÔNG TIN & AVATAR ================= */}
        {!isEditing ? (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
            <Avatar className="w-32 h-32 sm:w-44 sm:h-44 border-[4px] sm:border-[6px] border-background shadow-2xl">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-4xl">
                {profile.username?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="mt-4 sm:mt-6 space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {profile.username}
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg italic px-4">
                "{profile.bio || "Chưa có tiểu sử nào được viết..."}"
              </p>

              <div className="flex flex-wrap justify-center gap-2 mt-4 px-2">
                {profile.instruments?.map((inst, idx) => (
                  <span
                    key={idx}
                    style={{
                      color: brightColors[idx % brightColors.length],
                      borderColor: brightColors[idx % brightColors.length],
                    }}
                    className="px-3 sm:px-4 py-1 rounded-full border text-[10px] sm:text-xs font-bold bg-white/5 backdrop-blur-sm shadow-sm"
                  >
                    {inst}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ================= CHẾ ĐỘ CHỈNH SỬA ================= */
          <Card className="max-w-3xl mx-auto animate-in fade-in duration-300 bg-card border-primary/20 shadow-2xl sm:shadow-xl rounded-2xl sm:rounded-xl">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-center md:items-start">
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Avatar className="w-28 h-28 sm:w-40 sm:h-40 border-[4px] border-background shadow-xl">
                      <AvatarImage src={editData.avatar_url} />
                      <AvatarFallback className="text-4xl">
                        {editData.username?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploadingAvatar ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white mb-1" />
                      )}
                      <span className="text-white text-[10px] sm:text-xs font-medium">
                        Đổi ảnh
                      </span>
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

                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      Tên hiển thị
                    </Label>
                    <Input
                      className="h-12 sm:h-10 text-base sm:text-sm rounded-xl sm:rounded-md"
                      value={editData.username}
                      onChange={(e) =>
                        setEditData({ ...editData, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      Nhạc cụ có thể chơi
                    </Label>
                    <Input
                      className="h-12 sm:h-10 text-base sm:text-sm rounded-xl sm:rounded-md"
                      placeholder="VD: Piano, Guitar Acoustic..."
                      value={editData.instruments}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          instruments: e.target.value,
                        })
                      }
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Ngăn cách các nhạc cụ bằng dấu phẩy (,)
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      Tiểu sử
                    </Label>
                    <Textarea
                      className="min-h-[100px] text-base sm:text-sm rounded-xl sm:rounded-md p-3"
                      placeholder="Giới thiệu một chút về phong cách âm nhạc của bạn..."
                      value={editData.bio}
                      onChange={(e) =>
                        setEditData({ ...editData, bio: e.target.value })
                      }
                    />
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto h-12 sm:h-10 rounded-xl sm:rounded-md text-base sm:text-sm"
                      onClick={() => setIsEditing(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving || isUploadingAvatar}
                      className="w-full sm:w-auto h-12 sm:h-10 rounded-xl sm:rounded-md text-base sm:text-sm shadow-lg shadow-primary/20"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Lưu thay đổi
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================= DÀN NGANG THÀNH TÍCH ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-12">
          {[
            {
              label: "Lượt tim",
              value: profile.total_likes_received || 0,
              icon: Heart,
              color: "text-red-500",
              bg: "bg-red-500/10",
            },
            {
              label: "Bản thu",
              value: profile.total_tracks_contributed || 0,
              icon: Mic2,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Dự án",
              value: profile.total_projects_joined || 0,
              icon: Disc,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Nhạc phổ",
              value: profile.total_sheets_uploaded || 0,
              icon: UploadCloud,
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
          ].map((item, idx) => (
            <Card
              key={idx}
              className="bg-card/50 border-border/50 hover:border-border transition-all shadow-xl sm:shadow-sm rounded-2xl sm:rounded-xl"
            >
              <CardContent className="p-4 sm:p-6 text-center">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full flex items-center justify-center mb-3 sm:mb-4 ${item.bg}`}
                >
                  <item.icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`}
                  />
                </div>
                <div className="text-2xl sm:text-3xl font-black">
                  {item.value}
                </div>
                <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground mt-1 truncate">
                  {item.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ================= BIỂU ĐỒ NHIỆT (ACTIVITY HEATMAP) ================= */}
        <div className="mt-8 bg-card/30 border border-border/50 rounded-2xl sm:rounded-xl p-4 sm:p-6 shadow-xl sm:shadow-sm overflow-x-auto">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 min-w-max">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="font-bold text-base sm:text-lg">
              Nhật ký hoạt động (90 ngày qua)
            </h3>
          </div>

          <div className="flex gap-1 sm:gap-1.5 justify-start md:justify-start min-w-[650px] pb-2">
            {heatmapDays.map((day, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer flex-shrink-0"
              >
                <div
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-[2px] sm:rounded-[3px] border border-gray-300 dark:border-gray-600 transition-colors ${
                    day.activities.length === 0
                      ? "bg-muted/30 hover:bg-muted/50"
                      : day.activities.length === 1
                        ? "bg-primary/30 hover:bg-primary/50"
                        : day.activities.length === 2
                          ? "bg-primary/60 hover:bg-primary/80"
                          : "bg-primary hover:bg-primary/90"
                  }`}
                />

                {day.activities.length > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max min-w-[120px] sm:min-w-[150px] bg-popover border border-border shadow-2xl rounded-lg p-2 sm:p-3 text-[12px] sm:text-[14px] z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100">
                    <p className="font-bold border-b border-border pb-1 mb-1 text-primary">
                      {day.date}
                    </p>
                    {day.activities.map((act, i) => (
                      <div key={i} className="py-1 whitespace-nowrap">
                        • {act}
                      </div>
                    ))}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] sm:border-l-[6px] border-r-[4px] sm:border-r-[6px] border-t-[4px] sm:border-t-[6px] border-transparent border-t-popover"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4 sm:mt-6 text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-bold min-w-[650px]">
            <span>90 ngày trước</span>
            <div className="flex items-center gap-2">
              <span>Ít</span>
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-muted/30 rounded-sm"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary/30 rounded-sm"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary/60 rounded-sm"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-sm"></div>
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
