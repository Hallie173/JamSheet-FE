import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ResetPassword from "@/pages/ResetPassword";

import SheetsLibrary from "./pages/SheetsLibrary";
import MyRecords from "./pages/MyRecords";
import JamRoom from "./pages/JamRoom";
//import JamRoom from './pages/JamRoom';

const MainLayout = () => {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <div className="shrink-0">
          <Header />
        </div>
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- NHÓM 1: CÁC TRANG AUTH (KHÔNG CÓ SIDEBAR/HEADER) --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* --- NHÓM 2: CÁC TRANG CHÍNH (ĐƯỢC BỌC TRONG MAINLAYOUT) --- */}
        <Route element={<MainLayout />}>
          {/* Tạm thời để text mộc cho Trang chủ và Phòng Jam */}
          <Route
            path="/"
            element={
              <h1 className="text-3xl font-bold">Trang chủ (Sắp ra mắt)</h1>
            }
          />
          <Route path="/jam-room" element={<JamRoom />} />
          <Route path="/sheets-library" element={<SheetsLibrary />} />
          <Route path="/my-records" element={<MyRecords />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
