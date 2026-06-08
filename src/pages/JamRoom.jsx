import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useJamStore } from "@/store/useJamStore";
import JamLobby from "@/components/Jam/JamLobby";
import MixerBoard from "@/components/Jam/MixerBoard";

export default function JamRoom() {
  const isLoggedIn = !!localStorage.getItem("token");
  const location = useLocation(); // ← dùng hook, tự re-render khi URL thay đổi
  const { fetchJamRoomData, fetchJamRoomPublic, currentTracks, changeActiveRecord } = useJamStore();

  const params = new URLSearchParams(location.search); // ← đọc từ hook thay vì window
  const roomId = params.get("id");
  const trackId = params.get("trackId");

  // 1. Gọi API tải dữ liệu phòng Jam
  useEffect(() => {
    if (roomId) {
      if (isLoggedIn) {
        fetchJamRoomData(roomId);
      } else {
        // Khách chưa đăng nhập → dùng endpoint public
        fetchJamRoomPublic(roomId);
      }
    }
  }, [isLoggedIn, roomId, fetchJamRoomData, fetchJamRoomPublic]);

  // 2. LOGIC MỚI: Tự động chọn bản thu khi URL có chứa trackId
  useEffect(() => {
    // Chờ cho đến khi phòng Jam load xong các track (currentTracks có dữ liệu)
    if (trackId && currentTracks && currentTracks.length > 0) {
      // Tìm xem bản thu này đang nằm ở "Kệ nhạc cụ" nào
      const targetShelf = currentTracks.find((shelf) =>
        shelf.records.some((record) => record.id === trackId)
      );

      // Nếu tìm thấy kệ chứa nó, và kệ đó chưa chọn bản thu này -> Kích hoạt chọn ngay
      if (targetShelf && targetShelf.activeRecordId !== trackId) {
        changeActiveRecord(targetShelf.id, trackId);
      }
    }
  }, [trackId, currentTracks, changeActiveRecord]);

  // Khách chưa đăng nhập: Nếu có roomId → hiển thị MixerBoard ở chế độ xem
  // Nếu không có roomId → không cho vào Lobby
  if (!isLoggedIn) {
    if (!roomId) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-10">
          <h2 className="text-2xl font-bold text-foreground">Bạn cần đăng nhập</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Sảnh Hợp Tấu chỉ dành cho thành viên. Hãy đăng nhập để tạo và quản lý các phòng Jam của bạn.
          </p>
          <a href="/login">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Đăng nhập ngay
            </button>
          </a>
        </div>
      );
    }
    // Có roomId → hiển thị MixerBoard ở chế độ khách (isGuest=true)
    return <MixerBoard isGuest={true} />;
  }

  // Nếu không có ID trên URL -> Hiển thị Sảnh chờ
  if (!roomId) return <JamLobby />;

  // Nếu có ID -> Hiển thị Bàn Mixer chính
  return <MixerBoard isGuest={false} />;
}