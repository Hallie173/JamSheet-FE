import React, { useState, useEffect } from "react";
import { Mic2, Heart, Disc, PlusCircle, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyRecords() {
  const isLoggedIn = !!localStorage.getItem("token");
  const [myRecords, setMyRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Gọi API lấy danh sách bản thu khi vào trang
  useEffect(() => {
    if (isLoggedIn) {
      fetchMyRecords();
    }
  }, [isLoggedIn]);

  const fetchMyRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/jams/my-tracks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMyRecords(data);
      }
    } catch (error) {
      console.error("Lỗi tải bản thu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm phụ trợ chuyển đổi giây sang định dạng mm:ss
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  // Dữ liệu cộng đồng (Giả lập)
  const exploreRecords = [
    {
      id: 1,
      trackName: "Solo Piano Intro",
      projectTitle: "River Flows in You - Acoustic",
      instrument: "Piano",
      likes: 85,
      duration: "1:20",
    },
    {
      id: 2,
      trackName: "Vocal Điệp khúc",
      projectTitle: "Hotel California Jam",
      instrument: "Vocal",
      likes: 342,
      duration: "0:45",
    },
    {
      id: 3,
      trackName: "Bassline ngẫu hứng",
      projectTitle: "Jazz Night Chills",
      instrument: "Bass",
      likes: 120,
      duration: "2:15",
    },
    {
      id: 4,
      trackName: "Đoạn dạo đầu Guitar",
      projectTitle: "Acoustic Vibes",
      instrument: "Guitar",
      likes: 56,
      duration: "0:30",
    },
    {
      id: 5,
      trackName: "Trống dồn nhịp điệu",
      projectTitle: "Rock & Roll Life",
      instrument: "Drums",
      likes: 210,
      duration: "1:05",
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-8">
      {/* Header Trang */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bản thu của tôi</h1>
        </div>
      </div>

      {/* Khu vực Dữ liệu cá nhân */}
      <div
        className={`bg-card border border-border rounded-xl flex flex-col items-center justify-center shadow-sm ${myRecords.length === 0 ? "p-12 text-center" : "p-6"}`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Đang tải bản thu của bạn...</p>
          </div>
        ) : !isLoggedIn ? (
          <>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Mic2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Bắt đầu hành trình âm nhạc
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Trở thành một phần của cộng đồng nhạc công không giới hạn. Đăng
              nhập để lưu trữ các bản thu và tham gia hợp tấu ngay hôm nay.
            </p>
            <div className="flex items-center gap-4">
              <a href="/login">
                <Button>Đăng nhập</Button>
              </a>
              <a href="/signup">
                <Button variant="outline">Đăng ký</Button>
              </a>
            </div>
          </>
        ) : myRecords.length === 0 ? (
          <>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Mic2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Bạn chưa có bản thu âm nào.
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Hãy tìm một phòng Hợp tấu đang thiếu nhạc cụ của bạn và bắt đầu
              thu âm ngay.
            </p>
            <a href="/">
              <Button variant="default" className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Tìm phòng Jam
              </Button>
            </a>
          </>
        ) : (
          <div className="w-full text-left">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {myRecords.map((record) => (
                <div
                  key={record._id}
                  className="group relative flex flex-col cursor-pointer border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors bg-background shadow-sm hover:shadow-md"
                  onClick={() => {
                    if (record.status === "draft") {
                      window.location.href = `/jam-room?id=${record.project_id._id}&draftId=${record._id}`;
                    } else {
                      alert("Bản thu đã hoàn thành!");
                      window.location.href = `/jam-room?id=${record.project_id._id}`;
                    }
                  }}
                >
                  {/* TAG BẢN NHÁP GÓC TRÊN */}
                  {record.status === "draft" && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md z-10 shadow-sm backdrop-blur-sm">
                      Bản nháp
                    </div>
                  )}

                  {/* Phần 1: Khối vuông */}
                  <div className="aspect-square bg-muted/20 flex items-center justify-center group-hover:bg-muted/40 transition-colors relative">
                    <Disc
                      className={`w-24 h-24 sm:w-32 sm:h-32 transition-colors duration-300 ${record.status === "draft" ? "text-muted-foreground/40 group-hover:text-amber-500/60" : "text-muted-foreground group-hover:text-primary"}`}
                    />
                  </div>

                  {/* Phần 2: Thông tin */}
                  <div className="p-4 flex flex-col flex-1 border-t border-border/50">
                    <h3
                      className="font-bold text-sm truncate"
                      title={record.name}
                    >
                      {record.name}
                    </h3>
                    <p
                      className="text-xs text-muted-foreground truncate mt-1"
                      title={record.project_id?.title}
                    >
                      {record.project_id?.title || "Dự án không xác định"}
                    </p>

                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md ${record.status === "draft" ? "bg-amber-500/10 text-amber-600" : "bg-secondary text-secondary-foreground"}`}
                      >
                        {record.instrument}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDuration(record.duration)}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-destructive" />
                          <span>{record.likes_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Khu vực Khám phá cộng đồng */}
      {/* ... (Giữ nguyên như cũ) ... */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Khám phá Bản thu xuất sắc</h2>
        </div>
        <p className="text-muted-foreground">
          Xem bản thu được yêu thích do cộng đồng đóng góp
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
          {exploreRecords.map((record) => (
            <div
              key={record.id}
              className="group flex flex-col cursor-pointer border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors bg-card shadow-sm hover:shadow-md"
            >
              <div className="aspect-square bg-muted/30 flex items-center justify-center group-hover:bg-muted/50 transition-colors">
                <Disc className="w-24 h-24 sm:w-32 sm:h-32 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
              <div className="p-4 flex flex-col flex-1 border-t border-border/50">
                <h3
                  className="font-bold text-sm truncate"
                  title={record.trackName}
                >
                  {record.trackName}
                </h3>
                <p
                  className="text-xs text-muted-foreground truncate mt-1"
                  title={record.projectTitle}
                >
                  {record.projectTitle}
                </p>
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    {record.instrument}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{record.duration}</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-destructive" />
                      <span>{record.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
