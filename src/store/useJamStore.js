import { create } from "zustand";

export const useJamStore = create((set, get) => ({
  // XÓA DỮ LIỆU GIẢ, THAY BẰNG DỮ LIỆU TRỐNG
  activeRoom: null,
  currentTracks: [],
  isPlaying: false,
  masterVolume: 100,
  isLoadingRoom: false, // State để hiển thị vòng quay Loading
  errorMsg: null,

  // HÀM MỚI: Gọi API lên Backend lấy dữ liệu phòng theo ID
  fetchJamRoomData: async (roomId) => {
    set({ isLoadingRoom: true, errorMsg: null });
    try {
      const response = await fetch(`http://localhost:5000/api/jams/${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Không thể tải phòng Jam");

      // Cập nhật State với dữ liệu thật từ MongoDB
      set({
        activeRoom: data,
        currentTracks: data.tracks,
        isPlaying: false,
        isLoadingRoom: false,
      });
    } catch (error) {
      console.error(error);
      set({ errorMsg: error.message, isLoadingRoom: false });
    }
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  changeActiveRecord: (trackId, recordId) => {
    set((state) => ({
      currentTracks: state.currentTracks.map((t) =>
        t.id === trackId ? { ...t, activeRecordId: recordId } : t,
      ),
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

  saveMixToCloud: async (projectId) => {
    const { currentTracks } = get();
    const formattedTracksConfig = currentTracks.map((track) => ({
      instrument: track.instrument,
      volume: track.volume,
      active_record_id: track.activeRecordId || null,
    }));

    try {
      const response = await fetch(
        `http://localhost:5000/api/jams/${projectId}/mix-config`,
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
