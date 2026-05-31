import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Mic2,
  Square,
  Check,
  Sparkles,
  Loader2,
  UploadCloud,
  X,
  FileText,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useJamStore } from "@/store/useJamStore";
import RealWaveform from "@/components/RealWaveform";

const MetronomeWaveform = ({
  beatsPerMeasure,
  totalBeats,
  currentBeat,
  isPlaying,
}) => {
  const countInBeats = beatsPerMeasure * 2;

  const beats = useMemo(() => {
    return Array.from({ length: totalBeats }, (_, i) => {
      const beatNumber = i + 1;
      const isCountIn = beatNumber <= countInBeats;
      const isFirstBeatOfMeasure = (beatNumber - 1) % beatsPerMeasure === 0;
      return {
        id: beatNumber,
        isCountIn,
        isFirstBeatOfMeasure,
      };
    });
  }, [beatsPerMeasure, totalBeats, countInBeats]);

  return (
    <div className="w-full h-16 bg-muted/40 rounded-md border border-border/50 relative overflow-hidden flex items-end px-1 py-1 gap-px cursor-pointer">
      {beats.map((beat) => {
        const isActive = isPlaying && currentBeat === beat.id;

        const baseColor = beat.isCountIn
          ? "bg-orange-400/70 dark:bg-orange-500/60"
          : "bg-primary/70";
        const activeColor = beat.isCountIn
          ? "bg-orange-500 dark:bg-orange-400"
          : "bg-primary";
        const height = beat.isFirstBeatOfMeasure ? "h-full" : "h-3/5";
        const width = "flex-1";

        return (
          <div
            key={beat.id}
            className={`${width} ${height} ${isActive ? activeColor : baseColor} rounded-sm transition-all duration-100 relative group`}
          >
            {beat.id === countInBeats && (
              <div className="absolute right-0 top-0 bottom-0 w-px bg-foreground/50 z-10" />
            )}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded shadow-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
              {beat.isCountIn
                ? `Đếm: ${beat.id}`
                : `Nhịp: ${beat.id - countInBeats}`}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CustomPreviewPlayer = ({
  previewAudioUrl,
  activeRoom,
  syncOffset,
  setSyncOffset,
  useAiClean,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const metronomeRef = useRef(null);

  const scrollContainerRef = useRef(null);

  const tempo = activeRoom?.tempo || 120;
  const timeSignatureStr = activeRoom?.timeSignature || "4/4";
  const beatsPerMeasure = parseInt(timeSignatureStr.split("/")[0]) || 4;
  const secondsPerBeat = 60 / tempo;
  const countInBeats = beatsPerMeasure * 2;

  const totalBeatsToDisplay = countInBeats + Math.ceil(60 / secondsPerBeat);

  const PIXELS_PER_BEAT = 35;

  const stopPlayBack = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {
        console.warn("Nguồn âm thanh đã dừng hoặc không thể dừng:", e);
      }
      sourceRef.current = null;
    }
    if (metronomeRef.current) {
      cancelAnimationFrame(metronomeRef.current);
      metronomeRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      stopPlayBack();
      return;
    }

    setIsPlaying(true);
    setCurrentBeat(1);

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    try {
      const response = await fetch(previewAudioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      let nextNoteTime = audioCtx.currentTime + 0.1;
      let beatCounter = 0;

      const playClick = (time, isFirstBeat) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = isFirstBeat ? 880 : 440;
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
      };

      const scheduler = () => {
        while (nextNoteTime < audioCtx.currentTime + 0.1) {
          playClick(nextNoteTime, beatCounter % beatsPerMeasure === 0);
          beatCounter++;

          setTimeout(
            () => {
              setCurrentBeat(beatCounter);
            },
            (nextNoteTime - audioCtx.currentTime) * 1000,
          );

          nextNoteTime += secondsPerBeat;
        }
        metronomeRef.current = requestAnimationFrame(scheduler);
      };
      scheduler();

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      sourceRef.current = source;

      const offsetSeconds = syncOffset / 1000;
      const micStartDelayBeats = beatsPerMeasure;
      const startTime =
        audioCtx.currentTime + 0.1 + micStartDelayBeats * secondsPerBeat;

      if (offsetSeconds >= 0) {
        source.start(startTime + offsetSeconds);
      } else {
        const cutStart = Math.abs(offsetSeconds);
        source.start(startTime, cutStart);
      }

      source.onended = () => {
        stopPlayBack();
      };
    } catch (error) {
      console.error("Lỗi khi phát audio preview:", error);
      alert("Không thể phát bản thu! Vui lòng thử lại.");
      stopPlayBack();
    }
  };

  useEffect(() => {
    return () => stopPlayBack();
  }, []);

  useEffect(() => {
    if (isPlaying && scrollContainerRef.current && currentBeat > 0) {
      const container = scrollContainerRef.current;
      const playHeadX =
        (currentBeat / totalBeatsToDisplay) * container.scrollWidth;

      const visibleRightEdge = container.scrollLeft + container.clientWidth;

      if (playHeadX > visibleRightEdge - container.clientWidth * 0.3) {
        container.scrollTo({
          left: playHeadX - container.clientWidth * 0.3,
          behavior: "smooth",
        });
      }
    } else if (!isPlaying && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [currentBeat, isPlaying, totalBeatsToDisplay]);

  return (
    <div className="w-full flex flex-col gap-3">
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto pb-4 pt-1 custom-scrollbar border border-border/50 rounded-xl bg-card shadow-inner"
      >
        <div
          className="flex flex-col gap-5 relative px-3"
          style={{
            width: `max(100%, ${totalBeatsToDisplay * PIXELS_PER_BEAT}px)`,
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider pl-1">
              Metronome (Chuẩn nhịp)
            </Label>
            <div className="relative">
              <div className="absolute top-1 left-1 text-[9px] font-bold text-orange-500 bg-background/90 px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider z-20">
                Chuẩn bị
              </div>
              <div
                className="absolute top-1 text-[9px] font-bold text-primary bg-background/90 px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider z-20"
                style={{
                  left: `calc(${(countInBeats / totalBeatsToDisplay) * 100}% + 4px)`,
                }}
              >
                Chính thức
              </div>
              <MetronomeWaveform
                beatsPerMeasure={beatsPerMeasure}
                totalBeats={totalBeatsToDisplay}
                currentBeat={currentBeat}
                isPlaying={isPlaying}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider pl-1">
              Bản thu của bạn
            </Label>
            <div className="w-full h-16 bg-muted/20 rounded-md border border-border relative overflow-hidden">
              {previewAudioUrl ? (
                <div
                  className="absolute top-0 bottom-0 z-0 transition-all duration-100"
                  style={{
                    left: `calc(${(countInBeats / totalBeatsToDisplay) * 100}% + ${(syncOffset / 1000 / (totalBeatsToDisplay * secondsPerBeat)) * 100}%)`,
                    right: 0,
                  }}
                >
                  <RealWaveform
                    audioUrl={previewAudioUrl}
                    color="#3b82f6"
                    playbackTime={0}
                    maxDuration={
                      (totalBeatsToDisplay - countInBeats) * secondsPerBeat
                    }
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground opacity-50">
                  [ Đang xử lý sóng âm... ]
                </div>
              )}

              {isPlaying && currentBeat > countInBeats && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-primary z-20 shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
                  style={{
                    left: `calc(${(countInBeats / totalBeatsToDisplay) * 100}% + ${((currentBeat - countInBeats) / (totalBeatsToDisplay - countInBeats)) * (1 - countInBeats / totalBeatsToDisplay) * 100}%)`,
                  }}
                >
                  <div className="absolute -top-1 -left-1 w-2 h-2 rotate-45 bg-primary"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-background p-4 rounded-lg border border-border shadow-inner mt-2">
        <Button
          size="icon"
          variant={isPlaying ? "destructive" : "default"}
          className="w-12 h-12 rounded-full flex-shrink-0 shadow-md"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-1" />
          )}
        </Button>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-semibold px-1">
            <span className="text-emerald-500">Sớm hơn (-500ms)</span>
            <span className="text-primary font-mono text-sm bg-muted px-2 py-0.5 rounded">
              {syncOffset > 0 ? `+${syncOffset}` : syncOffset} ms
            </span>
            <span className="text-amber-500">Trễ hơn (+500ms)</span>
          </div>
          <Slider
            value={[syncOffset]}
            min={-500}
            max={500}
            step={10}
            onValueChange={(val) => setSyncOffset(val[0])}
            className="w-full"
          />
          <p className="text-[10px] text-muted-foreground text-center italic">
            *Kéo thanh trượt sao cho đỉnh sóng âm bản thu khớp với vạch
            Metronome
          </p>
        </div>
      </div>
    </div>
  );
};

export default function RecordingModal({
  activeRoom,
  recordingTrack,
  initialDraft,
  onClose,
}) {
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1);
  const [recordingStatus, setRecordingStatus] = useState("idle");
  const [countdownBeat, setCountDownBeat] = useState(0);
  const [previewAudioUrl, setPreviewAudioUrl] = useState(null);
  const [useAiClean, setUseAiClean] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false); // Trạng thái hiển thị Loading
  const [rawAudioBlob, setRawAudioBlob] = useState(null); // Giữ file âm thanh gốc
  const [cleanAudioBlob, setCleanAudioBlob] = useState(null);
  const [syncOffset, setSyncOffset] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [saveTargetStatus, setSaveTargetStatus] = useState("draft");
  const [customTrackName, setCustomTrackName] = useState("");

  const addRecordToTrack = useJamStore((state) => state.addRecordToTrack);

  const metronomeRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Auto-scroll refs
  const sheetContainerRef = useRef(null);
  const scrollAnimationRef = useRef(null);
  const lastScrollTime = useRef(0);
  const exactScrollTopRef = useRef(0);

  // Auto-scroll effect during recording
  useEffect(() => {
    if (recordingStatus === "recording") {
      lastScrollTime.current = performance.now();
      exactScrollTopRef.current = sheetContainerRef.current?.scrollTop || 0;

      const scroll = (time) => {
        const dt = (time - lastScrollTime.current) / 1000;
        lastScrollTime.current = time;

        if (sheetContainerRef.current) {
          const currentScroll = sheetContainerRef.current.scrollTop;

          // Sync with manual scroll
          if (Math.abs(currentScroll - exactScrollTopRef.current) > 2) {
            exactScrollTopRef.current = currentScroll;
          }

          // Accumulate decimal for smooth scroll at low speeds
          exactScrollTopRef.current += 40 * autoScrollSpeed * dt;
          sheetContainerRef.current.scrollTop = exactScrollTopRef.current;
        }
        scrollAnimationRef.current = requestAnimationFrame(scroll);
      };

      scrollAnimationRef.current = requestAnimationFrame(scroll);
    } else {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
        scrollAnimationRef.current = null;
      }
    }

    return () => {
      if (scrollAnimationRef.current)
        cancelAnimationFrame(scrollAnimationRef.current);
    };
  }, [recordingStatus, autoScrollSpeed]);

  // THÊM LOGIC ĐỔI ĐUÔI PDF SANG JPG CHO CLOUDINARY
  const timeSignatureStr = activeRoom?.timeSignature || "4/4";
  const beatsPerMeasure = parseInt(timeSignatureStr.split("/")[0]) || 4;

  useEffect(() => {
    if (initialDraft) {
      setPreviewAudioUrl(initialDraft.raw_audio_url);
      setRecordingStatus("preview");
      if (initialDraft.sync_offset_ms)
        setSyncOffset(initialDraft.sync_offset_ms);
    }
  }, [initialDraft]);

  const startRecordingFlow = async () => {
    if (!activeRoom || !recordingTrack) return;
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        //Lưu file gốc và reset các state của AI
        setRawAudioBlob(audioBlob);
        setCleanAudioBlob(null);
        setUseAiClean(false);

        //Load file gốc
        const audioUrl = URL.createObjectURL(audioBlob);
        setPreviewAudioUrl(audioUrl);
        setRecordingStatus("preview");
        setSyncOffset(0);
        stream.getTracks().forEach((track) => track.stop());
      };
    } catch (error) {
      alert(
        "Không thể truy cập Microphone! Vui lòng cấp quyền trong cài đặt trình duyệt.",
      );
      console.error(error);
      return;
    }

    setRecordingStatus("counting");
    setCountDownBeat(1);

    if (sheetContainerRef.current) {
      sheetContainerRef.current.scrollTop = 0;
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const tempo = activeRoom.tempo || 120;
    const secondsPerBeat = 60 / tempo;
    const countInBeats = beatsPerMeasure * 2;

    let currentBeat = 0;
    let nextNoteTime = audioCtx.currentTime + 0.1;

    const playClick = (time, isFirstBeatOfMeasure) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = isFirstBeatOfMeasure ? 880 : 440;
      gain.gain.setValueAtTime(1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      osc.start(time);
      osc.stop(time + 0.1);
    };

    const scheduler = () => {
      while (nextNoteTime < audioCtx.currentTime + 0.1) {
        playClick(nextNoteTime, currentBeat % beatsPerMeasure === 0);
        const beatNumber = currentBeat + 1;

        setTimeout(
          () => {
            setCountDownBeat(beatNumber);
            if (
              beatNumber === beatsPerMeasure + 1 &&
              mediaRecorderRef.current.state === "inactive"
            ) {
              mediaRecorderRef.current.start();
            }
            if (beatNumber === countInBeats + 1) {
              setRecordingStatus("recording");
            }
          },
          (nextNoteTime - audioCtx.currentTime) * 1000,
        );

        currentBeat++;
        nextNoteTime += secondsPerBeat;
      }
      metronomeRef.current = requestAnimationFrame(scheduler);
    };
    scheduler();
  };

  const stopRecordingFlow = () => {
    if (metronomeRef.current) cancelAnimationFrame(metronomeRef.current);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    } else {
      setRecordingStatus("idle");
      setCountDownBeat(0);
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    }
  };

  const handleToggleAI = async () => {
    // 1. Tắt AI
    if (useAiClean) {
      setUseAiClean(false);
      // Nếu có file gốc thì load file gốc, nếu là bản nháp thì load lại link nháp
      if (rawAudioBlob) {
        setPreviewAudioUrl(URL.createObjectURL(rawAudioBlob));
      } else if (initialDraft) {
        setPreviewAudioUrl(initialDraft.raw_audio_url);
      }
      return;
    }

    // 2. Bật AI: Lấy từ Cache nếu đã lọc rồi
    if (cleanAudioBlob) {
      setUseAiClean(true);
      setPreviewAudioUrl(URL.createObjectURL(cleanAudioBlob));
      return;
    }

    // 3. XỬ LÝ FILE ĐẦU VÀO
    let currentAudioBlob = rawAudioBlob;

    // NẾU LÀ BẢN NHÁP (Chưa có Blob vật lý): Tải file từ URL về trước
    if (!currentAudioBlob && initialDraft?.raw_audio_url) {
      setIsAiProcessing(true);
      try {
        const res = await fetch(initialDraft.raw_audio_url);
        currentAudioBlob = await res.blob();
        setRawAudioBlob(currentAudioBlob); // Lưu lại Blob để dùng cho lần sau
      } catch (error) {
        console.error("Lỗi khi tải file nháp:", error);
        alert("Không thể tải file nháp để xử lý AI. Vui lòng thử lại!");
        setIsAiProcessing(false);
        return;
      }
    }

    if (!currentAudioBlob) return;

    // 4. Bắn file sang Python để lọc
    setIsAiProcessing(true);
    try {
      const formData = new FormData();
      formData.append("audio", currentAudioBlob, "raw_record.webm");

      const response = await fetch(`${import.meta.env.VITE_AI_URL || "http://localhost:8000"}/api/clean-audio`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok)
        throw new Error("Lỗi khi xử lý AI: " + response.statusText);

      const processedBlob = await response.blob();
      setCleanAudioBlob(processedBlob);
      setPreviewAudioUrl(URL.createObjectURL(processedBlob));
      setUseAiClean(true);
    } catch (error) {
      console.error("Lỗi khi xử lý AI:", error);
      alert(
        "Không thể xử lý AI! Vui lòng thử lại hoặc kiểm tra server AI. " +
          error.message,
      );
      setUseAiClean(false);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const cancelPreview = () => {
    setPreviewAudioUrl(null);
    setRecordingStatus("idle");
    setCountDownBeat(0);
    audioChunksRef.current = [];
  };

  const executeSaveTrack = async () => {
    setIsUploading(true);
    setIsNameModalOpen(false);
    try {
      let finalAudioUrl = null;
      let blobToSave = useAiClean ? cleanAudioBlob : rawAudioBlob;

      // 1. NẾU CÓ FILE MỚI -> BẮN THẲNG LÊN CLOUDINARY
      if (blobToSave) {
        const formDataCloud = new FormData();
        const fileExtension = useAiClean ? "wav" : "webm";
        const file = new File([blobToSave], `record.${fileExtension}`, {
          type: blobToSave.type || (useAiClean ? "audio/wav" : "audio/webm"),
        });
        
        formDataCloud.append("file", file);
        formDataCloud.append("upload_preset", "jamsheet_preset");
        formDataCloud.append("folder", "jamroom_audio");

        // Cloudinary dùng endpoint 'video' cho các file âm thanh (audio)
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/dfwrrelbq/video/upload`, {
          method: "POST",
          body: formDataCloud,
        });
        const cloudData = await cloudRes.json();
        if (!cloudRes.ok) throw new Error(cloudData.error.message);
        
        finalAudioUrl = cloudData.secure_url;
      }

      // 2. GÓI DỮ LIỆU THÀNH JSON GỬI VỀ BACKEND
      const finalName = customTrackName.trim() || (saveTargetStatus === "published" ? `Take ${recordingTrack.instrument}` : "Bản nháp");
      
      const payload = {
        instrument: recordingTrack.instrument,
        status: saveTargetStatus,
        name: finalName,
        sync_offset_ms: syncOffset,
        use_ai_clean: useAiClean,
      };
      
      // Nếu có URL âm thanh mới thì thêm vào JSON
      if (finalAudioUrl) {
        payload.raw_audio_url = finalAudioUrl;
      }

      const params = new URLSearchParams(window.location.search);
      const draftId = params.get("draftId");
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const url = draftId
        ? `${baseUrl}/api/jams/tracks/${draftId}`
        : `${baseUrl}/api/jams/${activeRoom.id}/tracks`;

      // API Backend giờ đây chỉ nhận JSON siêu nhẹ
      const response = await fetch(url, {
        method: draftId ? "PUT" : "POST",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi không xác định");

      if (saveTargetStatus === "published") {
        addRecordToTrack(recordingTrack.instrument, {
          id: data.track._id,
          name: data.track.name,
          audioUrl: data.track.raw_audio_url,
          syncOffset: data.track.sync_offset_ms || 0,
        });
        alert("Đã nộp bản thu vào Bàn Mixer!");
      } else {
        alert(
          draftId
            ? "Đã cập nhật bản nháp thành công!"
            : "Đã lưu bản nháp thành công!",
        );
      }

      handleClose();
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const openNameModal = (status) => {
    setSaveTargetStatus(status);
    setCustomTrackName(
      status === "published" ? `Take ${recordingTrack.instrument}` : "Bản nháp",
    );
    setIsNameModalOpen(true);
  };

  const handleClose = () => {
    stopRecordingFlow();
    cancelPreview();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
      <div className="flex-1 border-r border-border p-4 flex flex-col h-full relative bg-muted/30">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Nhạc phổ
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Label>Tốc độ cuộn:</Label>
            <Slider
              value={[autoScrollSpeed]}
              max={2}
              min={0.1}
              step={0.1}
              onValueChange={(val) => setAutoScrollSpeed(val[0])}
              className="w-24 cursor-pointer"
            />
            <span className="w-8 font-mono font-medium">
              {autoScrollSpeed}x
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white rounded-md shadow-inner border border-border/50 overflow-hidden relative">
          <div
            ref={sheetContainerRef}
            className="flex-1 h-full bg-white rounded-md shadow-inner border border-border/50 overflow-y-auto custom-scrollbar relative p-4"
          >
            {activeRoom?.sheetUrls && activeRoom.sheetUrls.length > 0 ? (
              <div className="flex flex-col gap-4">
                {activeRoom.sheetUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Page ${index + 1}`}
                    className="w-full h-auto shadow-sm border border-muted pointer-events-none select-none"
                  />
                ))}
              </div>
            ) : activeRoom?.sheetUrl ? (
              activeRoom.sheetUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={activeRoom.sheetUrl}
                  title="Sheet Music PDF"
                  className="w-full h-full rounded-md"
                />
              ) : (
                <img
                  src={activeRoom.sheetUrl}
                  alt="Sheet Music"
                  className="w-full h-auto object-contain pointer-events-none"
                />
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground flex-col gap-2">
                <FileText className="w-12 h-12 opacity-20" />
                <span>Không tìm thấy dữ liệu nhạc phổ</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-1/2 lg:w-2/5 p-6 flex flex-col h-full bg-card shadow-2xl relative overflow-y-auto custom-scrollbar">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 rounded-full hover:bg-destructive/10 hover:text-destructive z-10"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="mb-6 mt-2 shrink-0">
          <h2 className="text-2xl font-bold">Phòng Thu</h2>
          <p className="text-muted-foreground mt-1">
            Đang thu cho kệ:{" "}
            <strong className="text-foreground">
              {recordingTrack.instrument}
            </strong>
          </p>
        </div>

        <div
          className={`border rounded-xl p-6 flex flex-col items-center mb-6 flex-1 transition-colors duration-500 ${recordingStatus === "recording" ? "bg-red-500/10 border-red-500/50" : "bg-muted/40 border-border"}`}
        >
          {recordingStatus === "preview" ? (
            <div className="w-full flex flex-col items-center gap-6 flex-1">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2 shrink-0">
                <Check className="w-6 h-6" /> Thu âm hoàn tất!
              </h3>

              <div className="w-full flex-1 flex items-center justify-center">
                <CustomPreviewPlayer
                  previewAudioUrl={previewAudioUrl}
                  activeRoom={activeRoom}
                  syncOffset={syncOffset}
                  setSyncOffset={setSyncOffset}
                  useAiClean={useAiClean}
                />
              </div>

              {(rawAudioBlob || initialDraft) && (
                <div
                  className={`flex items-center gap-3 bg-background p-3 rounded-lg border w-full max-w-sm shadow-sm transition-all shrink-0 ${
                    isAiProcessing
                      ? "border-primary/50 opacity-70 cursor-wait bg-primary/5"
                      : "border-border cursor-pointer hover:border-primary/50"
                  }`}
                  onClick={() => !isAiProcessing && handleToggleAI()}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border ${
                      useAiClean
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isAiProcessing ? (
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    ) : (
                      useAiClean && <Check className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      {isAiProcessing
                        ? "AI đang dọn dẹp âm thanh..."
                        : "Dùng AI lọc tạp âm"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isAiProcessing
                        ? "Vui lòng chờ khoảng 2-5 giây"
                        : "Loại bỏ tiếng ồn nền, tiếng quạt gió..."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="text-center mb-6 h-32 flex flex-col justify-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Trạng thái Metronome
                </p>
                <div className="text-6xl font-black text-primary font-mono tracking-tighter">
                  {recordingStatus === "idle" && "SẴN SÀNG"}
                  {recordingStatus === "counting" && (
                    <div className="flex flex-col items-center">
                      <span
                        className={
                          countdownBeat % beatsPerMeasure === 1
                            ? "text-destructive scale-110 transition-transform"
                            : ""
                        }
                      >
                        {countdownBeat > beatsPerMeasure
                          ? countdownBeat - beatsPerMeasure
                          : countdownBeat}
                      </span>
                    </div>
                  )}
                  {recordingStatus === "recording" && (
                    <span className="text-red-500 flex items-center gap-4 animate-pulse">
                      <div className="w-6 h-6 rounded-full bg-red-500"></div>{" "}
                      ĐANG THU
                    </span>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground font-medium text-center max-w-sm h-12">
                {recordingStatus === "idle" && (
                  <>
                    Nhịp độ là <strong>{activeRoom?.tempo} BPM</strong>. Hệ
                    thống sẽ đếm <strong>2 ô nhịp</strong> chuẩn bị trước khi
                    ghi âm.
                  </>
                )}
                {recordingStatus === "counting" &&
                  countdownBeat > beatsPerMeasure && (
                    <span className="text-foreground font-bold text-lg">
                      Vào vị trí...
                    </span>
                  )}
                {recordingStatus === "recording" && (
                  <span className="text-red-500">
                    Đang thu âm! Nhạc phổ đang cuộn...
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 mt-auto shrink-0 relative">
          {isNameModalOpen && (
            <div className="absolute inset-x-0 bottom-full mb-4 bg-card border border-border shadow-xl rounded-xl p-5 z-20 animate-in slide-in-from-bottom-4 duration-200">
              <h4 className="font-bold mb-2 flex items-center gap-2 text-foreground">
                <FileText className="w-4 h-4 text-primary" />
                Đặt tên cho{" "}
                {saveTargetStatus === "published"
                  ? "Bản thu chính thức"
                  : "Bản nháp"}
              </h4>
              <input
                type="text"
                value={customTrackName}
                onChange={(e) => setCustomTrackName(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary mb-4"
                placeholder="VD: Guitar Solo (Take 2)..."
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && executeSaveTrack()}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsNameModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button className="flex-1" onClick={executeSaveTrack}>
                  Lưu ngay
                </Button>
              </div>
            </div>
          )}
          {recordingStatus === "preview" ? (
            <div
              className={`flex flex-col gap-3 transition-opacity ${isNameModalOpen ? "opacity-30 pointer-events-none" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-12 font-bold"
                  onClick={cancelPreview}
                >
                  Thu lại
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1 h-12 font-bold bg-muted hover:bg-muted/80"
                  onClick={() => openNameModal("draft")}
                  disabled={isUploading}
                >
                  {isUploading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}{" "}
                  {isUploading ? "Đang xử lý..." : "Lưu bản nháp"}
                </Button>
              </div>
              <Button
                size="lg"
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20"
                onClick={() => openNameModal("published")}
                disabled={isUploading}
              >
                <UploadCloud className="w-6 h-6 mr-2" /> Xác nhận Nộp bản thu
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-14 font-semibold text-lg"
                  onClick={handleClose}
                >
                  <Square className="w-5 h-5 mr-2" /> Hủy bỏ
                </Button>
                {recordingStatus === "idle" ? (
                  <Button
                    size="lg"
                    className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white font-bold text-xl shadow-lg shadow-red-500/20"
                    onClick={startRecordingFlow}
                  >
                    <Mic2 className="w-6 h-6 mr-2" /> Ghi Âm
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="flex-1 h-14 bg-foreground hover:bg-foreground/90 text-background font-bold text-xl"
                    onClick={stopRecordingFlow}
                  >
                    <Square className="w-6 h-6 mr-2 fill-current" /> Dừng Thu
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
