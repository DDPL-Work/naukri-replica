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
        setRole(decoded.role?.toUpperCase());
      } catch {
        setRole(null);
      }
    }
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar
        role={role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Backdrop for mobile/tablet */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
