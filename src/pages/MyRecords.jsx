import React, { useState, useEffect } from "react";
import { Mic2, Heart, Disc, PlusCircle, Sparkles, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";

export default function MyRecords() {
  const isLoggedIn = !!localStorage.getItem("token");

  // State cho Bản thu cá nhân
  const [myRecords, setMyRecords] = useState([]);
  const [isLoadingMyRecords, setIsLoadingMyRecords] = useState(false);

  // State cho Khám phá cộng đồng
  const [exploreRecords, setExploreRecords] = useState([]);
  const [isLoadingExplore, setIsLoadingExplore] = useState(false);

  // Fetch dữ liệu khi vào trang
  useEffect(() => {
    if (isLoggedIn) {
      fetchMyRecords();
    }
    fetchExploreRecords(); // Gọi API lấy top bản thu (public)
  }, [isLoggedIn]);

  const fetchMyRecords = async () => {
    setIsLoadingMyRecords(true);
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.JAMS_MY_TRACKS), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMyRecords(data);
      }
    } catch (error) {
      console.error("Lỗi tải bản thu của tôi:", error);
    } finally {
      setIsLoadingMyRecords(false);
    }
  };

  const fetchExploreRecords = async () => {
    setIsLoadingExplore(true);
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.JAMS_TOP_TRACKS));
      if (response.ok) {
        const data = await response.json();
        setExploreRecords(data);
      }
    } catch (error) {
      console.error("Lỗi tải top bản thu khám phá:", error);
    } finally {
      setIsLoadingExplore(false);
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

  // Xóa bản thu
  const handleDelete = async (e, trackId) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa bản thu này?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(getApiUrl(API_ENDPOINTS.JAMS_TRACK_DELETE(trackId)), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Lỗi server");
        setMyRecords(myRecords.filter((record) => record._id !== trackId));
      } catch (error) {
        alert("Lỗi xóa bản thu: " + error.message);
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 pb-32 mb-8">
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
        {isLoadingMyRecords ? (
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
                    // Thêm bảo vệ: Nếu phòng Jam chứa bản thu đã bị xóa hoàn toàn khỏi Database
                    if (!record.project_id) {
                      alert("Phòng Jam chứa bản thu này đã bị xóa hoàn toàn khỏi hệ thống!");
                      return;
                    }
                    if (record.status === "draft") {
                      window.location.href = `/jam-room?id=${record.project_id._id}&draftId=${record._id}&trackId=${record._id}`;
                    } else {
                      window.location.href = `/jam-room?id=${record.project_id._id}&trackId=${record._id}`;
                    }
                  }}
                >
                  {/* NÚT XÓA */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-background/90 hover:bg-background shadow-md backdrop-blur-sm hover:text-destructive"
                      onClick={(e) => handleDelete(e, record._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* TAG BẢN NHÁP GÓC TRÊN */}
                  {record.status === "draft" && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md z-10 shadow-sm backdrop-blur-sm">
                      Bản nháp
                    </div>
                  )}

                  <div className="aspect-square bg-muted/20 flex items-center justify-center group-hover:bg-muted/40 transition-colors relative">
                    <Disc
                      className={`w-24 h-24 sm:w-32 sm:h-32 transition-colors duration-300 ${record.status === "draft" ? "text-muted-foreground/40 group-hover:text-amber-500/60" : "text-muted-foreground group-hover:text-primary"}`}
                    />
                  </div>

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
                          <span>
                            {record.liked_by?.length || record.likes_count || 0}
                          </span>
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
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Khám phá Bản thu xuất sắc</h2>
        </div>
        <p className="text-muted-foreground">
          Xem bản thu được yêu thích do cộng đồng đóng góp
        </p>

        {isLoadingExplore ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : exploreRecords.length === 0 ? (
          <div className="text-center p-8 bg-muted/20 border border-border border-dashed rounded-xl text-muted-foreground">
            Hiện chưa có bản thu nào được công bố.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
            {exploreRecords.map((record) => (
              <div
                key={record._id}
                className="group flex flex-col cursor-pointer border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors bg-card shadow-sm hover:shadow-md"
                onClick={() => {
                  if (!record.project_id) {
                    alert("Phòng Jam chứa bản thu này đã bị xóa hoàn toàn khỏi hệ thống!");
                    return;
                  }
                  window.location.href = `/jam-room?id=${record.project_id._id}&trackId=${record._id}`;
                }}
              >
                <div className="aspect-square bg-muted/30 flex items-center justify-center group-hover:bg-muted/50 transition-colors">
                  <Disc className="w-24 h-24 sm:w-32 sm:h-32 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
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
                    <span className="text-[10px] uppercase tracking-wider font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                      {record.instrument}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDuration(record.duration)}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-destructive fill-current" />
                        <span className="font-bold text-foreground">
                          {record.likes_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spacer dự phòng để không dính lề */}
      <div className="w-full h-20 shrink-0"></div>
    </div>
  );
}