import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";
import { jwtDecode } from "jwt-decode";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userRole = decoded.role?.toUpperCase(); // ADMIN | RECRUITER
        setRole(userRole);
      } catch (err) {
        console.error("Token decoding failed:", err);
        setRole(null);
      }
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return (
    <div className="flex h-screen w-full ">
      {/* Sidebar */}
      <Sidebar
        role={role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          role={role}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          sidebarOpen={isSidebarOpen}
          //   handleLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
