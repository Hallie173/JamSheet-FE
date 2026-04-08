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

export default function MixerBoard() {
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
  } = useJamStore();

  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [trackDurations, setTrackDurations] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [recordingTrack, setRecordingTrack] = useState(null);
  const [initialDraft, setInitialDraft] = useState(null);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const trackGainsRef = useRef({});
  const sourcesRef = useRef({});
  const buffersRef = useRef({});
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);
  const maxAudioDurationRef = useRef(15);

  const activeTrackIds = currentTracks
    .filter((t) => t.activeRecordId)
    .map((t) => t.id);
  const activeDurations = activeTrackIds.map((id) => trackDurations[id] || 0);
  const maxAudioDuration = Math.max(15, ...activeDurations);

  useEffect(() => {
    maxAudioDurationRef.current = maxAudioDuration;
  }, [maxAudioDuration]);

  // LOGIC TỰ ĐỘNG BẬT BẢN NHÁP
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const draftId = params.get("draftId");
    if (draftId) {
      const fetchDraftData = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/jams/tracks/${draftId}`,
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
          if (currentTime >= maxAudioDurationRef.current) {
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
    <div className="flex flex-col h-full bg-background border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="h-20 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3 w-80">
          <div className="w-10 h-10 rounded-md bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
            <Mic2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col w-full overflow-hidden">
            <h2 className="font-bold leading-tight truncate text-foreground">
              {activeRoom.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              BPM: {activeRoom.tempo} • {activeRoom.timeSignature}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStop}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className={`w-11 h-11 rounded-full shadow-lg shadow-primary/20 ${!hasAnyAudio && !isPlaying ? "opacity-50" : ""}`}
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
              className="text-muted-foreground hover:text-foreground"
            >
              <Square className="w-4 h-4 fill-current" />
            </Button>
          </div>
          <div className="text-xs font-mono font-medium text-muted-foreground mt-1.5 tracking-wider">
            {formatTime(playbackTime)} / {formatTime(maxAudioDuration)}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 w-80">
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
          <Button
            variant="default"
            size="sm"
            className="gap-2 shadow-md shadow-primary/20"
            onClick={handleSaveMix}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}{" "}
            Lưu Mix
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-72 border-r border-border bg-background flex flex-col z-10 overflow-y-auto shrink-0 shadow-[4px_0_15px_rgba(0,0,0,0.1)]">
          <div className="h-8 border-b border-border flex items-center px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40 sticky top-0 z-10">
            Các Kệ Nhạc Cụ
          </div>
          <div className="flex flex-col gap-3 p-3">
            {currentTracks.map((track) => (
              <Card
                key={track.id}
                className="h-28 flex flex-col p-0 rounded-lg overflow-hidden border-border bg-card shadow hover:shadow-md transition-all relative group"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg z-10"
                  style={{ backgroundColor: track.waveColor }}
                />
                <div className="flex flex-col h-full p-3 pl-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Avatar className="w-7 h-7 border border-border/50 shadow-inner">
                        {track.avatar ? (
                          <AvatarImage src={track.avatar} />
                        ) : (
                          <AvatarFallback className="bg-muted text-[10px]">
                            ?
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-sm truncate leading-tight">
                          {track.instrument}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {track.user}
                        </span>
                      </div>
                    </div>
                    <div
                      className="absolute top-2 right-2 z-40 flex items-center justify-end bg-white/80 dark:bg-white/20 backdrop-blur-md border border-black/10 dark:border-white/20 hover:bg-foreground hover:text-background rounded-full h-8 w-8 overflow-hidden transition-all duration-300 hover:w-[110px] hover:bg-white dark:hover:bg-white hover:text-black cursor-pointer shadow-md group/add"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPlaying) handleStop();
                        setRecordingTrack(track);
                      }}
                    >
                      <span className="text-xs font-semibold whitespace-nowrap opacity-0 group-hover/add:opacity-100 transition-opacity duration-300">
                        Bản thu mới
                      </span>
                      <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center gap-2.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-7 px-2.5 flex gap-1.5 transition-colors ${track.records.length > 0 ? "text-primary border-primary/50 bg-primary/10" : "text-muted-foreground"}`}
                          disabled={track.records.length === 0}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold">
                            {track.records.length}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="right"
                        align="start"
                        className="w-56 ml-3 shadow-xl"
                      >
                        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                          Chọn bản thu
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {track.records.map((record) => (
                          <DropdownMenuItem
                            key={record.id}
                            onSelect={(e) => {
                              e.preventDefault();
                              if (isPlaying) handleStop();
                              changeActiveRecord(track.id, record.id);
                            }}
                            className={`cursor-pointer flex justify-between py-2 ${track.activeRecordId === record.id ? "bg-primary/10 text-primary" : ""}`}
                          >
                            <span className="text-sm font-medium truncate pr-4">
                              {record.name}
                            </span>
                            {track.activeRecordId === record.id && (
                              <Check className="w-4 h-4 text-primary shrink-0" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex-1 px-1 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-foreground/70 shrink-0" />
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
            <div className="pt-1">
              <Button variant="outline" className="w-full border-dashed">
                <Plus className="w-4 h-4 mr-1" /> Thêm kệ nhạc cụ
              </Button>
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
                  className="absolute border-l border-border/50 h-3 text-[10px] text-muted-foreground pl-1 select-none"
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
                    className="h-28 border-b border-border/50 relative group bg-[url('/grid.svg')] bg-center pointer-events-none"
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
                        className="absolute inset-2 border-2 border-dashed border-muted flex items-center justify-center rounded-md bg-muted/10 text-muted-foreground text-sm font-medium pointer-events-auto transition-colors hover:border-border hover:bg-muted/20 cursor-pointer z-30"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPlaying) handleStop();
                          setRecordingTrack(track);
                        }}
                      >
                        + Nhấp để nộp bản thu {track.instrument}
                      </div>
                    )}
                  </div>
                );
              })}
              <div
                className="absolute top-0 bottom-0 w-px bg-primary z-20 shadow-[0_0_15px_rgba(255,255,255,0.7)] pointer-events-none"
                style={{ left: `${(playbackTime / maxAudioDuration) * 100}%` }}
              >
                <div className="absolute -top-3 -left-2.5 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[14px] border-transparent border-t-primary shadow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {recordingTrack && (
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
