import React, { useState } from "react";
import { 
  Play, Pause, Square, SkipBack, Download, 
  Mic2, Settings2, Volume2, Plus,
  MoreHorizontal, Layers, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function JamRoom() {
  const [isPlaying, setIsPlaying] = useState(false);

  // Dữ liệu mô phỏng các Kệ nhạc cụ, bổ sung mảng 'records' (các bản thu bên trong kệ)
  const [tracks, setTracks] = useState([
    { 
      id: 1, 
      instrument: "Piano Grand", 
      user: "le duy phuong ha", 
      avatar: "https://github.com/shadcn.png",
      color: "bg-blue-500",
      volume: 80,
      activeRecordId: 'r2', // ID của bản thu đang được bật
      records: [
        { id: 'r1', name: "Take 1 (Bản nháp êm dịu)" },
        { id: 'r2', name: "Take 2 (Chơi mạnh hơn)" },
        { id: 'r3', name: "Take 3 (Có biến tấu)" }
      ],
      clips: [{ start: 0, width: "40%" }, { start: "45%", width: "20%" }] 
    },
    { 
      id: 2, 
      instrument: "Acoustic Guitar", 
      user: "Anais desiree", 
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      color: "bg-emerald-500",
      volume: 75,
      activeRecordId: 'g1',
      records: [
        { id: 'g1', name: "Đánh quạt chả (Strumming)" },
        { id: 'g2', name: "Rải nốt (Fingerstyle)" }
      ],
      clips: [{ start: "10%", width: "60%" }] 
    },
    { 
      id: 3, 
      instrument: "Vocal Chính", 
      user: "Chưa có", 
      avatar: "",
      color: "bg-amber-500",
      volume: 50,
      activeRecordId: null,
      records: [], // Kệ trống chưa có bản thu nào
      clips: [] 
    }
  ]);

  // Hàm xử lý đổi bản thu (Cập nhật activeRecordId)
  const changeActiveRecord = (trackId, recordId) => {
    setTracks(tracks.map(t => 
      t.id === trackId ? { ...t, activeRecordId: recordId } : t
    ));
  };

  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-xl overflow-hidden shadow-sm">
      
      {/* KHU VỰC 1: MASTER CONTROL BAR */}
      <div className="h-16 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3 w-64">
          <div className="w-10 h-10 rounded-md bg-primary/20 flex items-center justify-center">
            <Mic2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold leading-tight">Gió Vẫn Hát - Jam</h2>
            <p className="text-xs text-muted-foreground">BPM: 120 • 4/4</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <SkipBack className="w-5 h-5 fill-current" />
            </Button>
            <Button 
              variant="default" 
              size="icon" 
              className="w-10 h-10 rounded-full"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Square className="w-4 h-4 fill-current" />
            </Button>
          </div>
          <div className="text-xs font-mono font-medium text-muted-foreground mt-1 tracking-wider">
            00:01:24 / 00:03:45
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 w-64">
          <div className="flex items-center gap-2 w-32">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider defaultValue={[100]} max={100} step={1} className="w-full" />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Xuất File
          </Button>
        </div>
      </div>

      {/* KHU VỰC CHÍNH */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* KHU VỰC 2: TRACK PANEL BÊN TRÁI */}
        <div className="w-72 border-r border-border bg-card/50 flex flex-col z-10 overflow-y-auto">
          <div className="h-8 border-b border-border flex items-center px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20">
            Các Kệ Nhạc Cụ
          </div>

          {tracks.map((track) => (
            <div key={track.id} className="h-28 border-b border-border flex flex-col p-3 hover:bg-accent/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Avatar className="w-6 h-6 border border-border">
                    {track.avatar ? (
                      <AvatarImage src={track.avatar} />
                    ) : (
                      <AvatarFallback className="bg-muted text-[10px]">?</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-sm truncate">{track.instrument}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{track.user}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Nhóm điều khiển mới: Nút Layers thay cho Mute/Solo */}
              <div className="mt-auto flex items-center gap-2">
                
                {/* Menu chọn bản thu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`h-7 px-2 flex gap-1.5 ${track.records.length > 0 ? 'text-primary border-primary/50 bg-primary/10' : 'text-muted-foreground'}`}
                      disabled={track.records.length === 0}
                      title="Xem danh sách các bản thu trong kệ này"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{track.records.length}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  
                  {/* side="right" để menu bung sang ngang thay vì che khuất kệ nhạc cụ */}
                  <DropdownMenuContent side="right" align="start" className="w-56 ml-2">
                    <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                      Chọn bản thu hoạt động
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {track.records.map(record => (
                      <DropdownMenuItem 
                        key={record.id}
                        // CHÌA KHÓA Ở ĐÂY: e.preventDefault() ngăn menu đóng lại khi click
                        onSelect={(e) => {
                          e.preventDefault();
                          changeActiveRecord(track.id, record.id);
                        }}
                        className={`cursor-pointer flex items-center justify-between py-2 ${track.activeRecordId === record.id ? 'bg-primary/10 text-primary focus:bg-primary/20 focus:text-primary' : ''}`}
                      >
                        <span className="text-sm font-medium truncate pr-4">{record.name}</span>
                        {/* Dấu tick xác nhận bản thu đang được bật */}
                        {track.activeRecordId === record.id && (
                          <Check className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Thanh kéo âm lượng (Volume) */}
                <div className="flex-1 px-2 flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <Slider defaultValue={[track.volume]} max={100} step={1} className="w-full" />
                </div>
              </div>
            </div>
          ))}

          <div className="p-4">
            <Button variant="outline" className="w-full border-dashed gap-2 text-muted-foreground">
              <Plus className="w-4 h-4" />
              Thêm kệ nhạc cụ
            </Button>
          </div>
        </div>

        {/* KHU VỰC 3: TIMELINE (Giữ nguyên như cũ) */}
        <div className="flex-1 bg-background overflow-x-auto overflow-y-auto relative">
          <div className="h-8 border-b border-border bg-muted/20 flex items-end px-4 sticky top-0 z-10 min-w-[800px]">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex-1 border-l border-border/50 h-3 text-[10px] text-muted-foreground pl-1">
                0:0{i * 5}
              </div>
            ))}
          </div>

          <div className="relative min-w-[800px]">
            {tracks.map((track) => (
              <div key={track.id} className="h-28 border-b border-border/50 relative group bg-grid-pattern">
                <div className="absolute w-full h-px bg-border/30 top-1/2 -translate-y-1/2"></div>
                {track.clips.length > 0 ? (
                  track.clips.map((clip, index) => (
                    <div 
                      key={index} 
                      className={`absolute top-2 bottom-2 rounded-md ${track.color} opacity-80 border border-white/20 shadow-sm cursor-pointer hover:opacity-100 transition-opacity flex items-center justify-center overflow-hidden`}
                      style={{ left: clip.start, width: clip.width }}
                    >
                      <svg className="w-full h-full opacity-30 px-2" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M0,50 Q5,10 10,50 T20,50 T30,50 T40,50 T50,50 T60,50 T70,50 T80,50 T90,50 T100,50" stroke="white" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                  ))
                ) : (
                  <div className="absolute inset-2 border-2 border-dashed border-muted flex items-center justify-center rounded-md bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer text-muted-foreground text-sm font-medium">
                    + Nhấp để nộp bản thu Vocal
                  </div>
                )}
              </div>
            ))}
            <div className="absolute top-0 bottom-0 left-[25%] w-px bg-primary z-20 shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              <div className="absolute -top-3 -left-2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-transparent border-t-primary"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}