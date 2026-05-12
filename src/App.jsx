import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

import SheetsLibrary from "./pages/SheetsLibrary";
import MyRecords from "./pages/MyRecords";
import JamRoom from "./pages/JamRoom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

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
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* --- NHÓM 2: CÁC TRANG CHÍNH (ĐƯỢC BỌC TRONG MAINLAYOUT) --- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/jam-room" element={<JamRoom />} />
          <Route path="/sheets-library" element={<SheetsLibrary />} />
          <Route path="/my-records" element={<MyRecords />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
