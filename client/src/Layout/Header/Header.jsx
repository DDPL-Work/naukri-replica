import React, { useEffect, useState } from "react";
import { LuBell, LuMenu } from "react-icons/lu";
import { useLocation } from "react-router-dom";
import profileIcon from "../../assets/profileIcon.svg";
import { jwtDecode } from "jwt-decode";

const neonBG = "bg-[#a1db40]";
const bellColor = "text-[#103c7f]";

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const location = useLocation();

  /* ------------------------------
        GET USER INFO FROM TOKEN
     ------------------------------ */
  const [userInfo, setUserInfo] = useState({
    name: "",
    role: "",
  });

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        setUserInfo({
          name: decoded.name || decoded.email?.split("@")[0] || "User",
          role: decoded.role?.toUpperCase() || "USER",
        });
      } catch (err) {
        console.error("Token decode failed:", err);
      }
    }
  }, []);

  /* ------------------------------
         SHOW DASHBOARD BADGE
     ------------------------------ */
  const showDashboardTag =
    location.pathname === "/recruiter/dashboard" ||
    location.pathname === "/admin/dashboard";

  const prettifyName = (str) => {
    if (!str) return "";
    return str.replace(/\.|_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <header className="w-full bg-white shadow-sm opacity-100 z-9999">
      <div className="py-2 px-3 sm:py-3 sm:px-4 lg:py-3 lg:px-6">
        <div className="flex items-center justify-between">
          {/* LEFT SECTION */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            >
              <LuMenu size={20} className="text-gray-700" />
            </button>

            {/* Dashboard Tag */}
            {showDashboardTag && (
              <div
                className={`${neonBG} py-1.5 px-3 sm:py-2 sm:px-4 lg:py-2 lg:px-5 w-fit rounded-full text-xs sm:text-sm lg:text-base font-medium`}
              >
                Dashboard Overview
              </div>
            )}
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
            {/* PROFILE */}
            <div className="flex items-center">
              <div className="border-2 sm:border-3 lg:border-4 border-gray-200 w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src={profileIcon}
                  className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                  alt="Profile"
                />
              </div>

              {/* USER NAME + ROLE */}
              <div className="hidden sm:block ml-3">
                <p className="text-sm font-medium text-gray-800">
                  {prettifyName(userInfo.name)}
                </p>
                <p className="text-xs text-gray-500">
                  {userInfo.role === "ADMIN"
                    ? "Administrator"
                    : userInfo.role === "RECRUITER"
                    ? "Recruiter"
                    : userInfo.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
