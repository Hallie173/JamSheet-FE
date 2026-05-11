import React, { useEffect } from "react";
import { useJamStore } from "@/store/useJamStore";
import JamLobby from "@/components/Jam/JamLobby";
import MixerBoard from "@/components/Jam/MixerBoard";

export default function JamRoom() {
  const isLoggedIn = !!localStorage.getItem("token");
  // Lấy thêm currentTracks và changeActiveRecord để tự động chọn nhạc cụ
  const { fetchJamRoomData, currentTracks, changeActiveRecord } = useJamStore();

  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("id");
  const trackId = params.get("trackId");

  // 1. Gọi API tải dữ liệu phòng Jam
  useEffect(() => {
    if (isLoggedIn && roomId) {
      fetchJamRoomData(roomId);
    }
  }, [isLoggedIn, roomId, fetchJamRoomData]);

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

  if (!isLoggedIn) return <div className="p-10 text-center">Vui lòng đăng nhập...</div>;

  // Nếu không có ID trên URL -> Hiển thị Sảnh chờ
  if (!roomId) return <JamLobby />;

  // Nếu có ID -> Hiển thị Bàn Mixer chính
  return <MixerBoard />;
}