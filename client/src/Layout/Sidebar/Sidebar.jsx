import React, { useState, useEffect } from "react";
import {
  LuLayoutDashboard,
  LuLogOut,
  LuSearch,
  LuSettings,
  LuMenu,
  LuX
} from "react-icons/lu";
import { TbActivityHeartbeat } from "react-icons/tb";
import { MdGroup, MdAnalytics, MdCloudUpload } from "react-icons/md";
import mavenLogo from "../../assets/mavenLogo.svg";
import { Link, useLocation } from "react-router-dom";
import { logoutUser } from "../../features/slices/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ role, isOpen, onClose }) {
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
    // { id: "settings", label: "Settings", icon: LuSettings },
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
    // { id: "settings", label: "Settings", icon: LuSettings },
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

  const handleItemClick = (item) => {
    if (item.id === "logout") {
      handleLogout();
    } else {
      setActiveItem(item.id);
      // Close sidebar on mobile after clicking a link
      if (window.innerWidth < 1024) {
        onClose();
      }
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-66 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } flex h-screen flex-col bg-[#103c7f] text-white`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <div className="flex items-center gap-3">
            <img src={mavenLogo} alt="logo" className="h-8 w-auto" />
            <span className="text-lg font-semibold">Maven</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1a4d99] rounded-lg"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* Desktop Logo */}
        <div className="hidden lg:block p-4">
          <img src={mavenLogo} alt="logo" className="h-8 w-auto" />
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-4 lg:py-6 overflow-y-auto">
          <ul className="space-y-1 lg:space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    onClick={() => {
                      setActiveItem(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center gap-3 rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 transition-colors text-sm lg:text-base ${
                      isActive
                        ? "bg-[#a1db40] text-[#103c7f] font-semibold"
                        : "text-white hover:bg-[#1a4d99]"
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* BOTTOM MENU */}
        <div className="px-3 lg:px-4 py-4 border-t border-[#1a4d99]">
          <ul className="space-y-1 lg:space-y-2">
            {bottomMenu.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-3 rounded-lg px-3 lg:px-4 py-2.5 lg:py-3 hover:bg-[#1a4d99] w-full text-sm lg:text-base"
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}