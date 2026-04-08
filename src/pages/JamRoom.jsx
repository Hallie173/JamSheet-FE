import React, { useEffect } from "react";
import { useJamStore } from "@/store/useJamStore";
import JamLobby from "@/components/Jam/JamLobby";
import MixerBoard from "@/components/Jam/MixerBoard";

export default function JamRoom() {
  const isLoggedIn = !!localStorage.getItem("token");
  const { fetchJamRoomData, activeRoom } = useJamStore();

  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("id");

  useEffect(() => {
    if (isLoggedIn && roomId) {
      fetchJamRoomData(roomId);
    }
  }, [isLoggedIn, roomId]);

  if (!isLoggedIn) return <div className="p-10 text-center">Vui lòng đăng nhập...</div>;

  // Nếu không có ID trên URL -> Hiển thị Sảnh chờ
  if (!roomId) return <JamLobby />;

  // Nếu có ID -> Hiển thị Bàn Mixer chính
  return <MixerBoard />;
}