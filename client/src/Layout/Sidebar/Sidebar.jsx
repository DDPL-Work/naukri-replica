import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuLogOut,
  LuSearch
} from "react-icons/lu";
import { TbActivityHeartbeat } from "react-icons/tb";
import { MdGroup, MdAnalytics, MdCloudUpload } from "react-icons/md";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../features/slices/authSlice";

export default function Sidebar({ role, isOpen, onClose }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const recruiterMenu = [
    { id: "dashboard", to: "/recruiter/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
    { id: "search", to: "/recruiter/candidate-search", label: "Search Candidates", icon: LuSearch },
    { id: "logs", to: "/recruiter/activity-logs", label: "Logs", icon: TbActivityHeartbeat },
  ];

  const adminMenu = [
    { id: "dashboard", to: "/admin/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
    { id: "recruiter-management", to: "/admin/recruiter-management", label: "Recruiter Management", icon: MdGroup },
    { id: "analytics", to: "/admin/analytics", label: "Analytics", icon: MdAnalytics },
    { id: "bulk-upload", to: "/admin/bulk-upload", label: "Candidate Management", icon: MdCloudUpload },
    { id: "activity-logs", to: "/admin/activity-logs", label: "Activity Logs", icon: TbActivityHeartbeat },
  ];

  const bottomMenu = [
    { id: "logout", label: "Logout", icon: LuLogOut },
  ];

  const menu = role === "ADMIN" ? adminMenu : recruiterMenu;

  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    const found = menu.find((item) => item.to === currentPath);
    if (found) setActiveItem(found.id);
  }, [currentPath]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleItemClick = (item) => {
    if (item.id === "logout") handleLogout();

    setActiveItem(item.id);
    onClose();
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col bg-[#103c7f] text-white`}
    >
      {/* MENU LIST */}
      <nav className="flex-1 px-2 py-6">
        <ul className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  to={item.to}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg
                  ${activeItem === item.id
                    ? "bg-[#a1db40] text-[#103c7f]"
                    : "hover:bg-[#1a4d99] text-white"
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* FOOTER MENU */}
      <div className="border-t border-[#1a4d99] px-4 py-4">
        {bottomMenu.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#1a4d99]"
            >
              <Icon size={20} /> {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
