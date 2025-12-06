import React, { useState, useEffect } from "react";
import {
  LuLayoutDashboard,
  LuLogOut,
  LuSearch,
  LuSettings,
} from "react-icons/lu";
import { TbActivityHeartbeat } from "react-icons/tb";
import { MdGroup, MdAnalytics, MdCloudUpload } from "react-icons/md";
import mavenLogo from "../../assets/mavenLogo.svg";
import { Link, useLocation } from "react-router-dom";
import { logoutUser } from "../../features/slices/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ role }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // USER SIDEBAR
  const recruiterMenu = [
    {
      id: "dashboard",
      to: "/recruiter/dashboard",
      label: "Dashboard",
      icon: LuLayoutDashboard,
    },
    {
      id: "search",
      to: "/recruiter/candidate-search",
      label: "Search Candidates",
      icon: LuSearch,
    },
    {
      id: "logs",
      to: "/recruiter/activity-logs",
      label: "Logs",
      icon: TbActivityHeartbeat,
    },
  ];

  const recruiterBottom = [
    { id: "settings", label: "Settings", icon: LuSettings },
    { id: "logout", label: "Logout", icon: LuLogOut },
  ];

  // ADMIN SIDEBAR
  const adminMenu = [
    {
      id: "dashboard",
      to: "/admin/dashboard",
      label: "Dashboard",
      icon: LuLayoutDashboard,
    },
    {
      id: "recruiter-management",
      to: "/admin/recruiter-management",
      label: "Recruiter Management",
      icon: MdGroup,
    },
    {
      id: "analytics",
      to: "/admin/analytics",
      label: "Analytics",
      icon: MdAnalytics,
    },
    {
      id: "bulk-upload",
      to: "/admin/bulk-upload",
      label: "Candidate Management",
      icon: MdCloudUpload,
    },
    {
      id: "activity-logs",
      to: "/admin/activity-logs",
      label: "Activity Logs",
      icon: TbActivityHeartbeat,
    },
  ];

  const adminBottom = [
    { id: "settings", label: "Settings", icon: LuSettings },
    { id: "logout", label: "Logout", icon: LuLogOut },
  ];

  const menu = role === "ADMIN" ? adminMenu : recruiterMenu;
  const bottomMenu = role === "ADMIN" ? adminBottom : recruiterBottom;

  const [activeItem, setActiveItem] = useState(null);

  // Auto-detect active menu based on current URL
  useEffect(() => {
    const found = menu.find((item) => item.to === currentPath);
    if (found) setActiveItem(found.id);
  }, [currentPath, menu]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-66 flex-col bg-[#103c7f] text-white">
      {/* LOGO */}
      <div className="p-4">
        <img src={mavenLogo} alt="logo" />
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <li key={item.id}>
                <Link
                  to={item.to}
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

      {/* BOTTOM MENU */}
      <div className="px-4 py-4">
        <ul className="space-y-2">
          {bottomMenu.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <button
                  onClick={() =>
                    item.id === "logout"
                      ? handleLogout()
                      : setActiveItem(item.id)
                  }
                  className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-[#1a4d99] w-full"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
