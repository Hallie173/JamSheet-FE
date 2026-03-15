import React, { useState } from "react";
import { 
  Play, Pause, Square, SkipBack, Download, 
  Mic2, Volume2, Plus,
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
import { Card } from "@/components/ui/card"; // Import thêm Card của shadcn

export default function JamRoom() {
  const [isPlaying, setIsPlaying] = useState(false);

  // Dữ liệu mô phỏng, tôi đã đổi lại màu dải sóng sang mã hexa để dễ gán viền màu dọc
  const [tracks, setTracks] = useState([
    { 
      id: 1, 
      instrument: "Piano Grand", 
      user: "le duy phuong ha", 
      avatar: "https://github.com/shadcn.png",
      waveColor: "#3b82f6", // Màu dải sóng (Xanh dương)
      volume: 80,
      activeRecordId: 'r2',
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
      waveColor: "#10b981", // Màu dải sóng (Xanh lục)
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
      waveColor: "#f59e0b", // Màu dải sóng (Vàng hổ phách)
      volume: 50,
      activeRecordId: null,
      records: [],
      clips: [] 
    }
  ]);

  const changeActiveRecord = (trackId, recordId) => {
    setTracks(tracks.map(t => 
      t.id === trackId ? { ...t, activeRecordId: recordId } : t
    ));
  };

  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-xl overflow-hidden shadow-sm">
      
      {/* KHU VỰC 1: MASTER CONTROL BAR (Giữ nguyên) */}
      <div className="h-16 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3 w-80">
          <div className="w-10 h-10 rounded-md bg-primary/20 flex items-center justify-center border border-primary/30">
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
              className="w-11 h-11 rounded-full shadow-lg shadow-primary/20"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Square className="w-4 h-4 fill-current" />
            </Button>
          </div>
          <div className="text-xs font-mono font-medium text-muted-foreground mt-1.5 tracking-wider">
            00:01:24 / 00:03:45
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 w-80">
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
        
        {/* ========================================================= */}
        {/* KHU VỰC 2: TRACK PANEL BÊN TRÁI - NƠI ĐƯỢC NÂNG CẤP GIAO DIỆN */}
        {/* ========================================================= */}
        
        {/* Nền của panel tối hơn (bg-background) để làm nổi các thẻ Card */}
        <div className="w-72 border-r border-border bg-background flex flex-col z-10 overflow-y-auto">
          <div className="h-8 border-b border-border flex items-center px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40 sticky top-0 z-10">
            Các Kệ Nhạc Cụ
          </div>

          {/* Dùng flex-col và p-3 để tạo khoảng trống giữa các Card */}
          <div className="flex flex-col gap-3 p-3">
            {tracks.map((track) => (
              // Biến mỗi track thành một thẻ Card độc lập, có shadow
              <Card 
                key={track.id} 
                className="h-28 flex flex-col p-0 rounded-lg overflow-hidden border-border bg-card shadow hover:shadow-md hover:border-primary/40 transition-all duration-300 relative group"
              >
                {/* NÂNG CẤP 2: Dải màu dọc ở mép trái, khớp với màu sóng âm */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg z-10"
                  style={{ backgroundColor: track.waveColor }}
                />

                {/* Nội dung bên trong card, có padding trái (pl-4) để nhường chỗ cho dải màu */}
                <div className="flex flex-col h-full p-3 pl-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Avatar className="w-7 h-7 border border-border/50 shadow-inner">
                        {track.avatar ? (
                          <AvatarImage src={track.avatar} />
                        ) : (
                          <AvatarFallback className="bg-muted text-[10px]">?</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        {/* Tăng tương phản text */}
                        <span className="font-bold text-sm truncate text-foreground leading-tight">{track.instrument}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{track.user}</span>
                      </div>
                    </div>
                    {/* Icon options mờ đi, chỉ hiện khi hover */}
                    <Button variant="ghost" size="icon" className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Nhóm điều khiển dưới cùng */}
                  <div className="mt-auto flex items-center gap-2.5">
                    
                    {/* Menu chọn bản thu - NÂNG CẤP 3: Tăng tương phản */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          // Nếu có record, nút sẽ phát sáng màu Primary
                          className={`h-7 px-2.5 flex gap-1.5 transition-colors ${
                            track.records.length > 0 
                              ? 'text-primary border-primary/50 bg-primary/10 hover:bg-primary/20' 
                              : 'text-muted-foreground border-border bg-muted/30'
                          }`}
                          disabled={track.records.length === 0}
                          title="Xem danh sách các bản thu trong kệ này"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold">{track.records.length}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      
                      <DropdownMenuContent side="right" align="start" className="w-56 ml-3 shadow-xl">
                        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                          Chọn bản thu hoạt động
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {track.records.map(record => (
                          <DropdownMenuItem 
                            key={record.id}
                            onSelect={(e) => {
                              e.preventDefault();
                              changeActiveRecord(track.id, record.id);
                            }}
                            className={`cursor-pointer flex items-center justify-between py-2 rounded-md ${
                              track.activeRecordId === record.id 
                                ? 'bg-primary/10 text-primary focus:bg-primary/20 focus:text-primary' 
                                : ''
                            }`}
                          >
                            <span className="text-sm font-medium truncate pr-4">{record.name}</span>
                            {track.activeRecordId === record.id && (
                              <Check className="w-4 h-4 text-primary shrink-0" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Thanh volume - NÂNG CẤP 3: Nổi bật Icon */}
                    <div className="flex-1 px-1 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-foreground/70 shrink-0" />
                      <Slider defaultValue={[track.volume]} max={100} step={1} className="w-full" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Nút thêm Track mới */}
            <div className="pt-1">
              <Button variant="outline" className="w-full border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-all">
                <Plus className="w-4 h-4 mr-1" />
                Thêm kệ nhạc cụ
              </Button>
            </div>
          </div>
        </div>

        {/* KHU VỰC 3: TIMELINE (Phần nền bg-grid-pattern và màu clips được cập nhật) */}
        <div className="flex-1 bg-background overflow-x-auto overflow-y-auto relative">
          <div className="h-8 border-b border-border bg-muted/40 flex items-end px-4 sticky top-0 z-10 min-w-[800px]">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex-1 border-l border-border/50 h-3 text-[10px] text-muted-foreground pl-1">
                0:0{i * 5}
              </div>
            ))}
          </div>

          <div className="relative min-w-[800px]">
            {tracks.map((track) => (
              // Cập nhật nền grid pattern
              <div key={track.id} className="h-28 border-b border-border/50 relative group bg-[url('/grid.svg')] bg-center">
                <div className="absolute w-full h-px bg-border/20 top-1/2 -translate-y-1/2"></div>
                {track.clips.length > 0 ? (
                  track.clips.map((clip, index) => (
                    <div 
                      key={index} 
                      // Sử dụng style inline để gán màu đã đổi sang HEXA
                      className={`absolute top-2 bottom-2 rounded-md opacity-85 border border-white/20 shadow-sm cursor-pointer hover:opacity-100 transition-opacity flex items-center justify-center overflow-hidden`}
                      style={{ left: clip.start, width: clip.width, backgroundColor: track.waveColor }}
                    >
                      <svg className="w-full h-full opacity-30 px-2" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M0,50 Q5,10 10,50 T20,50 T30,50 T40,50 T50,50 T60,50 T70,50 T80,50 T90,50 T100,50" stroke="white" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                  ))
                ) : (
                  <div className="absolute inset-2 border-2 border-dashed border-muted flex items-center justify-center rounded-md bg-muted/10 hover:bg-muted/20 hover:border-border transition-colors cursor-pointer text-muted-foreground text-sm font-medium">
                    + Nhấp để nộp bản thu Vocal
                  </div>
                )}
              </div>
            ))}
            <div className="absolute top-0 bottom-0 left-[25%] w-px bg-primary z-20 shadow-[0_0_15px_rgba(255,255,255,0.7)]">
              <div className="absolute -top-3 -left-2.5 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[14px] border-transparent border-t-primary shadow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}