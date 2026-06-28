import React, { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function RealWaveform({
  audioUrl,
  color = "#3b82f6",
  playbackTime = 0,
  maxDuration = 30,
  onDurationLoad,
}) {
  const canvasRef = useRef(null);
  const [peaks, setPeaks] = useState([]);
  const [isDecoding, setIsDecoding] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [duration, setDuration] = useState(0);

  const onDurationLoadRef = useRef(onDurationLoad);
  useEffect(() => {
    onDurationLoadRef.current = onDurationLoad;
  }, [onDurationLoad]);

  useEffect(() => {
    let audioCtx = null;
    let isMounted = true;

    const fetchAndDecode = async () => {
      if (!audioUrl) return;
      setIsDecoding(true);
      setHasError(false);

      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error("Không tìm thấy file audio");

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const rawData = audioBuffer.getChannelData(0);

        const trackDur = audioBuffer.duration;
        if (isMounted) {
          setDuration(trackDur);
          if (onDurationLoadRef.current) onDurationLoadRef.current(trackDur);
        }

        // Tăng SAMPLES lên 400 để dải sóng chi tiết và mượt mà hơn
        const SAMPLES = 400;
        const blockSize = Math.floor((rawData?.length || 0) / SAMPLES);
        const compressedPeaks = [];
        let globalMax = 0;

        if (blockSize > 0) {
          for (let i = 0; i < SAMPLES; i++) {
            let blockStart = blockSize * i;
            let max = 0;
            for (let j = 0; j < blockSize; j++) {
              const amplitude = Math.abs(rawData[blockStart + j] || 0);
              if (amplitude > max) max = amplitude;
            }
            compressedPeaks.push(max);
            if (max > globalMax) globalMax = max;
          }
        }

        // Nếu đỉnh > 0, lấy từng phần tử chia cho đỉnh để kéo giãn tỷ lệ lên mức 0.0 -> 1.0
        const normalizedPeaks = globalMax > 0
          ? compressedPeaks.map(peak => peak / globalMax)
          : compressedPeaks;

        if (isMounted) setPeaks(compressedPeaks);
      } catch (error) {
        console.error("Lỗi sóng âm:", error.message);
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsDecoding(false);
        if (audioCtx) audioCtx.close();
      }
    };

    fetchAndDecode();
    return () => {
      isMounted = false;
    };
  }, [audioUrl]);

  useEffect(() => {
    if (
      !peaks ||
      !Array.isArray(peaks) ||
      peaks.length === 0 ||
      !canvasRef.current
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Hàm vẽ một đường sóng âm liền mạch (khép kín cả trên và dưới)
    const drawWavePath = () => {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      // Vẽ đường lượn nửa trên
      for (let i = 0; i < peaks.length; i++) {
        const x = (i / (peaks.length - 1)) * width;
        const y = (height / 2) - (peaks[i] * height * 0.8) / 2;
        ctx.lineTo(x, y);
      }

      // Vẽ đường lượn nửa dưới (chạy ngược lại để khép kín hình)
      for (let i = peaks.length - 1; i >= 0; i--) {
        const x = (i / (peaks.length - 1)) * width;
        const y = (height / 2) + (peaks[i] * height * 0.8) / 2;
        ctx.lineTo(x, y);
      }

      ctx.closePath();
    };

    // Tính toán tọa độ X của đoạn âm thanh đang phát
    const progressX = duration > 0 ? (playbackTime / duration) * width : 0;

    // 1. Vẽ toàn bộ dải sóng âm (Phần chưa phát) với độ mờ 0.3
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    drawWavePath();
    ctx.fill();

    // 2. Vẽ dải sóng âm đã phát (Đậm màu) sử dụng Clipping Mask
    ctx.save(); // Lưu trạng thái canvas
    ctx.beginPath();
    ctx.rect(0, 0, progressX, height); // Tạo mặt nạ hình chữ nhật từ đầu đến đoạn đang phát
    ctx.clip(); // Áp dụng mặt nạ cắt

    ctx.globalAlpha = 1.0; // Chỉnh độ nét lên 100%
    drawWavePath(); // Vẽ lại sóng âm (nó sẽ chỉ hiển thị bên trong mặt nạ cắt)
    ctx.fill();
    ctx.restore(); // Khôi phục trạng thái canvas

  }, [peaks, color, playbackTime, duration]);

  if (hasError) {
    return (
      <div className="absolute top-2 bottom-2 left-0 right-0 flex items-center justify-center bg-black/50 text-white/50 rounded-md border border-destructive/50">
        <AlertCircle className="w-4 h-4 text-destructive mr-2" />
        <span className="text-[10px]">Lỗi tải File</span>
      </div>
    );
  }

  const widthPercent = maxDuration > 0 ? (duration / maxDuration) * 100 : 100;

  return (
    <div
      className="absolute top-2 bottom-2 rounded-md border border-white/10 shadow-sm flex items-center justify-center overflow-hidden pointer-events-auto bg-black/40 backdrop-blur-sm transition-all duration-300"
      style={{ left: 0, width: `${widthPercent}%` }}
    >
      {isDecoding && (
        <div className="absolute z-10 bg-black/50 p-2 rounded-full backdrop-blur-sm">
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        </div>
      )}
      {/* Tắt smoothing để viền canvas sắc nét hơn */}
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        style={{ imageRendering: "pixelated" }}
        className="w-full h-full"
      />
    </div>
  );
}