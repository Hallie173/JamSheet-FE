import React, { useState } from "react";
import { Music, FileText, Heart, Users, UploadCloud, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function SheetsLibrary() {
  // Dữ liệu cá nhân (Giả lập mảng rỗng để hiển thị trạng thái Chưa có dữ liệu)
  const [mySheets, setMySheets] = useState([]);

  // Dữ liệu cộng đồng (Giả lập các bản nhạc phổ biến)
  const exploreSheets = [
    { id: 1, title: "River Flows in You", composer: "Yiruma", tags: ["Piano"], likes: 1240, contributors: 45 },
    { id: 2, title: "Hotel California", composer: "Eagles", tags: ["Acoustic", "Vocal"], likes: 856, contributors: 32 },
    { id: 3, title: "Canon in D", composer: "Johann Pachelbel", tags: ["Violin", "Piano"], likes: 3200, contributors: 120 },
  ];

  return (
    <div className="flex flex-col h-full space-y-8">
      {/* Header Trang */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thư viện Nhạc phổ</h1>
          <p className="text-muted-foreground mt-1">Quản lý các bản nhạc bạn đã tải lên</p>
        </div>
        <Button className="flex items-center gap-2">
          <UploadCloud className="w-4 h-4" />
          Tải lên Nhạc phổ
        </Button>
      </div>

      {/* Khu vực Dữ liệu cá nhân */}
      <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
        {mySheets.length === 0 ? (
          <>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Bạn chưa đăng bản nhạc nào.</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Hãy chia sẻ nhạc phổ của bạn để cộng đồng cùng tạo ra những bản hợp tấu tuyệt vời.
            </p>
          </>
        ) : (
          <div>{/* Hiển thị danh sách mySheets ở đây sau này */}</div>
        )}
      </div>

      {/* Khu vực Khám phá cộng đồng */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Khám phá Cộng đồng</h2>
        </div>
        <p className="text-muted-foreground">Những nhạc phổ đang được yêu thích và cover nhiều nhất</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {exploreSheets.map((sheet) => (
            <Card key={sheet.id} className="hover:border-primary/50 transition-colors cursor-pointer flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex gap-2">
                    {sheet.tags.map(tag => (
                      <span key={tag} className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="text-lg font-bold mt-4 leading-tight">{sheet.title}</h3>
                <p className="text-sm text-muted-foreground">{sheet.composer}</p>
              </CardHeader>
              <CardFooter className="mt-auto border-t border-border pt-4 flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-1.5 text-sm">
                  <Heart className="w-4 h-4 text-destructive" />
                  <span>{sheet.likes}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{sheet.contributors} tham gia</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}