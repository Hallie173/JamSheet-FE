import React, { useEffect, useState } from "react";
import { Music, Users, Clock, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JamLobby() {
  const [myLobbyRooms, setMyLobbyRooms] = useState([]);
  const [collabLobbyRooms, setCollabLobbyRooms] = useState([]);
  const [isLoadingLobby, setIsLoadingLobby] = useState(false);

  useEffect(() => {
    const fetchLobbyJams = async () => {
      setIsLoadingLobby(true);
      try {
        const response = await fetch("http://localhost:5000/api/jams/lobby", {
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

  const renderRoomCard = (room) => (
    <div
      key={room._id}
      onClick={() => (window.location.href = `/jam-room?id=${room._id}`)}
      className="group cursor-pointer border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors bg-card shadow-sm hover:shadow-md flex flex-col h-32 relative"
    >
      <div className="p-4 flex-1">
        <h3 className="font-bold text-base mb-1 truncate group-hover:text-primary transition-colors pr-8">
          {room.title}
        </h3>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-2">
          <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded">
            <Clock className="w-3 h-3" />
            <span>{room.tempo} BPM</span>
          </div>
          <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded">
            <Users className="w-3 h-3" />
            <span>{room.required_instruments?.length || 0} Nhạc cụ</span>
          </div>
        </div>
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
        <Play className="w-4 h-4 text-primary ml-0.5" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-xl overflow-y-auto custom-scrollbar p-8">
      <div className="mb-8 border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Sảnh Hợp Tấu</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý và tham gia các dự án âm nhạc của bạn.
        </p>
      </div>

      {isLoadingLobby ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" /> Phòng Jam của bạn
            </h2>
            {myLobbyRooms.length === 0 ? (
              <div className="p-8 border-2 border-dashed rounded-xl border-border bg-muted/10 text-center">
                <p className="text-muted-foreground">
                  Bạn chưa tạo phòng Jam nào.
                </p>
                <Button
                  variant="link"
                  onClick={() => (window.location.href = "/sheets-library")}
                >
                  Đến Thư viện Nhạc phổ để tạo ngay
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {myLobbyRooms.map(renderRoomCard)}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" /> Dự án bạn đã cộng
              tác
            </h2>
            {collabLobbyRooms.length === 0 ? (
              <div className="p-8 border border-border rounded-xl bg-muted/10 text-center">
                <p className="text-muted-foreground text-sm">
                  Bạn chưa tham gia đóng góp cho phòng Jam nào khác.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {collabLobbyRooms.map(renderRoomCard)}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
