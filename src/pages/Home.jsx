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
  Loader2,
  Upload,
  UserPlus,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";

// Hàm tiện ích để hiển thị thời gian tương đối
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
  const [needsYouJams, setNeedsYouJams] = useState([]);
  const [communityStats, setCommunityStats] = useState(null);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [isLoadingNeedsYou, setIsLoadingNeedsYou] = useState(false);

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

  // Fetch dữ liệu
  useEffect(() => {
    const fetchRecentDrafts = async () => {
      setIsLoadingDrafts(true);
      try {
        const res = await fetch(getApiUrl(API_ENDPOINTS.JAMS_RECENT_DRAFTS), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

    const fetchNeedsYou = async () => {
      setIsLoadingNeedsYou(true);
      try {
        const res = await fetch(getApiUrl(API_ENDPOINTS.JAMS_NEEDS_YOU), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNeedsYouJams(data);
        }
      } catch (error) {
        console.error("Lỗi tải needs-you:", error);
      } finally {
        setIsLoadingNeedsYou(false);
      }
    };

    const fetchCommunityStats = async () => {
      try {
        const res = await fetch(getApiUrl(API_ENDPOINTS.JAMS_STATS));
        if (res.ok) {
          const data = await res.json();
          setCommunityStats(data);
        }
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      }
    };

    if (isLoggedIn) {
      fetchRecentDrafts();
      fetchNeedsYou();
    }
    fetchTrendingJams();
    fetchCommunityStats();
  }, [isLoggedIn]);

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

  // Steps cho section "Cách JamSheet hoạt động"
  const howItWorksSteps = [
    {
      icon: Upload,
      title: "Tải nhạc phổ lên",
      description: "Chọn bản nhạc yêu thích từ thư viện hoặc tải lên bản nhạc phổ của riêng bạn.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      icon: UserPlus,
      title: "Mời nhạc công tham gia",
      description: "Tạo phòng Jam, thiết lập các kệ nhạc cụ và chờ cộng đồng góp bản thu.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      icon: Layers,
      title: "Thu âm & hợp nhất",
      description: "Mỗi nhạc công thu âm phần của mình. Bàn Mixer sẽ ghép tất cả thành một bản phối hoàn chỉnh.",
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
    },
  ];

  return (
    <div className="flex flex-col space-y-10 pb-10 px-4 sm:px-0">
      {/* PHẦN 1: LỜI CHÀO */}
      <div className="shrink-0 relative overflow-hidden rounded-2xl sm:rounded-2xl bg-gradient-to-br from-primary/20 via-background border border-primary/10 to-background p-6 sm:p-10 shadow-2xl sm:shadow-lg mt-4 sm:mt-0">
        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {isLoggedIn
              ? `Chào buổi tối, ${user.username}! 🌙`
              : "Chào mừng đến với JamSheet! 🎵"}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            {isLoggedIn
              ? "Sẵn sàng để hòa âm chưa? Hôm nay bạn muốn bắt đầu một dự án mới hay đóng góp vào các phòng Jam của cộng đồng?"
              : "Nơi các nhạc công gặp nhau, cùng thu âm từ xa và tạo ra những bản phối tuyệt vời. Tham gia cộng đồng không giới hạn ngay hôm nay!"}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
            {isLoggedIn ? (
              <a href="/sheets-library" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto gap-2 h-12 sm:h-10 px-6 shadow-2xl sm:shadow-lg shadow-primary/25 rounded-xl sm:rounded-md text-base sm:text-sm font-semibold">
                  <PlusCircle className="w-5 h-5" /> Tạo phòng Jam mới
                </Button>
              </a>
            ) : (
              <>
                <a href="/login" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto gap-2 h-12 sm:h-10 px-8 shadow-2xl sm:shadow-lg shadow-primary/25 rounded-xl sm:rounded-md text-base sm:text-sm font-semibold">
                    Đăng nhập
                  </Button>
                </a>
                <a href="/register" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto gap-2 h-12 sm:h-10 px-8 bg-background/50 backdrop-blur-sm rounded-xl sm:rounded-md text-base sm:text-sm font-semibold"
                  >
                    Tạo tài khoản ngay
                  </Button>
                </a>
              </>
            )}
          </div>

          {/* SỐ LIỆU CỘNG ĐỒNG */}
          {!isLoggedIn && communityStats && (
            <div className="pt-6 flex flex-wrap gap-6 sm:gap-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{communityStats.totalMusicians}+</p>
                  <p className="text-xs text-muted-foreground">Nhạc công</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Mic2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{communityStats.totalRecords}+</p>
                  <p className="text-xs text-muted-foreground">Bản thu</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Music className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{communityStats.totalRooms}+</p>
                  <p className="text-xs text-muted-foreground">Phòng Jam</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <CurrentDecorativeIcon
          key={iconIndex}
          className="absolute -right-10 -bottom-10 w-48 h-48 sm:w-64 sm:h-64 text-primary/5 rotate-12 shrink-0 animate-in fade-in duration-1000 zoom-in-95"
        />
      </div>

      {/* PHẦN 1.5: CÁCH JAMSHEET HOẠT ĐỘNG (chỉ cho khách) */}
      {!isLoggedIn && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">
              Cách JamSheet hoạt động
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {howItWorksSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <Card
                  key={index}
                  className={`relative overflow-hidden border ${step.borderColor} bg-card/50 rounded-2xl sm:rounded-xl shadow-xl sm:shadow-sm hover:shadow-lg transition-all duration-300 group`}
                >
                  <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
                    {/* Số thứ tự */}
                    <div className="absolute top-3 right-4 text-6xl sm:text-7xl font-black text-muted/10 select-none leading-none">
                      {index + 1}
                    </div>

                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${step.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <StepIcon className={`w-7 h-7 sm:w-8 sm:h-8 ${step.color}`} />
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* PHẦN 2: TIẾP TỤC CÔNG VIỆC */}
      {isLoggedIn && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold">
                Tiếp tục công việc
              </h2>
            </div>
            <a href="/jam-room">
              <Button
                variant="ghost"
                className="h-10 px-3 sm:px-4 text-xs sm:text-sm text-muted-foreground hover:text-foreground rounded-xl sm:rounded-md"
              >
                Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </div>

          {isLoadingDrafts ? (
            <div className="flex justify-center p-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center p-6 bg-muted/20 border border-dashed rounded-2xl sm:rounded-xl text-muted-foreground">
              Bạn không có dự án nào đang dang dở.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentProjects.map((project) => (
                <Card
                  key={project.draftId}
                  className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50 rounded-2xl sm:rounded-xl shadow-xl sm:shadow-sm"
                  onClick={() =>
                    // FIX: Chỉ điều hướng đến phòng thu, không kèm draftId
                    // để tránh tự động mở modal thu âm và bỏ qua kiểm tra frozen
                    (window.location.href = `/jam-room?id=${project.id}`)
                  }
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Play className="w-5 h-5 ml-1 text-foreground" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3
                        className="font-bold truncate text-base sm:text-lg"
                        title={project.title}
                      >
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Kệ của bạn: {project.role}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${project.progress || 0}%` }}
                          ></div>
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

      {/* PHẦN 3: SÂN KHẤU THỊNH HÀNH */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-destructive" />
          <h2 className="text-xl sm:text-2xl font-bold">
            Sân Khấu Hợp Tấu (Thịnh hành)
          </h2>
        </div>

        {isLoadingTrending ? (
          <div className="flex justify-center p-6">
            <Loader2 className="w-6 h-6 animate-spin text-destructive" />
          </div>
        ) : trendingJams.length === 0 ? (
          <div className="text-center p-6 bg-muted/20 border border-dashed rounded-2xl sm:rounded-xl text-muted-foreground">
            Chưa có phòng Jam nào hoàn thành.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {trendingJams.map((jam) => (
              <Card
                key={jam.id}
                className="cursor-pointer hover:shadow-md transition-all group overflow-hidden border-border/50 rounded-2xl sm:rounded-xl shadow-xl sm:shadow-sm"
                onClick={() =>
                  (window.location.href = `/jam-room?id=${jam.id}`)
                }
              >
                <div className="h-24 bg-muted/30 flex items-center justify-center relative">
                  <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Play className="w-5 h-5 ml-1 text-primary" />
                  </div>
                  {/* Badge cho khách chưa đăng nhập */}
                  {!isLoggedIn && (
                    <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-[10px] sm:text-xs font-medium text-muted-foreground px-2 py-1 rounded-md border border-border/50">
                      👀 Xem trước
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {jam.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider bg-secondary px-2 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3
                    className="font-bold text-lg leading-tight mb-1 truncate"
                    title={jam.title}
                  >
                    {jam.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tạo bởi: {jam.creator}
                  </p>
                </CardContent>
                <CardFooter className="px-4 py-3 border-t border-border/50 bg-muted/10 flex justify-between text-xs sm:text-sm text-muted-foreground">
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

      {/* PHẦN 4: PHÒNG JAM ĐANG THIẾU NHẠC CỤ (DỮ LIỆU THẬT) */}
      {isLoggedIn && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl sm:text-2xl font-bold">
                Cộng đồng đang cần bạn
              </h2>
            </div>
            <a href="/lobby">
              <Button
                variant="ghost"
                className="h-10 px-3 sm:px-4 text-xs sm:text-sm text-muted-foreground hover:text-foreground rounded-xl sm:rounded-md"
              >
                Khám phá thêm <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </div>

          {isLoadingNeedsYou ? (
            <div className="flex justify-center p-6">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : needsYouJams.length === 0 ? (
            <div className="text-center p-6 bg-muted/20 border border-dashed rounded-2xl sm:rounded-xl text-muted-foreground">
              {user?.instruments?.length > 0
                ? "Hiện không có phòng Jam nào phù hợp với nhạc cụ của bạn."
                : (
                  <span>
                    Hãy{" "}
                    <a href="/profile" className="text-primary hover:underline font-semibold">
                      thiết lập nhạc cụ trong Profile
                    </a>{" "}
                    để chúng tôi gợi ý phòng Jam phù hợp cho bạn.
                  </span>
                )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {needsYouJams.map((jam) => (
                <Card
                  key={jam.id}
                  className="cursor-pointer border-dashed border-2 hover:border-emerald-500/60 hover:bg-card/80 transition-all bg-card/30 rounded-2xl sm:rounded-xl shadow-xl sm:shadow-sm"
                  onClick={() =>
                    (window.location.href = `/jam-room?id=${jam.id}`)
                  }
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base leading-tight">
                        {jam.title}
                      </h3>
                      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full whitespace-nowrap ml-2 shrink-0">
                        {jam.track_count}/{jam.total_slots} bản thu
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Host: {jam.creator}
                    </p>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-xs sm:text-sm mb-2 font-medium">
                      Đang tìm kiếm:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {jam.missing_instruments.map((inst) => {
                        const isMatch = jam.matching_instruments.includes(inst);
                        return (
                          <span
                            key={inst}
                            className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 border ${
                              isMatch
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : "bg-muted/50 text-muted-foreground border-border"
                            }`}
                          >
                            <Disc className="w-3 h-3" />
                            {inst}
                            {isMatch && (
                              <span className="text-[8px] font-bold uppercase bg-emerald-500 text-white px-1 py-0.5 rounded">
                                Bạn
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-12 sm:h-10 text-base sm:text-sm rounded-xl sm:rounded-md font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/jam-room?id=${jam.id}`;
                      }}
                    >
                      <Mic2 className="w-4 h-4" />
                      Vào Jam ngay
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
