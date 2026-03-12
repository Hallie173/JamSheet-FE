import React, { useState } from "react";
import { Mic2, Heart, Disc, PlusCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyRecords() {
  // Dữ liệu cá nhân
  const [myRecords, setMyRecords] = useState([]);

  // Dữ liệu cộng đồng (Giả lập)
  const exploreRecords = [
    { id: 1, trackName: "Solo Piano Intro", projectTitle: "River Flows in You - Acoustic", instrument: "Piano", likes: 85, duration: "1:20" },
    { id: 2, trackName: "Vocal Điệp khúc", projectTitle: "Hotel California Jam", instrument: "Vocal", likes: 342, duration: "0:45" },
    { id: 3, trackName: "Bassline ngẫu hứng", projectTitle: "Jazz Night Chills", instrument: "Bass", likes: 120, duration: "2:15" },
    { id: 4, trackName: "Đoạn dạo đầu Guitar", projectTitle: "Acoustic Vibes", instrument: "Guitar", likes: 56, duration: "0:30" },
    { id: 5, trackName: "Trống dồn nhịp điệu", projectTitle: "Rock & Roll Life", instrument: "Drums", likes: 210, duration: "1:05" },
  ];

  return (
    <div className="flex flex-col h-full space-y-8">
      {/* Header Trang */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bản thu của tôi</h1>
        </div>
      </div>

      {/* Khu vực Dữ liệu cá nhân (Giữ nguyên) */}
      <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
        {myRecords.length === 0 ? (
          <>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Mic2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Bạn chưa có bản thu âm nào.</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Hãy tìm một phòng Hợp tấu đang thiếu nhạc cụ của bạn và bắt đầu thu âm ngay.
            </p>
            <Button variant="default" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Tìm phòng Jam
            </Button>
          </>
        ) : (
          <div>{/* Hiển thị danh sách myRecords ở đây sau này */}</div>
        )}
      </div>

      {/* Khu vực Khám phá cộng đồng */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Khám phá Bản thu xuất sắc</h2>
        </div>
        <p className="text-muted-foreground">Xem bản thu được yêu thích do cộng đồng đóng góp</p>
        
        {/* Lưới Grid: Chia làm nhiều cột để tạo các khối vuông */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
          {exploreRecords.map((record) => (
            // Thẻ Card chính bao bọc toàn bộ khối
            <div 
              key={record.id} 
              className="group flex flex-col cursor-pointer border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors bg-card"
            >
              {/* Phần 1: Khối vuông tỷ lệ 1:1 chứa Icon Đĩa nhạc khổng lồ */}
              <div className="aspect-square bg-muted/30 flex items-center justify-center group-hover:bg-muted/50 transition-colors">
                <Disc className="w-32 h-32 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
              
              {/* Phần 2: Thông tin chi tiết nằm dưới khối vuông */}
              <div className="p-4 flex flex-col flex-1 border-t border-border/50">
                <h3 className="font-bold text-sm truncate" title={record.trackName}>
                  {record.trackName}
                </h3>
                <p className="text-xs text-muted-foreground truncate mt-1" title={record.projectTitle}>
                  {record.projectTitle}
                </p>
                
                {/* Khu vực Tag nhạc cụ và Lượt thích nằm dưới cùng */}
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    {record.instrument}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{record.duration}</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-destructive" />
                      <span>{record.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}