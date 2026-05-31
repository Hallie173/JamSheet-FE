import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 1. Nới lỏng giới hạn cảnh báo lên 1000 KB (1MB)
    chunkSizeWarningLimit: 1000, 
    
    // 2. Chia tách (Code Splitting) các thư viện nặng ra file JS riêng
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'], // Nhóm thư viện cốt lõi
          ui: ['lucide-react'], // Nhóm thư viện Icon (thường rất nặng)
        }
      }
    }
  }
});
