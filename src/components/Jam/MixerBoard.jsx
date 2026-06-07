import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  Download,
  Mic2,
  Volume2,
  Plus,
  Layers,
  Check,
  Loader2,
  X,
  Heart,
  AlertTriangle,
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
import { Card } from "@/components/ui/card";
import { useJamStore } from "@/store/useJamStore";
import RealWaveform from "@/components/RealWaveform";
import RecordingModal from "./RecordingModal";

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).userId;
  } catch (e) {
    return null;
  }
};

export default function MixerBoard({ isGuest = false }) {
  const currentUserId = getUserIdFromToken();
  const {
    activeRoom,
    currentTracks,
    isPlaying,
    masterVolume,
    isLoadingRoom,
    errorMsg,
    togglePlay,
    changeActiveRecord,
    setMasterVolume,
    setTrackVolume,
    saveMixToCloud,
    addNewTrack,
    toggleLikeRecord,
  } = useJamStore();

  const isArchived = activeRoom?.status === "archived";

  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [trackDurations, setTrackDurations] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [recordingTrack, setRecordingTrack] = useState(null);
  const [initialDraft, setInitialDraft] = useState(null);

  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [newInstrumentName, setNewInstrumentName] = useState("");

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const trackGainsRef = useRef({});
  const sourcesRef = useRef({});
  const buffersRef = useRef({});
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);
  const maxAudioDurationRef = useRef(15);
  const actualAudioDurationRef = useRef(0);

  const activeTrackIds = currentTracks
    .filter((t) => t.activeRecordId)
    .map((t) => t.id);
  const activeDurations = activeTrackIds.map((id) => trackDurations[id] || 0);
  const actualAudioDuration =
    activeDurations.length > 0 ? Math.max(...activeDurations) : 0;
  const maxAudioDuration = Math.max(15, ...activeDurations);

  useEffect(() => {
    maxAudioDurationRef.current = maxAudioDuration;
    actualAudioDurationRef.current = actualAudioDuration;
  }, [maxAudioDuration, actualAudioDuration]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const draftId = params.get("draftId");
    if (draftId) {
      const fetchDraftData = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jams/tracks/${draftId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
          const data = await response.json();
          if (response.ok) {
            setInitialDraft(data);
            setRecordingTrack({
              instrument: data.instrument,
              id: `draft_re-edit_${data._id}`,
            });
          }
        } catch (error) {
          console.error("Lỗi tải bản nháp:", error);
        }
      };
      fetchDraftData();
    }
  }, []);

  const handleCloseModal = () => {
    setRecordingTrack(null);
    setInitialDraft(null);
    if (activeRoom) {
      const cleanUrl =
        window.location.origin +
        window.location.pathname +
        `?id=${activeRoom.id}`;
      window.history.replaceState({}, "", cleanUrl);
    }
  };

  const handleDurationLoad = (trackId, duration) => {
    setTrackDurations((prev) => ({ ...prev, [trackId]: duration }));
  };

  const initAudioEngine = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    masterGainRef.current.gain.value = masterVolume / 100;
  };

  const loadTrackAudio = async (track) => {
    const activeRecordId = track.activeRecordId;
    if (!activeRecordId) return null;
    const record = track.records.find((r) => r.id === activeRecordId);
    if (!record || !record.audioUrl) return null;
    if (buffersRef.current[activeRecordId])
      return buffersRef.current[activeRecordId];
    try {
      const response = await fetch(record.audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer =
        await audioCtxRef.current.decodeAudioData(arrayBuffer);
      buffersRef.current[activeRecordId] = audioBuffer;
      return audioBuffer;
    } catch (error) {
      console.error("Lỗi tải audio:", error);
      return null;
    }
  };

  useEffect(() => {
    let isCancelled = false;
    const handlePlayback = async () => {
      if (isPlaying) {
        setIsLoadingAudio(true);
        initAudioEngine();
        if (audioCtxRef.current.state === "suspended")
          await audioCtxRef.current.resume();
        const loadPromises = currentTracks.map((track) =>
          loadTrackAudio(track),
        );
        await Promise.all(loadPromises);
        if (isCancelled) return;

        currentTracks.forEach((track) => {
          const activeRecordId = track.activeRecordId;
          const buffer = buffersRef.current[activeRecordId];
          if (buffer && playbackTime < buffer.duration) {
            if (!trackGainsRef.current[track.id]) {
              trackGainsRef.current[track.id] =
                audioCtxRef.current.createGain();
              trackGainsRef.current[track.id].connect(masterGainRef.current);
            }
            trackGainsRef.current[track.id].gain.value = track.volume / 100;
            const source = audioCtxRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(trackGainsRef.current[track.id]);
            source.start(0, playbackTime);
            sourcesRef.current[track.id] = source;
          }
        });

        setIsLoadingAudio(false);
        startTimeRef.current = audioCtxRef.current.currentTime - playbackTime;

        const updateTime = () => {
          if (isCancelled) return;
          const currentTime =
            audioCtxRef.current.currentTime - startTimeRef.current;

          const targetStopTime =
            actualAudioDurationRef.current > 0
              ? actualAudioDurationRef.current
              : maxAudioDurationRef.current;
          if (currentTime >= targetStopTime) {
            setPlaybackTime(0);
            togglePlay();
            return;
          }
          setPlaybackTime(currentTime);
          animationRef.current = requestAnimationFrame(updateTime);
        };
        animationRef.current = requestAnimationFrame(updateTime);
      } else {
        setIsLoadingAudio(false);
        Object.values(sourcesRef.current).forEach((source) => {
          try {
            source.stop();
          } catch (e) {
            console.log("Error stopping source:", e);
          }
        });
        sourcesRef.current = {};
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      }
    };
    handlePlayback();
    return () => {
      isCancelled = true;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (masterGainRef.current)
      masterGainRef.current.gain.value = masterVolume / 100;
  }, [masterVolume]);

  useEffect(() => {
    currentTracks.forEach((track) => {
      if (trackGainsRef.current[track.id])
        trackGainsRef.current[track.id].gain.value = track.volume / 100;
    });
  }, [currentTracks]);

  const handleStop = () => {
    if (isPlaying) togglePlay();
    setPlaybackTime(0);
  };

  const handleTimelineClick = (e) => {
    if (isLoadingAudio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * maxAudioDuration;
    setPlaybackTime(newTime);

    if (isPlaying && audioCtxRef.current) {
      Object.values(sourcesRef.current).forEach((source) => {
        try {
          source.stop();
        } catch (e) {
          console.log("Error stopping source:", e);
        }
      });
      sourcesRef.current = {};
      startTimeRef.current = audioCtxRef.current.currentTime - newTime;
      currentTracks.forEach((track) => {
        const buffer = buffersRef.current[track.activeRecordId];
        if (buffer && newTime < buffer.duration) {
          const source = audioCtxRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(trackGainsRef.current[track.id]);
          source.start(0, newTime);
          sourcesRef.current[track.id] = source;
        }
      });
    }
  };

  const handleAddNewTrack = () => {
    if (!newInstrumentName.trim()) return;
    addNewTrack(newInstrumentName.trim());
    setNewInstrumentName("");
    setIsAddingTrack(false);

    if (activeRoom?.id) {
      setTimeout(() => {
        saveMixToCloud(activeRoom.id);
      }, 100);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const hasAnyAudio = currentTracks.some(
    (track) =>
      track.records.find((r) => r.id === track.activeRecordId)?.audioUrl,
  );

  const handleSaveMix = async () => {
    if (!activeRoom?.id) return;
    setIsSaving(true);
    const result = await saveMixToCloud(activeRoom.id);
    setIsSaving(false);
    if (result.success) alert("Đã lưu cấu hình bản Mix thành công!");
    else alert("Lỗi: " + result.message);
  };

  if (isLoadingRoom)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  if (errorMsg)
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <X className="w-16 h-16 text-destructive" />
        <h3 className="text-xl font-bold">Lỗi</h3>
        <p>{errorMsg}</p>
      </div>
    );
  if (!activeRoom) return null;

  const VIEWPORT_MAX_SECONDS = 60;
  const viewportSeconds = Math.min(VIEWPORT_MAX_SECONDS, maxAudioDuration);
  const containerWidthPercent = (maxAudioDuration / viewportSeconds) * 100;
  const markersCount = Math.ceil(maxAudioDuration / 5) + 1;
  const markers = Array.from({ length: markersCount }, (_, i) => i * 5);

  return (
    <div className="flex flex-col h-full bg-background border-x-0 sm:border border-border sm:rounded-xl overflow-hidden shadow-sm">
      {/* HEADER MIXERBOARD */}
      <div className="h-auto sm:h-20 bg-card border-b border-border flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 shrink-0 py-3 sm:py-0 gap-3 sm:gap-0">
        <div className="flex items-center justify-between w-full sm:w-80">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
              <Mic2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <h2 className="font-bold leading-tight truncate text-foreground text-sm sm:text-base">
                {activeRoom.title}
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                BPM: {activeRoom.tempo} • {activeRoom.timeSignature}
              </p>
            </div>
          </div>
          {!isGuest && (
            <Button
              variant="default"
              size="sm"
              className="sm:hidden gap-1.5 shadow-md h-9 px-3 text-xs rounded-xl"
              onClick={handleSaveMix}
              disabled={isSaving || isArchived}
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Lưu Mix
            </Button>
          )}
        </div>

        <div className="flex flex-col items-center justify-center w-full sm:flex-1">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStop}
              className="text-muted-foreground hover:text-foreground w-10 h-10 sm:w-10 sm:h-10 rounded-full"
            >
              <SkipBack className="w-5 h-5 sm:w-5 sm:h-5 fill-current" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className={`w-12 h-12 sm:w-11 sm:h-11 rounded-full shadow-lg shadow-primary/20 ${!hasAnyAudio && !isPlaying ? "opacity-50" : ""}`}
              onClick={togglePlay}
              disabled={isLoadingAudio || (!hasAnyAudio && !isPlaying)}
            >
              {isLoadingAudio ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-1" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStop}
              className="text-muted-foreground hover:text-foreground w-10 h-10 sm:w-10 sm:h-10 rounded-full"
            >
              <Square className="w-4 h-4 sm:w-4 sm:h-4 fill-current" />
            </Button>
          </div>
          <div className="text-[10px] sm:text-xs font-mono font-medium text-muted-foreground mt-1 sm:mt-1.5 tracking-wider">
            {formatTime(playbackTime)} / {formatTime(maxAudioDuration)}
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-end gap-4 w-full sm:w-80">
          <div className="flex items-center gap-2 w-32">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[masterVolume]}
              max={100}
              step={1}
              onValueChange={(val) => setMasterVolume(val[0])}
              className="w-full"
            />
          </div>
          {!isGuest && (
            <Button
              variant="default"
              size="sm"
              className="gap-2 shadow-md shadow-primary/20 h-10 rounded-md"
              onClick={handleSaveMix}
              disabled={isSaving || isArchived}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Lưu Mix
            </Button>
          )}
        </div>
      </div>

      {isArchived && (
        <div className="bg-amber-500/10 border-y border-amber-500/30 px-4 sm:px-6 py-2 flex items-center justify-center gap-2 sm:gap-3 shrink-0 z-20">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
          <p className="text-amber-500/90 text-[11px] sm:text-sm font-medium">
            <strong className="text-amber-500">Phòng thu đã đóng:</strong> Không
            thể thu âm thêm.
          </p>
        </div>
      )}

      {isGuest && (
        <div className="bg-primary/10 border-y border-primary/30 px-4 sm:px-6 py-2.5 flex items-center justify-center gap-2 sm:gap-3 shrink-0 z-20">
          <span className="text-primary text-[11px] sm:text-sm font-medium">
            🎧 Bạn đang xem ở chế độ khách —
          </span>
          <a
            href="/login"
            className="text-primary text-[11px] sm:text-sm font-bold hover:underline"
          >
            Đăng nhập để tham gia Jam
          </a>
        </div>
      )}
      {/* KHU VỰC MIXER (Track + Waveform) */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-40 sm:w-72 border-r border-border bg-background flex flex-col z-10 overflow-y-auto shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.05)] sm:shadow-[4px_0_15px_rgba(0,0,0,0.1)]">
          <div className="h-8 border-b border-border flex items-center px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40 sticky top-0 z-10">
            Kệ Nhạc Cụ
          </div>
          <div className="flex flex-col gap-2 sm:gap-3 p-2 sm:p-3">
            {currentTracks.map((track) => (
              <Card
                key={track.id}
                className="h-24 sm:h-28 flex flex-col p-0 rounded-lg sm:rounded-lg overflow-hidden border-border bg-card shadow hover:shadow-md transition-all relative group"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 sm:w-1 z-10"
                  style={{ backgroundColor: track.waveColor }}
                />
                <div className="flex flex-col h-full p-2 sm:p-3 pl-3 sm:pl-4">
                  <div className="flex items-start justify-between mb-1 sm:mb-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                      <Avatar className="w-6 h-6 sm:w-7 sm:h-7 border border-border/50 shadow-inner">
                        {track.avatar ? (
                          <AvatarImage src={track.avatar} />
                        ) : (
                          <AvatarFallback className="bg-muted text-[9px] sm:text-[10px]">
                            ?
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-xs sm:text-sm truncate leading-tight">
                          {track.instrument}
                        </span>
                        <span className="hidden sm:block text-[10px] text-muted-foreground truncate">
                          {track.user}
                        </span>
                      </div>
                    </div>

                    {!isArchived && !isGuest && (
                      <div
                        className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 z-40 flex items-center justify-end bg-white/80 dark:bg-white/20 backdrop-blur-md border border-black/10 dark:border-white/20 hover:bg-foreground hover:text-background rounded-full h-6 w-6 sm:h-8 sm:w-8 overflow-hidden transition-all duration-300 sm:hover:w-[110px] sm:hover:bg-white sm:dark:hover:bg-white sm:hover:text-black cursor-pointer shadow-md group/add"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPlaying) handleStop();
                          setRecordingTrack(track);
                        }}
                      >
                        <span className="hidden sm:block text-xs font-semibold whitespace-nowrap opacity-0 group-hover/add:opacity-100 transition-opacity duration-300">
                          Bản thu mới
                        </span>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex items-center gap-1.5 sm:gap-2.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-6 sm:h-7 px-1.5 sm:px-2.5 flex gap-1 sm:gap-1.5 transition-colors ${track.records.length > 0 ? "text-primary border-primary/50 bg-primary/10" : "text-muted-foreground"}`}
                          disabled={track.records.length === 0}
                        >
                          <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="text-[9px] sm:text-[10px] font-bold">
                            {track.records.length}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="right"
                        align="start"
                        className="w-48 sm:w-56 ml-3 shadow-xl rounded-xl sm:rounded-md"
                      >
                        <DropdownMenuLabel className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                          Chọn bản thu
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {(isGuest ? track.records.slice(-3) : track.records).map((record) => (
                          <DropdownMenuItem
                            key={record.id}
                            onSelect={(e) => {
                              e.preventDefault();
                              if (isPlaying) handleStop();
                              changeActiveRecord(track.id, record.id);
                            }}
                            className={`cursor-pointer flex justify-between py-2 sm:py-2 ${track.activeRecordId === record.id ? "bg-primary/10 text-primary" : ""}`}
                          >
                            <span className="text-xs sm:text-sm font-medium truncate pr-4">
                              {record.name}
                            </span>
                            {track.activeRecordId === record.id && (
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0" />
                            )}
                          </DropdownMenuItem>
                        ))}
                        {isGuest && track.records.length > 3 && (
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              window.location.href = "/login";
                            }}
                            className="cursor-pointer text-center py-2.5 text-primary hover:text-primary font-semibold justify-center border-t border-border/50 mt-1"
                          >
                            <span className="text-xs sm:text-sm">🔒 Đăng nhập để nghe đầy đủ</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {(() => {
                      const activeRecord = track.records.find(
                        (r) => r.id === track.activeRecordId,
                      );
                      const isLikedByMe =
                        activeRecord?.liked_by?.includes(currentUserId);
                      return activeRecord ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-6 sm:h-7 px-1 sm:px-2 flex gap-1 transition-colors ${
                            isLikedByMe
                              ? "text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              : "text-muted-foreground"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!currentUserId)
                              return alert("Vui lòng đăng nhập để thả tim!");
                            toggleLikeRecord(track.instrument, activeRecord.id);
                          }}
                        >
                          <Heart
                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLikedByMe ? "fill-current" : ""}`}
                          />
                          <span className="text-[9px] sm:text-[10px] font-bold">
                            {activeRecord.liked_by?.length || 0}
                          </span>
                        </Button>
                      ) : null;
                    })()}

                    <div className="flex-1 px-0.5 sm:px-1 flex items-center gap-1 sm:gap-2 hidden sm:flex">
                      <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-foreground/70 shrink-0" />
                      <Slider
                        value={[track.volume]}
                        max={100}
                        step={1}
                        onValueChange={(val) =>
                          setTrackVolume(track.id, val[0])
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <div className="pt-1 pb-4">
              {!isArchived && !isGuest &&
                (isAddingTrack ? (
                  <div className="flex flex-col gap-2 bg-muted/30 p-2 sm:p-2.5 rounded-lg border border-border shadow-inner animate-in fade-in zoom-in-95 duration-200">
                    <input
                      type="text"
                      placeholder="Tên nhạc cụ..."
                      className="w-full text-xs sm:text-sm font-medium bg-background border border-border rounded-md px-2 py-1.5 sm:px-2.5 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                      value={newInstrumentName}
                      onChange={(e) => setNewInstrumentName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddNewTrack();
                        if (e.key === "Escape") setIsAddingTrack(false);
                      }}
                    />
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-6 sm:h-7 text-[10px] sm:text-xs rounded-md"
                        onClick={() => setIsAddingTrack(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-6 sm:h-7 text-[10px] sm:text-xs rounded-md"
                        onClick={handleAddNewTrack}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-dashed hover:border-primary hover:text-primary transition-colors h-8 sm:h-10 text-[10px] sm:text-sm rounded-lg sm:rounded-md"
                    onClick={() => setIsAddingTrack(true)}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />{" "}
                    Thêm kệ
                  </Button>
                ))}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-background overflow-x-auto overflow-y-auto relative custom-scrollbar">
          <div
            className="h-full relative flex flex-col cursor-text min-w-full transition-all duration-300 ease-out"
            style={{ width: `${containerWidthPercent}%` }}
            onClick={handleTimelineClick}
          >
            <div className="h-8 border-b border-border bg-muted/40 flex items-end sticky top-0 z-10 w-full overflow-hidden">
              {markers.map((time) => (
                <div
                  key={time}
                  className="absolute border-l border-border/50 h-3 text-[9px] sm:text-[10px] text-muted-foreground pl-1 select-none"
                  style={{ left: `${(time / maxAudioDuration) * 100}%` }}
                >
                  {formatTime(time)}
                </div>
              ))}
            </div>
            <div className="relative flex-1 w-full">
              {currentTracks.map((track) => {
                const activeRecord = track.records.find(
                  (r) => r.id === track.activeRecordId,
                );
                return (
                  <div
                    key={track.id}
                    className="h-24 sm:h-28 border-b border-border/50 relative group bg-[url('/grid.svg')] bg-center pointer-events-none"
                  >
                    <div className="absolute w-full h-px bg-border/20 top-1/2 -translate-y-1/2"></div>
                    {activeRecord && activeRecord.audioUrl ? (
                      <RealWaveform
                        audioUrl={activeRecord.audioUrl}
                        color={track.waveColor}
                        playbackTime={playbackTime}
                        maxDuration={maxAudioDuration}
                        onDurationLoad={(dur) =>
                          handleDurationLoad(track.id, dur)
                        }
                      />
                    ) : (
                      <div
                        className={`absolute inset-2 border-2 border-dashed flex items-center justify-center rounded-md text-[10px] sm:text-sm font-medium z-30 ${isArchived ? "border-muted/30 bg-muted/5 text-muted-foreground/30 cursor-not-allowed" : "border-muted bg-muted/10 text-muted-foreground hover:border-border hover:bg-muted/20 cursor-pointer pointer-events-auto transition-colors"}`}
                        onClick={(e) => {
                          if (isArchived) return;
                          e.stopPropagation();
                          if (isPlaying) handleStop();
                          setRecordingTrack(track);
                        }}
                      >
                        {isArchived
                          ? "Đã đóng"
                          : `+ Nộp bản thu ${track.instrument}`}
                      </div>
                    )}
                  </div>
                );
              })}
              <div
                className="absolute top-0 bottom-0 w-px bg-primary z-20 shadow-[0_0_15px_rgba(255,255,255,0.7)] pointer-events-none"
                style={{ left: `${(playbackTime / maxAudioDuration) * 100}%` }}
              >
                <div className="absolute -top-3 -left-2.5 w-0 h-0 border-l-[8px] sm:border-l-[10px] border-r-[8px] sm:border-r-[10px] border-t-[12px] sm:border-t-[14px] border-transparent border-t-primary shadow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {recordingTrack && !isGuest && (
        <RecordingModal
          activeRoom={activeRoom}
          recordingTrack={recordingTrack}
          initialDraft={initialDraft}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
