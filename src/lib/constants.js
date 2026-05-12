// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: (token) => `/api/auth/reset-password/${token}`,

  // Jams
  JAMS_RECENT_DRAFTS: "/api/jams/recent-drafts",
  JAMS_TRENDING: "/api/jams/trending",
  JAMS_LOBBY: "/api/jams/lobby",
  JAMS_MY_TRACKS: "/api/jams/my-tracks",
  JAMS_TOP_TRACKS: "/api/jams/top-tracks",
  JAMS_TRACK_DELETE: (trackId) => `/api/jams/tracks/${trackId}`,

  // Sheets
  SHEETS_EXPLORE: "/api/sheets/explore",
  SHEETS_SEARCH: "/api/sheets/search",
  SHEETS_MY_SHEETS: "/api/sheets/my-sheets",
  SHEETS_CREATE: "/api/sheets",
  SHEETS_LIKE: (sheetId) => `/api/sheets/${sheetId}/like`,

  // Notifications
  NOTIFICATIONS: "/api/notifications",
  NOTIFICATIONS_READ: (notifId) => `/api/notifications/${notifId}/read`,
  NOTIFICATIONS_READ_ALL: "/api/notifications/read-all",

  // Users
  USERS_PROFILE: "/api/users/profile",
  USERS_AVATAR: "/api/users/upload-avatar",
  USERS_UPLOAD_COVER: "/api/users/upload-cover",
};

// Helper function to build full URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
