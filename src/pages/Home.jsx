import React, { useEffect } from "react";
import {
  Play,
  PlusCircle,
  Clock,
  Flame,
  Users,
  Mic2,
  ArrowRight,
  Disc,
  Music,
  Music2,
  Music3,
  Music4,
  Drum,
  Guitar,
  Piano,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const isLoggedIn = !!user;

  const decorativeIcons = [
    Music,
    Music2,
    Music3,
    Music4,
    Drum,
    Guitar,
    Piano,
    Headphones,
  ];

  const [iconIndex, setIconIndex] = React.useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prevIndex) => {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * decorativeIcons.length);
        } while (nextIndex === prevIndex);
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const CurrentDecorativeIcon = decorativeIcons[iconIndex];

  const recentProjects = [
    {
      id: 1,
      title: "Gió Vẫn Hát - Jam",
      role: "Piano",
      lastActive: "2 giờ trước",
      progress: 80,
    },
    {
      id: 2,
      title: "Jazz Night Chills",
      role: "Bass",
      lastActive: "Hôm qua",
      progress: 45,
    },
  ];

  // Dữ liệu mẫu: Tương tác cao
  const trendingJams = [
    {
      id: 1,
      title: "River Flows in You (Rock Cover)",
      creator: "Anais desiree",
      likes: 1240,
      participants: 5,
      tags: ["Hoàn thành", "Rock"],
    },
    {
      id: 2,
      title: "Hotel California - Acoustic",
      creator: "John Doe",
      likes: 856,
      participants: 4,
      tags: ["Hoàn thành", "Acoustic"],
    },
    {
      id: 3,
      title: "Canon in D - Lofi Remix",
      creator: "Lofi Girl",
      likes: 620,
      participants: 3,
      tags: ["Hoàn thành", "Lofi"],
    },
  ];

  // Dữ liệu mẫu: Đang thiếu nhạc công
  const missingJams = [
    {
      id: 1,
      title: "Đêm Nay Ai Đưa Em Về",
      creator: "Minh Tuấn",
      missing: ["Drums", "Vocal"],
      filled: 2,
      total: 4,
    },
    {
      id: 2,
      title: "Nắng Sân Trường",
      creator: "Hải Yến",
      missing: ["Guitar Lead"],
      filled: 3,
      total: 4,
    },
    {
      id: 3,
      title: "Blue Bossa Jam",
      creator: "Jazz Lover",
      missing: ["Saxophone", "Piano"],
      filled: 1,
      total: 3,
    },
  ];

  return (
    <div className="flex flex-col space-y-10 pb-10">
      {/* PHẦN 1: LỜI CHÀO & HERO SECTION */}
      <div className="shrink-0 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background border border-primary/10 to-background p-8 sm:p-10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {isLoggedIn
              ? `Chào buổi tối, ${user.username}! 🌙`
              : "Chào mừng đến với JamSheet! 🎵"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isLoggedIn
              ? "Sẵn sàng để hòa âm chưa? Hôm nay bạn muốn bắt đầu một dự án mới hay đóng góp vào các phòng Jam của cộng đồng?"
              : "Trở thành một phần của cộng đồng nhạc công không giới hạn. Đăng nhập ngay để tạo phòng Jam, đóng góp bản thu và giao lưu cùng mọi người."}
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            {isLoggedIn ? (
              <>
                <a href="/sheet-library">
                  <Button className="gap-2 h-11 px-6 shadow-lg shadow-primary/25">
                    <PlusCircle className="w-5 h-5" />
                    Tạo phòng Jam mới
                  </Button>
                </a>
                <a href="/my-records">
                  <Button
                    variant="outline"
                    className="gap-2 h-11 px-6 bg-background/50 backdrop-blur-sm"
                  >
                    <Mic2 className="w-5 h-5" />
                    Thu âm ngẫu hứng
                  </Button>
                </a>
              </>
            ) : (
              <>
                <>
                  <a href="/login">
                    <Button className="gap-2 h-11 px-8 shadow-lg shadow-primary/25">
                      Đăng nhập
                    </Button>
                  </a>
                  <a href="/register">
                    <Button
                      variant="outline"
                      className="gap-2 h-11 px-8 bg-background/50 backdrop-blur-sm"
                    >
                      Tạo tài khoản ngay
                    </Button>
                  </a>
                </>
              </>
            )}
          </div>
        </div>
        {/* Họa tiết trang trí góc phải */}
        <CurrentDecorativeIcon
          key={iconIndex}
          className="absolute -right-10 -bottom-10 w-64 h-64 text-primary/5 rotate-12 shrink-0 animate-in fade-in duration-1000 zoom-in-95"
        />
      </div>

      {/* PHẦN 2: TIẾP TỤC CÔNG VIỆC (CHỈ HIỂN THỊ KHI ĐÃ ĐĂNG NHẬP) */}
      {isLoggedIn && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Tiếp tục công việc</h2>
            </div>
            <Button
              variant="ghost"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50"
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Play className="w-5 h-5 ml-1 text-foreground" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold truncate">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Kệ của bạn: {project.role}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {project.lastActive}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* PHẦN 3: PHÒNG CÓ TƯƠNG TÁC CAO */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-destructive" />
          <h2 className="text-2xl font-bold">Sân Khấu Hợp Tấu (Thịnh hành)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingJams.map((jam) => (
            <Card
              key={jam.id}
              className="cursor-pointer hover:shadow-md transition-all group overflow-hidden border-border/50"
            >
              <div className="h-24 bg-muted/30 flex items-center justify-center relative">
                <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Play className="w-5 h-5 ml-1 text-primary" />
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex gap-2 mb-3">
                  {jam.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold uppercase tracking-wider bg-secondary px-2 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-bold text-lg leading-tight mb-1 truncate">
                  {jam.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tạo bởi: {jam.creator}
                </p>
              </CardContent>
              <CardFooter className="px-4 py-3 border-t border-border/50 bg-muted/10 flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-destructive" />
                  <span>{jam.likes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{jam.participants} nhạc công</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* PHẦN 4: PHÒNG JAM ĐANG THIẾU NHẠC CỤ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-2xl font-bold">Cộng đồng đang cần bạn</h2>
          </div>
          <Button
            variant="ghost"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Khám phá thêm <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missingJams.map((jam) => (
            <Card
              key={jam.id}
              className="cursor-pointer border-dashed border-2 hover:border-primary/50 hover:bg-card/80 transition-all bg-card/30"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base leading-tight">
                    {jam.title}
                  </h3>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {jam.filled}/{jam.total} slot
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Host: {jam.creator}
                </p>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm mb-2 font-medium">Đang tìm kiếm:</p>
                <div className="flex flex-wrap gap-2">
                  {jam.missing.map((inst) => (
                    <span
                      key={inst}
                      className="text-xs font-semibold bg-primary/15 text-primary border border-primary/20 px-2.5 py-1 rounded-md flex items-center gap-1.5"
                    >
                      <Disc className="w-3 h-3" />
                      {inst}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90">
                  <Mic2 className="w-4 h-4" />
                  Vào Jam ngay
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
