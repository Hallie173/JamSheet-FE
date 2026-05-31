import React, { useEffect, useState } from "react";
import { Music, Users, Clock, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JamLobby() {
  const [myLobbyRooms, setMyLobbyRooms] = useState([]);
  const [collabLobbyRooms, setCollabLobbyRooms] = useState([]);
  const [isLoadingLobby, setIsLoadingLobby] = useState(true);

  useEffect(() => {
    const fetchLobbyJams = async () => {
      setIsLoadingLobby(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jams/lobby`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
          const data = await response.json();
          setMyLobbyRooms(data.myRooms);
          setCollabLobbyRooms(data.collabRooms);
        }
      } catch (error) {
        console.error("Lỗi tải sảnh chờ:", error);
      } finally {
        setIsLoadingLobby(false);
      }
    };
    fetchLobbyJams();
  }, []);

  const renderRoomCard = (room) => {
    const totalInstruments = Math.max(
      room.tracks_config?.length || 0,
      room.required_instruments?.length || 0,
    );

    return (
      <div
        key={room._id}
        onClick={() => (window.location.href = `/jam-room?id=${room._id}`)}
        className="group cursor-pointer border border-border rounded-2xl sm:rounded-xl overflow-hidden hover:border-primary/50 transition-colors bg-card shadow-xl sm:shadow-sm hover:shadow-md flex flex-col h-auto sm:h-32 relative"
      >
        <div className="p-5 sm:p-4 flex-1">
          <h3 className="font-bold text-lg sm:text-base mb-2 sm:mb-1 truncate group-hover:text-primary transition-colors pr-8">
            {room.title}
          </h3>
          <div className="flex items-center gap-4 text-xs sm:text-[11px] text-muted-foreground mt-3 sm:mt-2">
            <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-md sm:rounded">
              <Clock className="w-4 h-4 sm:w-3 sm:h-3" />
              <span>{room.tempo} BPM</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-md sm:rounded transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary">
              <Users className="w-4 h-4 sm:w-3 sm:h-3" />
              <span className="font-medium">{totalInstruments} Nhạc cụ</span>
            </div>
          </div>
        </div>
        <div className="absolute right-4 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-x-2 sm:group-hover:translate-x-0">
          <Play className="w-5 h-5 sm:w-4 sm:h-4 text-primary ml-1 sm:ml-0.5" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background border-x-0 sm:border-x border-border sm:rounded-xl overflow-y-auto custom-scrollbar p-4 sm:p-8 pb-24 sm:pb-8">
      <div className="mb-6 sm:mb-8 border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sảnh Hợp Tấu</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Quản lý và tham gia các dự án âm nhạc của bạn.
          </p>
        </div>
      </div>

      {isLoadingLobby ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-10">
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> Phòng Jam của bạn
            </h2>
            {myLobbyRooms.length === 0 ? (
              <div className="p-6 sm:p-8 border-2 border-dashed rounded-2xl sm:rounded-xl border-border bg-muted/10 text-center">
                <p className="text-muted-foreground text-sm sm:text-base mb-2">
                  Bạn chưa tạo phòng Jam nào.
                </p>
                <Button
                  variant="link"
                  className="h-12 sm:h-10 text-base sm:text-sm"
                  onClick={() => (window.location.href = "/sheets-library")}
                >
                  Đến Thư viện Nhạc phổ để tạo ngay
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {myLobbyRooms.map(renderRoomCard)}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" /> Dự án bạn đã cộng tác
            </h2>
            {collabLobbyRooms.length === 0 ? (
              <div className="p-6 sm:p-8 border border-border rounded-2xl sm:rounded-xl bg-muted/10 text-center shadow-inner">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Bạn chưa tham gia đóng góp cho phòng Jam nào khác.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {collabLobbyRooms.map(renderRoomCard)}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}