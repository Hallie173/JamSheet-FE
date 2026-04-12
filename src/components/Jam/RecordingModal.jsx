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

        // Màu sắc: Đếm ngược (Vàng/Cam), Chính thức (Xanh), Nhịp đầu (Đậm hơn)
        const baseColor = beat.isCountIn
          ? "bg-orange-400/70 dark:bg-orange-500/60"
          : "bg-primary/70";
        const activeColor = beat.isCountIn
          ? "bg-orange-500 dark:bg-orange-400"
          : "bg-primary";
        const height = beat.isFirstBeatOfMeasure ? "h-full" : "h-3/5";
        const width = "flex-1"; // Chia đều chiều rộng

        return (
          <div
            key={beat.id}
            className={`${width} ${height} ${isActive ? activeColor : baseColor} rounded-sm transition-all duration-100 relative group`}
          >
            {/* Đường kẻ dọc phân chia 2 phần (Đếm ngược | Chính thức) */}
            {beat.id === countInBeats && (
              <div className="absolute right-0 top-0 bottom-0 w-px bg-foreground/50 z-10" />
            )}

            {/* Tooltip hiện số nhịp khi hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded shadow-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
              {beat.isCountIn
                ? `Đếm: ${beat.id}`
                : `Nhịp: ${beat.id - countInBeats}`}
            </div>
          </div>
        );
      })}

      {/* Nhãn phân chia */}
      <div className="absolute top-1 left-2 text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
        Đếm ngược
      </div>
      <div
        className="absolute top-1 text-[10px] font-bold text-primary uppercase tracking-wider"
        style={{ left: `calc(${(countInBeats / totalBeats) * 100}% + 8px)` }}
      >
        Chính thức
      </div>
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

  const tempo = activeRoom?.tempo || 120;
  const timeSignatureStr = activeRoom?.timeSignature || "4/4";
  const beatsPerMeasure = parseInt(timeSignatureStr.split("/")[0]) || 4;
  const secondsPerBeat = 60 / tempo;
  const countInBeats = beatsPerMeasure * 2;

  const stopPlayBack = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
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

    // 1. Khởi tạo AudioContext
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    try {
      // 2. Tải và giải mã audio
      const response = await fetch(previewAudioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // 3. Lên lịch metronome
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

          // Cập nhật beat hiện tại
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

      // 4. Lên lịch phát Audio với OFFSET
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      sourceRef.current = source;

      const offsetSeconds = syncOffset / 1000;
      // Bắt đầu phát cùng lúc với tiếng Click đầu tiên của phần "Chính thức"
      const startTime =
        audioCtx.currentTime + 0.1 + countInBeats * secondsPerBeat;

      if (offsetSeconds >= 0) {
        // Trễ hơn: Đợi một lúc rồi mới phát
        source.start(startTime + offsetSeconds);
      } else {
        // Sớm hơn: Phát ngay, nhưng cắt bỏ phần đầu
        const cutStart = Math.abs(offsetSeconds);
        source.start(startTime, cutStart);
      }

      // 5. Dừng khi audio kết thúc
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
    return () => {
      stopPlayBack();
    };
  }, []);

  // Tính tổng số nhịp hiển thị (Đếm ngược + Chính thức)
  // Giả định bản thu dài tối đa 60s để vẽ khung
  const totalBeatsToDisplay = countInBeats + Math.ceil(60 / secondsPerBeat);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* DẢI 1: SÓNG ÂM METRONOME (CỐ ĐỊNH) */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider pl-1">
          Metronome (Chuẩn nhịp)
        </Label>
        <MetronomeWaveform
          beatsPerMeasure={beatsPerMeasure}
          totalBeats={totalBeatsToDisplay}
          currentBeat={currentBeat}
          isPlaying={isPlaying}
        />
      </div>

      {/* DẢI 2: SÓNG ÂM BẢN THU (KÉO TRƯỢT) */}
      <div className="flex flex-col gap-1.5 relative">
        <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider pl-1">
          Bản thu của bạn
        </Label>
        <div className="w-full h-16 bg-muted/20 rounded-md border border-border relative overflow-hidden">
          {/* VẼ SÓNG ÂM BẢN THU Ở ĐÂY (Sử dụng RealWaveform hoặc một thư viện vẽ sóng âm) */}
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground opacity-50">
            [ Sóng âm bản thu ]
          </div>

          {/* Kim đồng hồ preview */}
          {isPlaying && currentBeat > countInBeats && (
            <div
              className="absolute top-0 bottom-0 w-px bg-primary z-10 shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none"
              style={{
                left: `calc(${(countInBeats / totalBeatsToDisplay) * 100}% + ${((currentBeat - countInBeats) / (totalBeatsToDisplay - countInBeats)) * (1 - countInBeats / totalBeatsToDisplay) * 100}%)`,
              }}
            />
          )}

          {/* Hiệu ứng trượt Offset (Chỉ vẽ khung, logic trượt cần tích hợp vào RealWaveform) */}
          <div
            className="absolute inset-y-0 bg-primary/5 border-l-2 border-primary/30"
            style={{
              left: `calc(${(countInBeats / totalBeatsToDisplay) * 100}% + ${(syncOffset / 1000 / secondsPerBeat / totalBeatsToDisplay) * 100}%)`,
              width: "4px",
            }}
          />
        </div>
      </div>

      {/* THANH ĐIỀU KHIỂN & SLIDER OFFSET */}
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
  const [syncOffset, setSyncOffset] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const addRecordToTrack = useJamStore((state) => state.addRecordToTrack);

  const metronomeRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const timeSignatureStr = activeRoom?.timeSignature || "4/4";
  const beatsPerMeasure = parseInt(timeSignatureStr.split("/")[0]) || 4;

  useEffect(() => {
    if (initialDraft) {
      setPreviewAudioUrl(initialDraft.raw_audio_url);
      setRecordingStatus("preview");
      // Load offset cũ nếu có
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

  const cancelPreview = () => {
    setPreviewAudioUrl(null);
    setRecordingStatus("idle");
    setCountDownBeat(0);
    audioChunksRef.current = [];
  };

  const handleSaveTrack = async (targetStatus = "draft") => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const file = new File([audioBlob], "record.webm", {
          type: "audio/webm",
        });
        formData.append("audio", file);
      }
      formData.append("instrument", recordingTrack.instrument);
      formData.append("status", targetStatus);
      //Đặt tên mặc định
      formData.append(
        "name",
        targetStatus === "published"
          ? `Track ${recordingTrack.instrument} - ${new Date().toLocaleDateString()}`
          : `Draft ${new Date().toLocaleDateString()}`,
      );
      formData.append("sync_offset_ms", syncOffset);
      formData.append("use_ai_clean", useAiClean);

      const params = new URLSearchParams(window.location.search);
      const draftId = params.get("draftId");
      const url = draftId
        ? `http://localhost:5000/api/jams/tracks/${draftId}`
        : `http://localhost:5000/api/jams/${activeRoom.id}/tracks`;

      const response = await fetch(url, {
        method: draftId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi không xác định");

      //Cập nhật zustand để vẽ sóng âm
      if (targetStatus === "published") {
        addRecordToTrack(recordingTrack.instrument, {
          id: data.track.id,
          name: data.track.name,
          audioUrl: data.track.audio_url,
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

  const handleClose = () => {
    stopRecordingFlow();
    cancelPreview();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
      {/* NỬA TRÁI: NHẠC PHỔ */}
      <div className="w-1/2 lg:w-3/5 border-r border-border p-4 flex flex-col h-full relative bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Nhạc phổ:{" "}
            {activeRoom?.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Label>Tốc độ cuộn:</Label>
            <Slider
              value={[autoScrollSpeed]}
              max={3}
              min={0.5}
              step={0.1}
              onValueChange={(val) => setAutoScrollSpeed(val[0])}
              className="w-24"
            />
            <span className="w-8 font-mono">{autoScrollSpeed}x</span>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-md shadow-inner border border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground flex-col gap-2">
            <FileText className="w-12 h-12 opacity-20" />
            <span>Khu vực cuộn Nhạc phổ</span>
          </div>
        </div>
      </div>

      {/* NỬA PHẢI: PHÒNG THU & CĂN CHỈNH */}
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

        {/* KHU VỰC CHÍNH (THU ÂM HOẶC PREVIEW) */}
        <div
          className={`border rounded-xl p-6 flex flex-col items-center mb-6 flex-1 transition-colors duration-500 ${recordingStatus === "recording" ? "bg-red-500/10 border-red-500/50" : "bg-muted/40 border-border"}`}
        >
          {recordingStatus === "preview" ? (
            // GIAO DIỆN PREVIEW & CĂN CHỈNH MỚI
            <div className="w-full flex flex-col items-center gap-6 flex-1">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2 shrink-0">
                <Check className="w-6 h-6" /> Thu âm hoàn tất!
              </h3>

              {/* TRÌNH PHÁT TÙY CHỈNH SONG SONG 2 DẢI SÓNG */}
              <div className="w-full flex-1 flex items-center justify-center">
                <CustomPreviewPlayer
                  previewAudioUrl={previewAudioUrl}
                  activeRoom={activeRoom}
                  syncOffset={syncOffset}
                  setSyncOffset={setSyncOffset}
                />
              </div>

              {/* TÙY CHỌN AI (CHUYỂN XUỐNG DƯỚI) */}
              <div
                className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border w-full max-w-sm shadow-sm cursor-pointer hover:border-primary/50 transition-colors shrink-0"
                onClick={() => setUseAiClean(!useAiClean)}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border ${useAiClean ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"}`}
                >
                  {useAiClean && <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" /> Dùng AI
                    lọc tạp âm
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Loại bỏ tiếng ồn nền, tiếng quạt gió...
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // GIAO DIỆN ĐANG THU (GIỮ NGUYÊN)
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

        {/* KHU VỰC NÚT BẤM (DƯỚI CÙNG) */}
        <div className="space-y-4 mt-auto shrink-0">
          {recordingStatus === "preview" ? (
            <div className="flex flex-col gap-3">
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
                  onClick={() => handleSaveTrack("draft")}
                  disabled={isUploading}
                >
                  {isUploading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}{" "}
                  {isUploading ? "Đang lưu..." : "Lưu bản nháp"}
                </Button>
              </div>
              <Button
                size="lg"
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20"
                onClick={() => handleSaveTrack("published")}
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
              {recordingStatus === "idle" && (
                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Hoặc tải lên file có sẵn
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
