import React, { useState } from "react";
import {
  LuLayoutDashboard,
  LuLogOut,
  LuSearch,
  LuSettings,
} from "react-icons/lu";
import { TbActivityHeartbeat } from "react-icons/tb";
import { MdGroup, MdAnalytics, MdCloudUpload } from "react-icons/md";
import mavenLogo from "../../assets/mavenLogo.svg";
import { Link } from "react-router-dom";

export default function Sidebar() {
  // sidebarMode: "user" or "admin"
  const [sidebarMode, setSidebarMode] = useState("recruiter");

  // Active states for each sidebar
  const [activeUserItem, setActiveUserItem] = useState("dashboard");
  const [activeAdminItem, setActiveAdminItem] = useState("dashboard");

  // USER SIDEBAR MENU
  const recruiterMenu = [
    { id: "dashboard", to: "/recruiter/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
    { id: "search", to: "/recruiter/candidate-search", label: "Search Candidates", icon: LuSearch },
    { id: "logs", to: "/recruiter/activity-logs", label: "Logs", icon: TbActivityHeartbeat },
  ];

  const recruiterBottom = [
    { id: "settings", label: "Settings", icon: LuSettings },
    { id: "logout", label: "Logout", icon: LuLogOut },
  ];

  // ADMIN SIDEBAR MENU
  const adminMenu = [
    { id: "dashboard", to: "/admin/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
    { id: "recruiter-management", to: "/admin/recruiter-management", label: "Recruiter Management", icon: MdGroup },
    { id: "analytics", to: "/admin/analytics", label: "Analytics", icon: MdAnalytics },
    { id: "bulk-upload", to: "/admin/bulk-upload", label: "Bulk Upload", icon: MdCloudUpload },
    { id: "activity-logs", to: "/admin/activity-logs", label: "Activity Logs", icon: TbActivityHeartbeat },
  ];

  const adminBottom = [
    { id: "settings", label: "Settings", icon: LuSettings },
    { id: "logout", label: "Logout", icon: LuLogOut },
  ];

  // Toggle between user/admin when clicking logo
  const handleLogoClick = () => {
    setSidebarMode((prev) => (prev === "recruiter" ? "admin" : "recruiter"));
  };

  return (
    <div className="flex h-screen w-66 flex-col bg-[#103c7f] text-white transition-all">
      {/* LOGO - Toggles Sidebar */}
      <div className="p-4 cursor-pointer" onClick={handleLogoClick}>
        <img src={mavenLogo} alt="logo" />
      </div>

      {/* ---------------- USER SIDEBAR ---------------- */}
      {sidebarMode === "recruiter" && (
        <>
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {recruiterMenu.map((item) => {
                const Icon = item.icon;
                const isActive = activeUserItem === item.id;

                return (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      onClick={() => setActiveUserItem(item.id)}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                        isActive
                          ? "bg-[#a1db40] text-[#103c7f] font-semibold"
                          : "text-white hover:bg-[#1a4d99]"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="px-4 py-4">
            <ul className="space-y-2">
              {recruiterBottom.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveUserItem(item.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 hover:bg-[#1a4d99]"
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      {/* ---------------- ADMIN SIDEBAR ---------------- */}
      {sidebarMode === "admin" && (
        <>
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {adminMenu.map((item) => {
                const Icon = item.icon;
                const isActive = activeAdminItem === item.id;

                return (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      onClick={() => setActiveAdminItem(item.id)}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                        isActive
                          ? "bg-[#a1db40] text-[#103c7f] font-semibold"
                          : "text-white hover:bg-[#1a4d99]"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="px-4 py-4">
            <ul className="space-y-2">
              {adminBottom.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveAdminItem(item.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 hover:bg-[#1a4d99]"
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
