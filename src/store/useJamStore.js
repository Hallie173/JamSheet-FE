import { create } from "zustand";

export const useJamStore = create((set, get) => ({
  activeRoom: null,
  currentTracks: [],
  isPlaying: false,
  masterVolume: 100,
  isLoadingRoom: false,
  errorMsg: null,
  pendingTrackId: null,

  fetchJamRoomData: async (roomId) => {
    set({ isLoadingRoom: true, errorMsg: null });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jams/${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Không thể tải phòng Jam");

      const newState = {
        // Trải phẳng data gốc, đồng thời tự động bóc tách mảng nhiều trang
        // từ sheet_music_id (nếu có) và gán thẳng vào biến sheetUrls
        activeRoom: {
          ...data,
          sheetUrls: data.sheetUrls || data.sheet_music_id?.file_urls || data.file_urls || []
        },
        currentTracks: data.tracks,
        isPlaying: false,
        isLoadingRoom: false,
      };

      // Nếu có pending track ID, tự động chọn track đó
      const { pendingTrackId } = get();
      if (pendingTrackId) {
        // Tìm track có record với ID bằng pendingTrackId
        const trackWithRecord = data.tracks.find((track) =>
          track.records?.some((record) => record.id === pendingTrackId || record._id === pendingTrackId)
        );

        if (trackWithRecord) {
          const recordId = trackWithRecord.records.find(
            (record) => record.id === pendingTrackId || record._id === pendingTrackId
          )?.id || trackWithRecord.records.find(
            (record) => record.id === pendingTrackId || record._id === pendingTrackId
          )?._id;

          newState.currentTracks = data.tracks.map((t) =>
            t.id === trackWithRecord.id ? { ...t, activeRecordId: recordId } : t,
          );
        }

        // Reset pending ID sau khi xử lý
        newState.pendingTrackId = null;
      }

      set(newState);
    } catch (error) {
      console.error(error);
      set({ errorMsg: error.message, isLoadingRoom: false });
    }
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  fetchJamRoomPublic: async (roomId) => {
    set({ isLoadingRoom: true, errorMsg: null });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jams/${roomId}/public`);
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Không thể tải phòng Jam");

      set({
        activeRoom: {
          ...data,
          sheetUrls: data.sheetUrls || data.sheet_music_id?.file_urls || data.file_urls || []
        },
        currentTracks: data.tracks,
        isPlaying: false,
        isLoadingRoom: false,
      });
    } catch (error) {
      console.error(error);
      set({ errorMsg: error.message, isLoadingRoom: false });
    }
  },

  setPendingTrackId: (trackId) => set({ pendingTrackId: trackId }),

  changeActiveRecord: (trackId, recordId) => {
    set((state) => ({
      currentTracks: state.currentTracks.map((t) =>
        t.id === trackId ? { ...t, activeRecordId: recordId } : t,
      ),
    }));
  },

  toggleLikeRecord: async (instrument, recordId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jams/tracks/${recordId}/like`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Cập nhật mảng liked_by của bản thu tương ứng trên UI
        set((state) => ({
          currentTracks: state.currentTracks.map((t) => {
            if (t.instrument === instrument) {
              return {
                ...t,
                records: t.records.map((r) =>
                  r.id === recordId ? { ...r, liked_by: data.liked_by } : r
                ),
              };
            }
            return t;
          }),
        }));
      }
    } catch (error) {
      console.error("Lỗi khi thả tim:", error);
    }
  },

  addNewTrack: (instrumentName) => {
    set((state) => {
      const colorPalette = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
      ];
      const newIndex = state.currentTracks.length;

      const newTrack = {
        id: `custom_track_${Date.now()}`,
        instrument: instrumentName,
        user: "Đang chờ nộp...",
        avatar: "",
        waveColor: colorPalette[newIndex % colorPalette.length],
        volume: 80,
        activeRecordId: null,
        records: [],
      };

      return { currentTracks: [...state.currentTracks, newTrack] };
    });
  },

  addRecordToTrack: (instrument, newRecord) => {
    set((state) => ({
      currentTracks: state.currentTracks.map((t) => {
        if (t.instrument === instrument) {
          return {
            ...t,
            records: [...t.records, newRecord],
            activeRecordId: newRecord.id,
          };
        }
        return t;
      }),
    }));
  },

  setMasterVolume: (value) => set({ masterVolume: value }),

  setTrackVolume: (trackId, volume) => {
    set((state) => ({
      currentTracks: state.currentTracks.map((t) =>
        t.id === trackId ? { ...t, volume: volume } : t,
      ),
    }));
  },

  saveMixToCloud: async (projectId) => {
    const { currentTracks } = get();
    const formattedTracksConfig = currentTracks.map((track) => {
      const conf = {
        instrument: track.instrument,
        volume: track.volume,
      };
      // ĐÃ SỬA: Chỉ gửi ID lên Database nếu nó thực sự tồn tại (khác null)
      if (track.activeRecordId) {
        conf.active_record_id = track.activeRecordId;
      }
      return conf;
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/jams/${projectId}/mix-config`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ tracks_config: formattedTracksConfig }),
        },
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Lỗi khi lưu bản mix");
        } else {
          throw new Error(`Lỗi máy chủ (Mã lỗi ${response.status}).`);
        }
      }
      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      console.error(error);
      return { success: false, message: error.message };
    }
  },
}));
