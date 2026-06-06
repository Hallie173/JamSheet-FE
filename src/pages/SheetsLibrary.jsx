import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Heart,
  Users,
  UploadCloud,
  Search,
  Download,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";

const formatSheetData = (sheet) => ({
  ...sheet,
  id: sheet._id,
  thumbnail:
    sheet.file_urls && sheet.file_urls.length > 0
      ? sheet.file_urls[0]
      : sheet.file_url || "",
  sheetUrls: sheet.file_urls || [],
  liked_by: sheet.liked_by || [],
});

export default function SheetsLibrary() {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser?._id || currentUser?.userId || null;

  const [mySheets, setMySheets] = useState([]);
  const [exploreSheets, setExploreSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [editingSheetId, setEditingSheetId] = useState(null);
  const exploreRef = useRef(null);

  // Trạng thái khi notification dẫn đến sheet đã bị frozen/xóa
  const [notifSheetError, setNotifSheetError] = useState(null); // null | 'not_found' | 'ok'
  const [notifSheetFound, setNotifSheetFound] = useState(null); // sheet object nếu tìm thấy

  // --- PAGINATION STATES ---
  const [mySheetsPage, setMySheetsPage] = useState(1);
  const [exploreSheetsPage, setExploreSheetsPage] = useState(1);
  const ITEMS_PER_PAGE = 6; // 3 dòng x 2 cột trên mobile

  const [editFormData, setEditFormData] = useState({
    title: "",
    composer: "",
    instrument_tags: "",
    tempo: "",
    genre: "",
    time_signature: "",
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    composer: "",
    instrument_tags: "",
    tempo: "",
    genre: "",
    time_signature: "",
    files: [],
  });

  const [isJamModalOpen, setIsJamModalOpen] = useState(false);
  const [jamFormData, setJamFormData] = useState({
    sheet_id: "",
    title: "",
    tempo: "",
    time_signature: "4/4",
    required_instruments: "",
  });

  // 1. Dùng useCallback bọc lại hàm fetch cộng đồng
  const fetchExploreSheets = useCallback(async () => {
    try {
      const params = new URLSearchParams(location.search);
      const sheetId = params.get("sheet_id");

      // Nếu URL có ?sheet_id= (từ notification), kiểm tra sheet theo ID
      if (sheetId) {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${baseUrl}/api/sheets/${sheetId}`, {
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          // Sheet còn tồn tại và không bị frozen → hiển thị trong explore
          setNotifSheetError(null);
          setNotifSheetFound(formatSheetData(data));
          setExploreSheets([formatSheetData(data)]);
          setExploreSheetsPage(1);
        } else {
          // Sheet bị frozen hoặc không tồn tại
          setNotifSheetError("not_found");
          setNotifSheetFound(null);
          setExploreSheets([]);
        }
        setTimeout(() => {
          if (exploreRef.current) {
            exploreRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
        return;
      }

      // Trường hợp tìm kiếm thông thường
      setNotifSheetError(null);
      setNotifSheetFound(null);
      const queryString = params.toString();
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const timestamp = new Date().getTime();

      const endpoint = queryString
        ? `${baseUrl}/api/sheets/search?${queryString}&t=${timestamp}`
        : `${baseUrl}/api/sheets/explore?t=${timestamp}`;

      const res = await fetch(endpoint, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setExploreSheets(data.map(formatSheetData));
        setExploreSheetsPage(1);

        if (queryString) {
          setTimeout(() => {
            if (exploreRef.current) {
              exploreRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [location.search]); // Theo dõi location.search ở đây

  // 2. Dùng useCallback bọc lại hàm fetch cá nhân
  const fetchMySheets = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const timestamp = new Date().getTime();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sheets/my-sheets?t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        },
      );
      const data = await res.json();
      if (res.ok) setMySheets(data.map(formatSheetData));
    } catch (error) {
      console.error(error);
    }
  }, []);

  // 3. useEffect bây giờ cực kỳ gọn gàng và chuẩn xác
  useEffect(() => {
    fetchExploreSheets();
    if (isLoggedIn) fetchMySheets();
  }, [fetchExploreSheets, fetchMySheets, isLoggedIn]);

  const handleToggleLike = async (e, id) => {
    e.stopPropagation();
    if (!isLoggedIn) return alert("Vui lòng đăng nhập để thích nhạc phổ!");

    const updateLikeState = (sheets) =>
      sheets.map((sheet) => {
        if (sheet.id === id) {
          const hasLiked = sheet.liked_by.includes(currentUserId);
          const newLikedBy = hasLiked
            ? sheet.liked_by.filter((uid) => uid !== currentUserId)
            : [...sheet.liked_by, currentUserId];

          return { ...sheet, liked_by: newLikedBy };
        }
        return sheet;
      });

    setMySheets((prev) => updateLikeState(prev));
    setExploreSheets((prev) => updateLikeState(prev));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sheets/${id}/like`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Lỗi Server");
    } catch (error) {
      console.error("Lỗi cập nhật Like:", error);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.files || uploadData.files.length === 0)
      return alert("Vui lòng chọn ít nhất 1 ảnh nhạc phổ!");

    try {
      const uploadPromises = uploadData.files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "jamsheet_preset");
        formData.append("folder", "jamsheet_sheets");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/dfwrrelbq/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error.message);
        return data.secure_url;
      });

      const file_urls = await Promise.all(uploadPromises);

      const token = localStorage.getItem("token");
      const sheetData = {
        title: uploadData.title,
        composer: uploadData.composer,
        instrument_tags: uploadData.instrument_tags,
        tempo: uploadData.tempo,
        genre: uploadData.genre,
        time_signature: uploadData.time_signature,
        file_urls: file_urls,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sheets`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sheetData),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMySheets([formatSheetData(data.sheet), ...mySheets]);
      setIsUploadModalOpen(false);
      setUploadData({
        title: "",
        composer: "",
        instrument_tags: "",
        tempo: "",
        genre: "",
        time_signature: "",
        files: [],
      });
      alert("Tải lên thành công rực rỡ!");
    } catch (error) {
      alert("Lỗi tải lên: " + error.message);
    }
  };

  const startEdit = (e, sheet) => {
    e.stopPropagation();
    setEditingSheetId(sheet.id);
    setEditFormData({
      title: sheet.title,
      composer: sheet.composer || "",
      instrument_tags: sheet.instrument_tags.join(", "),
      tempo: sheet.tempo || "",
      genre: sheet.genre || "",
      time_signature: sheet.time_signature || "4/4",
    });
  };

  const handleSaveEdit = async (e, id) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const updatedTags = editFormData.instrument_tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== "");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sheets/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...editFormData,
            instrument_tags: updatedTags,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMySheets(
        mySheets.map((s) => (s.id === id ? formatSheetData(data.sheet) : s)),
      );
      setEditingSheetId(null);
    } catch (error) {
      alert("Lỗi cập nhật: " + error.message);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa nhạc phổ này?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sheets/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) throw new Error("Lỗi server");
        setMySheets(mySheets.filter((s) => s.id !== id));
      } catch (error) {
        alert("Lỗi xóa: " + error.message);
      }
    }
  };

  const handleDownload = (e, sheet) => {
    e.stopPropagation();
    const downloadUrl = sheet.sheetUrls?.[0] || sheet.file_url;
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  const handleJamNow = async (e, sheet) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jams/check-duplicate?title=${encodeURIComponent(sheet.title)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();

      if (data.isDuplicate) {
        const confirmGo = window.confirm(
          `Bạn đã từng mở một phòng Jam với nhạc phổ "${sheet.title}"!\n\nNhấn OK để vào phòng Jam ngay!`,
        );
        if (confirmGo) {
          window.location.href = `/jam-room?id=${data.roomId}`;
        }
        return;
      }

      setJamFormData({
        sheet_id: sheet.id,
        title: sheet.title,
        tempo: sheet.tempo,
        time_signature: sheet.time_signature || "4/4",
        required_instruments: sheet.instrument_tags
          ? sheet.instrument_tags.join(", ")
          : "",
      });
      setIsJamModalOpen(true);
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi kiểm tra dữ liệu!");
    }
  };

  const handleJoinJam = async (e, sheetId) => {
    e.stopPropagation();
    if (!isLoggedIn) return alert("Vui lòng đăng nhập để tham gia Jam!");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jams/find-by-sheet/${sheetId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.roomId) {
        window.location.href = `/jam-room?id=${data.roomId}`;
      } else {
        alert("Không tìm thấy phòng Jam nào đang hoạt động với nhạc phổ này.");
      }
    } catch (error) {
      alert("Lỗi khi tham gia Jam: " + error.message);
    }
  };

  const handleCreateJamSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const instrumentsArray = jamFormData.required_instruments
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jams`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...jamFormData,
            sheet_music_id: jamFormData.sheet_id,
            tempo: Number(jamFormData.tempo),
            required_instruments: instrumentsArray,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      window.location.href = `/jam-room?id=${data.room._id}`;
    } catch (error) {
      alert("Lỗi tạo phòng Jam: " + error.message);
    }
  };

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

  const renderSheetCard = (sheet, isMySheet) => {
    const isLiked = sheet.liked_by.includes(currentUserId);
    const likeCount = sheet.liked_by.length;

    const fileUrl = sheet.sheetUrls?.[0] || sheet.file_url || "";
    const isPdf = fileUrl.toLowerCase().endsWith(".pdf");
    const isCloudinary = fileUrl.includes("res.cloudinary.com");

    const finalImageUrl =
      isPdf && isCloudinary
        ? fileUrl.substring(0, fileUrl.lastIndexOf(".")) + ".jpg"
        : fileUrl;

    return (
      <Card
        key={sheet.id}
        className="p-0 relative hover:border-primary/50 transition-colors cursor-pointer flex flex-col overflow-hidden group shadow-sm bg-card h-full rounded-xl"
        onClick={() => {
          if (editingSheetId !== sheet.id) {
            setSelectedSheet(sheet);
          }
        }}
      >
        {/* NÚT TẠO / ĐẾN JAM */}
        <div className="absolute top-2 left-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10">
          {isMySheet && editingSheetId !== sheet.id ? (
            <Button
              size="sm"
              className="gap-1 sm:gap-2 h-7 sm:h-9 px-2 sm:px-4 shadow-lg shadow-primary/25 rounded-md"
              onClick={(e) => handleJamNow(e, sheet)}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-sm font-semibold">
                Tạo Jam
              </span>
            </Button>
          ) : (
            !isMySheet && (
              <Button
                size="sm"
                variant="secondary"
                className="gap-1 sm:gap-2 h-7 sm:h-9 px-2 sm:px-4 shadow-lg bg-background/90 hover:bg-background backdrop-blur-sm rounded-md border border-border"
                onClick={(e) => handleJoinJam(e, sheet.id)}
              >
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] sm:text-sm font-semibold">
                  Đến phòng
                </span>
              </Button>
            )
          )}
        </div>

        {/* CỤM NÚT SỬA/TẢI/XÓA (My Sheets) */}
        {isMySheet && editingSheetId !== sheet.id && (
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10">
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 bg-background/90 hover:bg-background shadow-md backdrop-blur-sm rounded-md"
              onClick={(e) => startEdit(e, sheet)}
            >
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 bg-background/90 hover:bg-background shadow-md backdrop-blur-sm rounded-md"
              onClick={(e) => handleDownload(e, sheet)}
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 bg-background/90 hover:bg-background shadow-md backdrop-blur-sm hover:text-destructive rounded-md text-muted-foreground"
              onClick={(e) => handleDelete(e, sheet.id)}
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        )}

        {/* FORM CHỈNH SỬA */}
        {isMySheet && editingSheetId === sheet.id && (
          <div
            className="p-3 sm:p-4 flex flex-col gap-2.5 h-full bg-background absolute inset-0 z-20 overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-bold text-xs sm:text-sm border-b pb-1 flex items-center gap-2">
              <Edit className="w-3.5 h-3.5 text-primary" /> Sửa nhạc phổ
            </h4>
            <div className="space-y-1">
              <Label className="text-[10px] sm:text-xs">Tên nhạc phổ *</Label>
              <Input
                size="sm"
                className="h-7 sm:h-8 text-[10px] sm:text-xs"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] sm:text-xs">Nhạc sĩ</Label>
              <Input
                size="sm"
                className="h-7 sm:h-8 text-[10px] sm:text-xs"
                value={editFormData.composer}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    composer: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] sm:text-xs">Nhạc cụ *</Label>
              <Input
                size="sm"
                className="h-7 sm:h-8 text-[10px] sm:text-xs"
                required
                value={editFormData.instrument_tags}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    instrument_tags: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2 mt-auto pt-2">
              <Button
                size="sm"
                className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs"
                onClick={(e) => handleSaveEdit(e, sheet.id)}
              >
                Lưu
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSheetId(null);
                }}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}

        <div className="aspect-[4/5] w-full bg-white dark:bg-white relative border-b border-border/50 overflow-hidden flex items-center justify-center">
          {isPdf && !isCloudinary ? (
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 group-hover:scale-110 transition-transform" />
          ) : (
            <img
              src={
                finalImageUrl || "https://placehold.co/400x600?text=No+Image"
              }
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/400x600?text=L%E1%BB%97i+%E1%BA%A3nh";
              }}
              className="absolute inset-0 block w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              alt="thumbnail"
            />
          )}

          {isPdf && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 border border-white/10">
              <FileText className="w-2.5 h-2.5" /> PDF
            </div>
          )}

          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 pr-2">
            {sheet.instrument_tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] sm:text-[10px] font-medium bg-black/70 text-white px-1.5 py-0.5 rounded-sm backdrop-blur-md border border-white/10 truncate max-w-[80px] sm:max-w-none"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <CardHeader className="p-2 sm:p-3 pb-0 shrink-0">
          <h3
            className="text-sm sm:text-base font-bold leading-tight truncate"
            title={sheet.title}
          >
            {sheet.title}
          </h3>
          <div className="flex justify-between items-center mt-1">
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate flex-1 pr-1">
              {sheet.composer}
            </p>
            <span className="text-[9px] sm:text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
              {sheet.tempo} BPM
            </span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground/70 truncate mt-0.5">
            Tải lên bởi: <span className="font-medium text-muted-foreground">{sheet.uploader_id?.username || "Ẩn danh"}</span>
          </p>
        </CardHeader>

        <CardFooter className="p-2 sm:p-3 pt-2 shrink-0 flex items-center justify-between text-muted-foreground border-t border-border/50 mt-auto">
          <div
            className="flex items-center gap-1 text-[10px] sm:text-xs cursor-pointer group/like p-1 -ml-1 rounded-md hover:bg-destructive/10 transition-colors"
            onClick={(e) => handleToggleLike(e, sheet.id)}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isLiked ? "fill-destructive text-destructive" : "group-hover/like:text-destructive"}`}
            />
            <span className={isLiked ? "text-destructive font-medium" : ""}>
              {likeCount}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] sm:text-xs">
            <Users className="w-3.5 h-3.5" />{" "}
            <span>{sheet.contributors_count}</span>
          </div>
        </CardFooter>
      </Card>
    );
  };

  const paginatedMySheets = mySheets.slice(
    (mySheetsPage - 1) * ITEMS_PER_PAGE,
    mySheetsPage * ITEMS_PER_PAGE,
  );

  const paginatedExploreSheets = exploreSheets.slice(
    (exploreSheetsPage - 1) * ITEMS_PER_PAGE,
    exploreSheetsPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="flex flex-col h-full space-y-6 sm:space-y-8 relative px-4 sm:px-8 pb-32 mb-8 mt-4 sm:mt-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Thư viện Nhạc phổ
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Quản lý và chia sẻ các bản nhạc của bạn
          </p>
        </div>
        <Button
          className="flex items-center gap-2 w-full sm:w-auto h-12 sm:h-10 rounded-xl sm:rounded-md font-semibold"
          onClick={() =>
            isLoggedIn
              ? setIsUploadModalOpen(true)
              : (window.location.href = "/login")
          }
        >
          <UploadCloud className="w-4 h-4" />
          {isLoggedIn ? "Tải lên Nhạc phổ" : "Đăng nhập để Tải lên"}
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold border-b border-border pb-2">
          Nhạc phổ của tôi
        </h2>
        {!isLoggedIn ? (
          <div className="bg-card border border-border rounded-2xl sm:rounded-xl p-8 sm:p-12 text-center shadow-sm">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Tham gia cộng đồng JamSheet
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto mb-6">
              Đăng nhập để lưu trữ và chia sẻ nhạc phổ của riêng bạn.
            </p>
            <Button
              className="h-12 sm:h-10 rounded-xl sm:rounded-md px-6"
              onClick={() => (window.location.href = "/login")}
            >
              Đăng nhập ngay
            </Button>
          </div>
        ) : mySheets.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl sm:rounded-xl p-8 sm:p-12 text-center shadow-sm">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              Bạn chưa đăng bản nhạc nào.
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto mb-6">
              Hãy chia sẻ nhạc phổ của bạn để cộng đồng cùng hợp tấu.
            </p>
            <Button
              variant="outline"
              className="h-12 sm:h-10 rounded-xl sm:rounded-md px-6"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <UploadCloud className="w-4 h-4 mr-2" /> Tải lên ngay
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {paginatedMySheets.map((sheet) => renderSheetCard(sheet, true))}
            </div>
            <PaginationControls
              currentPage={mySheetsPage}
              setPage={setMySheetsPage}
              totalItems={mySheets.length}
            />
          </>
        )}
      </div>

      <div ref={exploreRef} className="space-y-4 pt-4 sm:pt-6">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="text-lg sm:text-2xl font-bold">Khám phá Cộng đồng</h2>
        </div>

        {notifSheetError === "not_found" ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Không tìm thấy nhạc phổ nào phù hợp.
          </div>
        ) : exploreSheets.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Không tìm thấy nhạc phổ nào phù hợp.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {paginatedExploreSheets.map((sheet) =>
                renderSheetCard(sheet, false),
              )}
            </div>
            <PaginationControls
              currentPage={exploreSheetsPage}
              setPage={setExploreSheetsPage}
              totalItems={exploreSheets.length}
            />
          </>
        )}
      </div>

      {/* MODAL UPLOAD */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary" /> Tải lên Nhạc
                phổ
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsUploadModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>File Nhạc phổ (Chỉ nhận Ảnh JPG/PNG) *</Label>
                <Input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  multiple
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files);
                    setUploadData({
                      ...uploadData,
                      files: [...uploadData.files, ...newFiles],
                    });
                    e.target.value = null;
                  }}
                  className="cursor-pointer"
                />
                {uploadData.files.length > 0 && (
                  <div className="bg-muted/30 p-3 rounded-md border border-border mt-2">
                    <p className="text-xs font-semibold text-primary mb-2">
                      Đã chọn {uploadData.files.length} trang nhạc phổ:
                    </p>
                    <ul className="space-y-1">
                      {uploadData.files.map((file, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="truncate max-w-[250px] text-muted-foreground">
                            {index + 1}. {file.name}
                          </span>
                          <button
                            type="button"
                            className="text-destructive font-medium hover:underline ml-2"
                            onClick={() => {
                              const filteredFiles = uploadData.files.filter(
                                (_, i) => i !== index,
                              );
                              setUploadData({
                                ...uploadData,
                                files: filteredFiles,
                              });
                            }}
                          >
                            Xóa
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Tên bản nhạc *</Label>
                <Input
                  required
                  value={uploadData.title}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, title: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nhạc sĩ</Label>
                  <Input
                    placeholder="Unknown"
                    value={uploadData.composer}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, composer: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nhịp (Time Signature) *</Label>
                  <Input
                    required
                    placeholder="VD: 4/4, 3/4"
                    value={uploadData.time_signature}
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        time_signature: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nhạc cụ *</Label>
                <Input
                  required
                  placeholder="VD: Piano, Guitar Acoustic..."
                  value={uploadData.instrument_tags}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      instrument_tags: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thể loại</Label>
                  <Input
                    placeholder="Pop, Jazz..."
                    value={uploadData.genre}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, genre: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tempo (BPM) *</Label>
                  <Input
                    type="number"
                    required
                    value={uploadData.tempo}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, tempo: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit">Xác nhận tải lên</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL XEM ẢNH TOÀN MÀN HÌNH */}
      {selectedSheet && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-50 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex flex-col pl-2">
              <h2 className="text-xl font-bold drop-shadow-md leading-tight">
                {selectedSheet.title}
              </h2>
              <span className="text-sm text-white/70">
                {selectedSheet.composer}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!selectedSheet.sheetUrls?.[0]?.toLowerCase().endsWith(".pdf") &&
                !selectedSheet.file_url?.toLowerCase().endsWith(".pdf") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    title="Tải xuống"
                    onClick={(e) => handleDownload(e, selectedSheet)}
                  >
                    <Download className="w-6 h-6" />
                  </Button>
                )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 hover:text-destructive"
                title="Đóng"
                onClick={() => setSelectedSheet(null)}
              >
                <X className="w-8 h-8" />
              </Button>
            </div>
          </div>

          <div className="relative w-full h-full flex flex-col items-center justify-start p-4 pt-20 sm:p-12 overflow-y-auto custom-scrollbar gap-4">
            {selectedSheet.sheetUrls && selectedSheet.sheetUrls.length > 0 ? (
              selectedSheet.sheetUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Page ${index + 1}`}
                  className="max-w-full h-auto object-contain rounded-md shadow-2xl select-none"
                />
              ))
            ) : selectedSheet.file_url?.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={selectedSheet.file_url}
                className="w-full h-full rounded-md shadow-2xl bg-white"
                title={selectedSheet.title}
              ></iframe>
            ) : (
              <img
                src={selectedSheet.file_url}
                alt="Sheet"
                className="max-h-full max-w-full object-contain rounded-md shadow-2xl select-none"
              />
            )}
          </div>
        </div>
      )}

      {/* MODAL KHỞI TẠO PHÒNG JAM */}
      {isJamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95 border-primary/20 border-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                <PlayCircle className="w-6 h-6" /> Thiết lập phòng Jam mới
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsJamModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleCreateJamSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tên bài hát (Từ Nhạc phổ)</Label>
                <Input
                  value={jamFormData.title}
                  readOnly
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nhịp độ (BPM) *</Label>
                  <Input
                    type="number"
                    required
                    value={jamFormData.tempo}
                    onChange={(e) =>
                      setJamFormData({ ...jamFormData, tempo: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nhịp (Time Signature)</Label>
                  <Input
                    placeholder="VD: 4/4, 3/4"
                    value={jamFormData.time_signature}
                    onChange={(e) =>
                      setJamFormData({
                        ...jamFormData,
                        time_signature: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tuyển nhạc công (Nhạc cụ cần tìm) *</Label>
                <Input
                  required
                  placeholder="VD: Guitar Lead, Bass, Vocal..."
                  value={jamFormData.required_instruments}
                  onChange={(e) =>
                    setJamFormData({
                      ...jamFormData,
                      required_instruments: e.target.value,
                    })
                  }
                />
                <p className="text-[10px] text-muted-foreground">
                  Ngăn cách các nhạc cụ bằng dấu phẩy (,)
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsJamModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" className="shadow-lg shadow-primary/20">
                  Mở phòng Jam
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Spacer dự phòng để không dính lề */}
      <div className="w-full h-20 shrink-0"></div>
    </div>
  );
}
