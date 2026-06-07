import React, { useState, useEffect } from "react";
import {
  Mic2,
  Heart,
  Disc,
  PlusCircle,
  Sparkles,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertTriangle,
  Snowflake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";

export default function MyRecords() {
  const isLoggedIn = !!localStorage.getItem("token");

  // State cho Bản thu cá nhân
  const [myRecords, setMyRecords] = useState([]);
  const [isLoadingMyRecords, setIsLoadingMyRecords] = useState(false);

  // State cho Bản nháp mồ côi
  const [orphanedDrafts, setOrphanedDrafts] = useState([]);
  const [isLoadingOrphaned, setIsLoadingOrphaned] = useState(false);

  // State cho Khám phá cộng đồng
  const [exploreRecords, setExploreRecords] = useState([]);
  const [isLoadingExplore, setIsLoadingExplore] = useState(false);

  // --- PAGINATION STATES ---
  const [myRecordsPage, setMyRecordsPage] = useState(1);
  const [exploreRecordsPage, setExploreRecordsPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Fetch dữ liệu khi vào trang
  useEffect(() => {
    if (isLoggedIn) {
      fetchMyRecords();
      fetchOrphanedDrafts();
    }
    fetchExploreRecords();
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
        setMyRecordsPage(1);
      }
    } catch (error) {
      console.error("Lỗi tải bản thu của tôi:", error);
    } finally {
      setIsLoadingMyRecords(false);
    }
  };

  const fetchOrphanedDrafts = async () => {
    setIsLoadingOrphaned(true);
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.JAMS_ORPHANED_DRAFTS), {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrphanedDrafts(data);
      }
    } catch (error) {
      console.error("Lỗi tải bản nháp mồ côi:", error);
    } finally {
      setIsLoadingOrphaned(false);
    }
  };

  const handleDeleteOrphaned = async (e, trackId) => {
    e.stopPropagation();
    if (window.confirm("Xóa bản nháp này? Hành động không thể hoàn tác.")) {
      try {
        const res = await fetch(
          getApiUrl(API_ENDPOINTS.JAMS_TRACK_DELETE(trackId)),
          { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
        );
        if (!res.ok) throw new Error("Lỗi server");
        setOrphanedDrafts(orphanedDrafts.filter((d) => d._id !== trackId));
      } catch (error) {
        alert("Lỗi xóa: " + error.message);
      }
    }
  };

  const fetchExploreRecords = async () => {
    setIsLoadingExplore(true);
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.JAMS_TOP_TRACKS));
      if (response.ok) {
        const data = await response.json();
        setExploreRecords(data);
        setExploreRecordsPage(1);
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
        const res = await fetch(
          getApiUrl(API_ENDPOINTS.JAMS_TRACK_DELETE(trackId)),
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) throw new Error("Lỗi server");
        setMyRecords(myRecords.filter((record) => record._id !== trackId));
      } catch (error) {
        alert("Lỗi xóa bản thu: " + error.message);
      }
    }
  };

  // --- HELPER COMPONENT PHÂN TRANG ---
  const PaginationControls = ({ currentPage, setPage, totalItems }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-3 mt-6">
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 rounded-full"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
          Trang {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 rounded-full"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  // Tính toán dữ liệu cắt theo trang
  // Bản nháp thuộc phòng archived sẽ bị lọc ra — chỉ hiển thị track của phòng còn active
  const activeRecords = myRecords.filter(
    (r) => !(r.status === "draft" && r.project_id?.status === "archived")
  );

  const paginatedMyRecords = activeRecords.slice(
    (myRecordsPage - 1) * ITEMS_PER_PAGE,
    myRecordsPage * ITEMS_PER_PAGE,
  );

  const paginatedExploreRecords = exploreRecords.slice(
    (exploreRecordsPage - 1) * ITEMS_PER_PAGE,
    exploreRecordsPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="flex flex-col h-full space-y-6 sm:space-y-8 relative px-4 sm:px-8 pb-32 mb-8 mt-4 sm:mt-0">
      {/* Header Trang */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Bản thu của tôi
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Nơi lưu giữ các tác phẩm và bản nháp
          </p>
        </div>
      </div>

      {/* === SECTION: BẢN NHÁP MỒ CÔI (chỉ hiện khi có dữ liệu) === */}
      {isLoggedIn && (isLoadingOrphaned || orphanedDrafts.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/15">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">
              Bản nháp mồ côi
            </h2>
            <span className="text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
              {orphanedDrafts.length} bản thu
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Các bản nháp này thuộc phòng có nhạc phổ đã bị xóa. Bạn có thể nghe lại hoặc tải về trước khi xóa.
          </p>

          {isLoadingOrphaned ? (
            <div className="flex justify-center p-6">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {orphanedDrafts.map((draft) => (
                <div
                  key={draft._id}
                  className="group relative flex flex-col cursor-pointer border border-amber-500/30 rounded-xl overflow-hidden hover:border-amber-500/60 transition-colors bg-amber-500/5 hover:bg-amber-500/10 shadow-sm"
                  onClick={() =>
                    (window.location.href = `/jam-room?id=${draft.project_id}&draftId=${draft._id}&orphaned=true`)
                  }
                >
                  {/* Nhãn FROZEN */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-500 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded z-10">
                    <Snowflake className="w-2.5 h-2.5" />
                    FROZEN
                  </div>

                  {/* Nút Xóa */}
                  <div className="absolute top-2 left-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-background/90 hover:bg-background shadow-md backdrop-blur-sm hover:text-destructive rounded-md"
                      onClick={(e) => handleDeleteOrphaned(e, draft._id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-destructive" />
                    </Button>
                  </div>

                  <div className="aspect-square bg-amber-500/10 flex items-center justify-center">
                    <Disc className="w-16 h-16 sm:w-20 sm:h-20 text-amber-400/50 group-hover:text-amber-500/70 transition-colors duration-300" />
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-1 border-t border-amber-500/20">
                    <h3 className="font-bold text-xs sm:text-sm truncate" title={draft.name}>
                      {draft.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5" title={draft.project_title}>
                      {draft.project_title}
                    </p>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-sm max-w-[70px] truncate">
                        {draft.instrument}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {formatDuration(draft.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Khu vực Dữ liệu cá nhân */}
      <div
        className={`bg-card border border-border rounded-2xl sm:rounded-xl flex flex-col justify-center shadow-sm ${activeRecords.length === 0 ? "p-8 sm:p-12 text-center items-center" : "p-4 sm:p-6"}`}
      >
        {isLoadingMyRecords ? (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground">
              Đang tải bản thu của bạn...
            </p>
          </div>
        ) : !isLoggedIn ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Mic2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Bắt đầu hành trình âm nhạc
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mb-6">
              Trở thành một phần của cộng đồng nhạc công không giới hạn. Đăng
              nhập để lưu trữ các bản thu và tham gia hợp tấu ngay hôm nay.
            </p>
            <div className="flex items-center gap-3 sm:gap-4 w-full justify-center">
              <a href="/login">
                <Button className="h-10 sm:h-10 px-6 rounded-xl sm:rounded-md">
                  Đăng nhập
                </Button>
              </a>
              <a href="/register">
                <Button
                  variant="outline"
                  className="h-10 sm:h-10 px-6 rounded-xl sm:rounded-md"
                >
                  Đăng ký
                </Button>
              </a>
            </div>
          </div>
        ) : activeRecords.length === 0 ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Mic2 className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Bạn chưa có bản thu âm nào.
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mb-6">
              Hãy tìm một phòng Hợp tấu đang thiếu nhạc cụ của bạn và bắt đầu
              thu âm ngay.
            </p>
            <a href="/">
              <Button
                variant="default"
                className="flex items-center gap-2 h-12 sm:h-10 rounded-xl sm:rounded-md px-6"
              >
                <PlusCircle className="w-4 h-4" /> Tìm phòng Jam
              </Button>
            </a>
          </div>
        ) : (
          <div className="w-full text-left">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {paginatedMyRecords.map((record) => (
                <div
                  key={record._id}
                  className="group relative flex flex-col cursor-pointer border border-border rounded-xl sm:rounded-xl overflow-hidden hover:border-primary/50 transition-colors bg-background shadow-sm hover:shadow-md"
                  onClick={() => {
                    if (!record.project_id) {
                      alert(
                        "Phòng Jam chứa bản thu này đã bị xóa hoàn toàn khỏi hệ thống!",
                      );
                      return;
                    }
                    // Draft thuộc phòng đã bị archived → chuyển sang chế độ orphaned
                    if (record.status === "draft" && record.project_id?.status === "archived") {
                      window.location.href = `/jam-room?id=${record.project_id._id}&draftId=${record._id}&orphaned=true`;
                      return;
                    }
                    if (record.status === "draft") {
                      window.location.href = `/jam-room?id=${record.project_id._id}&draftId=${record._id}&trackId=${record._id}`;
                    } else {
                      window.location.href = `/jam-room?id=${record.project_id._id}&trackId=${record._id}`;
                    }
                  }}
                >
                  {/* NÚT XÓA: Trên điện thoại sẽ hiện luôn (opacity-100), máy tính thì chờ hover */}
                  <div className="absolute top-2 left-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 bg-background/90 hover:bg-background shadow-md backdrop-blur-sm hover:text-destructive rounded-md"
                      onClick={(e) => handleDelete(e, record._id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-destructive" />
                    </Button>
                  </div>

                  {/* TAG BẢN NHÁP GÓC TRÊN */}
                  {record.status === "draft" && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded sm:rounded-md z-10 shadow-sm backdrop-blur-sm">
                      Bản nháp
                    </div>
                  )}

                  <div className="aspect-square bg-muted/20 flex items-center justify-center group-hover:bg-muted/40 transition-colors relative">
                    <Disc
                      className={`w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 transition-colors duration-300 ${record.status === "draft" ? "text-muted-foreground/40 group-hover:text-amber-500/60" : "text-muted-foreground group-hover:text-primary"}`}
                    />
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-1 border-t border-border/50">
                    <h3
                      className="font-bold text-xs sm:text-sm truncate"
                      title={record.name}
                    >
                      {record.name}
                    </h3>
                    <p
                      className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5 sm:mt-1"
                      title={record.project_id?.title}
                    >
                      {record.project_id?.title || "Dự án không xác định"}
                    </p>

                    <div className="mt-auto pt-2 sm:pt-3 flex items-center justify-between">
                      <span
                        className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-sm sm:rounded-md max-w-[60px] sm:max-w-none truncate ${record.status === "draft" ? "bg-amber-500/10 text-amber-600" : "bg-secondary text-secondary-foreground"}`}
                      >
                        {record.instrument}
                      </span>
                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground shrink-0">
                        <span>{formatDuration(record.duration)}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-destructive" />
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

            {/* Phân trang Bản thu của tôi */}
            <PaginationControls
              currentPage={myRecordsPage}
              setPage={setMyRecordsPage}
              totalItems={activeRecords.length}
            />
          </div>
        )}
      </div>

      {/* Khu vực Khám phá cộng đồng */}
      <div className="space-y-4 pt-2 sm:pt-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold">Khám phá Cộng đồng</h2>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Xem bản thu được yêu thích do cộng đồng đóng góp
        </p>

        {isLoadingExplore ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : exploreRecords.length === 0 ? (
          <div className="text-center p-8 bg-muted/20 border border-border border-dashed rounded-2xl sm:rounded-xl text-muted-foreground text-sm sm:text-base">
            Hiện chưa có bản thu nào được công bố.
          </div>
        ) : (
          <div className="pt-2 sm:pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {paginatedExploreRecords.map((record) => (
                <div
                  key={record._id}
                  className="group flex flex-col cursor-pointer border border-border rounded-xl sm:rounded-xl overflow-hidden hover:border-primary/50 transition-colors bg-card shadow-sm hover:shadow-md"
                  onClick={() => {
                    if (!record.project_id) {
                      alert(
                        "Phòng Jam chứa bản thu này đã bị xóa hoàn toàn khỏi hệ thống!",
                      );
                      return;
                    }
                    window.location.href = `/jam-room?id=${record.project_id._id}&trackId=${record._id}`;
                  }}
                >
                  <div className="aspect-square bg-muted/30 flex items-center justify-center group-hover:bg-muted/50 transition-colors">
                    <Disc className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1 border-t border-border/50">
                    <h3
                      className="font-bold text-xs sm:text-sm truncate"
                      title={record.name}
                    >
                      {record.name}
                    </h3>
                    <p
                      className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5 sm:mt-1"
                      title={record.project_id?.title}
                    >
                      {record.project_id?.title || "Dự án không xác định"}
                    </p>
                    <div className="mt-auto pt-2 sm:pt-3 flex items-center justify-between">
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold bg-secondary text-secondary-foreground px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-sm sm:rounded-md max-w-[60px] sm:max-w-none truncate">
                        {record.instrument}
                      </span>
                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground shrink-0">
                        <span>{formatDuration(record.duration)}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-destructive fill-current" />
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

            {/* Phân trang Khám phá cộng đồng */}
            <PaginationControls
              currentPage={exploreRecordsPage}
              setPage={setExploreRecordsPage}
              totalItems={exploreRecords.length}
            />
          </div>
        )}
      </div>

      {/* Spacer dự phòng để không dính lề */}
      <div className="w-full h-20 shrink-0"></div>
    </div>
  );
}
