import React, { useEffect, useState } from "react";
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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";

// Hàm tiện ích để hiển thị thời gian tương đối (VD: "2 giờ trước")
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return "Vừa xong";
};

export default function Home() {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const isLoggedIn = !!user;

  const [recentProjects, setRecentProjects] = useState([]);
  const [trendingJams, setTrendingJams] = useState([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
  }, []);

  // Fetch dữ liệu thật từ Backend
  useEffect(() => {
    const fetchRecentDrafts = async () => {
      setIsLoadingDrafts(true);
      try {
        const res = await fetch(getApiUrl(API_ENDPOINTS.JAMS_RECENT_DRAFTS), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRecentProjects(data);
        }
      } catch (error) {
        console.error("Lỗi tải bản nháp:", error);
      } finally {
        setIsLoadingDrafts(false);
      }
    };

    const fetchTrendingJams = async () => {
      setIsLoadingTrending(true);
      try {
        const res = await fetch(getApiUrl(API_ENDPOINTS.JAMS_TRENDING));
        if (res.ok) {
          const data = await res.json();
          setTrendingJams(data);
        }
      } catch (error) {
        console.error("Lỗi tải trending:", error);
      } finally {
        setIsLoadingTrending(false);
      }
    };

    if (isLoggedIn) fetchRecentDrafts();
    fetchTrendingJams();
  }, [isLoggedIn]);

  const decorativeIcons = [
    Music, Music2, Music3, Music4, Drum, Guitar, Piano, Headphones,
  ];

  const [iconIndex, setIconIndex] = useState(0);

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

  // Giữ lại dữ liệu mẫu cho mục Thiếu nhạc công (hoặc bạn có thể viết API tương tự như Trending để lấy những phòng chưa kín)
  const missingJams = [
    {
      id: 1, title: "Bella Ciao", creator: "HS", missing: ["Piano", "Trumpet"], filled: 2, total: 4,
    },
  ];

  return (
    <div className="flex flex-col space-y-10 pb-10">
      {/* PHẦN 1: LỜI CHÀO */}
      <div className="shrink-0 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background border border-primary/10 to-background p-8 sm:p-10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {isLoggedIn ? `Chào buổi tối, ${user.username}! 🌙` : "Chào mừng đến với JamSheet! 🎵"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isLoggedIn
              ? "Sẵn sàng để hòa âm chưa? Hôm nay bạn muốn bắt đầu một dự án mới hay đóng góp vào các phòng Jam của cộng đồng?"
              : "Trở thành một phần của cộng đồng nhạc công không giới hạn. Đăng nhập ngay để tạo phòng Jam, đóng góp bản thu và giao lưu cùng mọi người."}
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            {isLoggedIn ? (
              <a href="/sheets-library">
                <Button className="gap-2 h-11 px-6 shadow-lg shadow-primary/25">
                  <PlusCircle className="w-5 h-5" /> Tạo phòng Jam mới
                </Button>
              </a>
            ) : (
              <>
                <a href="/login">
                  <Button className="gap-2 h-11 px-8 shadow-lg shadow-primary/25">Đăng nhập</Button>
                </a>
                <a href="/register">
                  <Button variant="outline" className="gap-2 h-11 px-8 bg-background/50 backdrop-blur-sm">
                    Tạo tài khoản ngay
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
        <CurrentDecorativeIcon key={iconIndex} className="absolute -right-10 -bottom-10 w-64 h-64 text-primary/5 rotate-12 shrink-0 animate-in fade-in duration-1000 zoom-in-95" />
      </div>

      {/* PHẦN 2: TIẾP TỤC CÔNG VIỆC (Dữ liệu thật) */}
      {isLoggedIn && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Tiếp tục công việc</h2>
            </div>
            <a href="/jam-room">
              <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
                Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </div>
          
          {isLoadingDrafts ? (
            <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center p-6 bg-muted/20 border border-dashed rounded-xl text-muted-foreground">
              Bạn không có dự án nào đang dang dở.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <Card
                  key={project.draftId}
                  className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50"
                  onClick={() => window.location.href = `/jam-room?id=${project.id}&draftId=${project.draftId}`}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Play className="w-5 h-5 ml-1 text-foreground" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-bold truncate" title={project.title}>{project.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Kệ của bạn: {project.role}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${project.progress}%` }}></div>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {timeAgo(project.lastActive)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* PHẦN 3: SÂN KHẤU THỊNH HÀNH (Dữ liệu thật) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-destructive" />
          <h2 className="text-2xl font-bold">Sân Khấu Hợp Tấu (Thịnh hành)</h2>
        </div>
        
        {isLoadingTrending ? (
          <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-destructive" /></div>
        ) : trendingJams.length === 0 ? (
          <div className="text-center p-6 bg-muted/20 border border-dashed rounded-xl text-muted-foreground">
            Chưa có phòng Jam nào hoàn thành.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingJams.map((jam) => (
              <Card
                key={jam.id}
                className="cursor-pointer hover:shadow-md transition-all group overflow-hidden border-border/50"
                onClick={() => window.location.href = `/jam-room?id=${jam.id}`}
              >
                <div className="h-24 bg-muted/30 flex items-center justify-center relative">
                  <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Play className="w-5 h-5 ml-1 text-primary" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex gap-2 mb-3">
                    {jam.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-semibold uppercase tracking-wider bg-secondary px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1 truncate" title={jam.title}>{jam.title}</h3>
                  <p className="text-sm text-muted-foreground">Tạo bởi: {jam.creator}</p>
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
        )}
      </section>

       {/* PHẦN 4: PHÒNG JAM ĐANG THIẾU NHẠC CỤ (Giữ nguyên mẫu hoặc code API tương tự) */}
       <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-2xl font-bold">Cộng đồng đang cần bạn</h2>
          </div>
          <a href="/lobby">
            <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
              Khám phá thêm <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
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