// Import các Component giao diện của bạn
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Import test UI (Nút bấm, Slider)
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

function App() {
  return (
    // Container cha: Chiếm toàn màn hình, không cho cuộn ngang dọc
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      
      {/* Cột trái: Sidebar cố định */}
      <Sidebar />

      {/* Cột phải: Khu vực nội dung chính */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        
        {/* Header nằm trên cùng cột phải */}
        <Header />

        {/* Nội dung trang (Main Content) */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Khám phá Phòng Thu</h1>
            
            {/* Khối Test Mixer của chúng ta */}
            <div className="w-full max-w-sm space-y-4 p-6 border rounded-xl bg-card">
              <h3 className="font-semibold text-lg">Kệ Piano</h3>
              <p className="text-sm text-muted-foreground">User: le duy phuong ha</p>
              <Slider defaultValue={[70]} max={100} step={1} className="w-full mt-4" />
              <div className="flex gap-4 pt-4">
                <Button variant="default">Phát nhạc</Button>
                <Button variant="outline">Mute</Button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer nằm dưới cùng cột phải */}
        <Footer />
      </div>

    </div>
  );
}

export default App;