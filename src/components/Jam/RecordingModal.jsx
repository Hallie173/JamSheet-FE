import React, { useState, useRef, useEffect } from "react";
import { Mic2, Square, Check, Sparkles, Loader2, UploadCloud, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useJamStore } from "@/store/useJamStore";

export default function RecordingModal({ activeRoom, recordingTrack, initialDraft, onClose }) {
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1);
  const [recordingStatus, setRecordingStatus] = useState("idle");
  const [countdownBeat, setCountDownBeat] = useState(0);
  const [previewAudioUrl, setPreviewAudioUrl] = useState(null);
  const [useAiClean, setUseAiClean] = useState(false);
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
    }
  }, [initialDraft]);

  const startRecordingFlow = async () => {
    if (!activeRoom || !recordingTrack) return;
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setPreviewAudioUrl(audioUrl);
        setRecordingStatus("preview");
        stream.getTracks().forEach((track) => track.stop());
      };
    } catch (error) {
      alert("Không thể truy cập Microphone! Vui lòng cấp quyền trong cài đặt trình duyệt.");
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

        setTimeout(() => {
          setCountDownBeat(beatNumber);
          if (beatNumber === beatsPerMeasure + 1 && mediaRecorderRef.current.state === "inactive") {
            mediaRecorderRef.current.start();
          }
          if (beatNumber === countInBeats + 1) {
            setRecordingStatus("recording");
          }
        }, (nextNoteTime - audioCtx.currentTime) * 1000);

        currentBeat++;
        nextNoteTime += secondsPerBeat;
      }
      metronomeRef.current = requestAnimationFrame(scheduler);
    };
    scheduler();
  };

  const stopRecordingFlow = () => {
    if (metronomeRef.current) cancelAnimationFrame(metronomeRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      setRecordingStatus("idle");
      setCountDownBeat(0);
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
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
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            const file = new File([audioBlob], "record.webm", { type: "audio/webm" });
            formData.append("audio", file);
        }
        formData.append("instrument", recordingTrack.instrument);
        formData.append("status", targetStatus);
        //Đặt tên mặc định
        formData.append("name", targetStatus === "published" ? `Track ${recordingTrack.instrument} - ${new Date().toLocaleDateString()}` : `Draft ${new Date().toLocaleDateString()}`);

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
            });
            alert("Đã nộp bản thu vào Bàn Mixer!");
        } else {
            alert(draftId ? "Đã cập nhật bản nháp thành công!" : "Đã lưu bản nháp thành công!");
        }

        handleClose();
    } catch (error) {
        alert("Lỗi: " + error.message);
    } finally {
        setIsUploading(false);
    }  };

  const handleClose = () => {
    stopRecordingFlow();
    cancelPreview();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex animate-in fade-in zoom-in-95 duration-200">
      <div className="w-1/2 lg:w-3/5 border-r border-border p-4 flex flex-col h-full relative bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Nhạc phổ: {activeRoom?.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Label>Tốc độ cuộn:</Label>
            <Slider
              value={[autoScrollSpeed]} max={3} min={0.5} step={0.1}
              onValueChange={(val) => setAutoScrollSpeed(val[0])} className="w-24"
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

      <div className="w-1/2 lg:w-2/5 p-6 flex flex-col h-full bg-card shadow-2xl relative">
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={handleClose}>
          <X className="w-5 h-5" />
        </Button>

        <div className="mb-8 mt-2">
          <h2 className="text-2xl font-bold">Phòng Thu</h2>
          <p className="text-muted-foreground mt-1">
            Đang nộp bản thu cho kệ: <strong className="text-foreground">{recordingTrack.instrument}</strong>
          </p>
        </div>

        <div className={`border rounded-xl p-8 flex flex-col items-center justify-center mb-8 flex-1 transition-colors duration-500 ${recordingStatus === "recording" ? "bg-red-500/10 border-red-500/50" : "bg-muted/40 border-border"}`}>
          {recordingStatus === "preview" ? (
            <div className="w-full flex flex-col items-center space-y-6">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <Check className="w-6 h-6" /> Thu âm hoàn tất!
              </h3>
              <audio src={previewAudioUrl} controls className="w-full max-w-sm rounded-md shadow-sm" />
              <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border w-full max-w-sm shadow-sm cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setUseAiClean(!useAiClean)}>
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${useAiClean ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"}`}>
                  {useAiClean && <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-bold flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-emerald-500" /> Dùng AI lọc tạp âm</span>
                  <span className="text-xs text-muted-foreground">Loại bỏ tiếng ồn nền, tiếng quạt gió...</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center mb-6 h-32 flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Trạng thái Metronome</p>
              <div className="text-6xl font-black text-primary font-mono tracking-tighter">
                {recordingStatus === "idle" && "SẴN SÀNG"}
                {recordingStatus === "counting" && (
                  <div className="flex flex-col items-center">
                    <span className={countdownBeat % beatsPerMeasure === 1 ? "text-destructive scale-110 transition-transform" : ""}>
                      {countdownBeat > beatsPerMeasure ? countdownBeat - beatsPerMeasure : countdownBeat}
                    </span>
                  </div>
                )}
                {recordingStatus === "recording" && (
                  <span className="text-red-500 flex items-center gap-4 animate-pulse">
                    <div className="w-6 h-6 rounded-full bg-red-500"></div> ĐANG THU
                  </span>
                )}
              </div>
            </div>
          )}

          {recordingStatus !== "preview" && (
            <p className="text-muted-foreground font-medium text-center max-w-sm h-12">
              {recordingStatus === "idle" && <>Nhịp độ là <strong>{activeRoom?.tempo} BPM</strong>. Hệ thống sẽ đếm <strong>2 ô nhịp</strong> chuẩn bị trước khi ghi âm.</>}
              {recordingStatus === "counting" && countdownBeat > beatsPerMeasure && <span className="text-foreground font-bold text-lg">Vào vị trí...</span>}
              {recordingStatus === "recording" && <span className="text-red-500">Đang thu âm! Nhạc phổ đang cuộn...</span>}
            </p>
          )}
        </div>

        <div className="space-y-4 mt-auto">
          {recordingStatus === "preview" ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Button size="lg" variant="outline" className="flex-1 h-12 font-bold" onClick={cancelPreview}>Thu lại</Button>
                <Button size="lg" variant="secondary" className="flex-1 h-12 font-bold bg-muted hover:bg-muted/80" onClick={() => handleSaveTrack("draft")} disabled={isUploading}>
                  {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} {isUploading ? "Đang lưu..." : "Lưu bản nháp"}
                </Button>
              </div>
              <Button size="lg" className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20"
                onClick={() => handleSaveTrack("published")} disabled={isUploading}>
                <UploadCloud className="w-6 h-6 mr-2" /> Xác nhận Nộp bản thu
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Button size="lg" variant="outline" className="flex-1 h-14 font-semibold text-lg" onClick={handleClose}>
                  <Square className="w-5 h-5 mr-2" /> Hủy bỏ
                </Button>
                {recordingStatus === "idle" ? (
                  <Button size="lg" className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white font-bold text-xl shadow-lg shadow-red-500/20" onClick={startRecordingFlow}>
                    <Mic2 className="w-6 h-6 mr-2" /> Ghi Âm
                  </Button>
                ) : (
                  <Button size="lg" className="flex-1 h-14 bg-foreground hover:bg-foreground/90 text-background font-bold text-xl" onClick={stopRecordingFlow}>
                    <Square className="w-6 h-6 mr-2 fill-current" /> Dừng Thu
                  </Button>
                )}
              </div>
              {recordingStatus === "idle" && (
                <div className="text-center"><Button variant="link" className="text-muted-foreground hover:text-primary">Hoặc tải lên file có sẵn</Button></div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}