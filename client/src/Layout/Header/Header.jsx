import React, { useEffect, useState } from "react";
import { LuMenu } from "react-icons/lu";
import { jwtDecode } from "jwt-decode";
import mavenLogo from "../../assets/mavenLogo.svg";
import profileIcon from "../../assets/profileIcon.svg";
import { useNavigate } from "react-router-dom";

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ email: "", role: "" });

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserInfo({
          name: decoded.name || decoded.email,
          role: decoded.role?.toUpperCase(),
        });
      } catch {}
    }
  }, []);

  const prettifyName = (str) => {
    if (!str) return "";
    return str.replace(/\.|_/g, " ").replace(/\b\w/g, (c) => c.toLowerCase());
  };

  return (
    <header className="w-full bg-white shadow-sm z-20">
      <div className="flex items-center justify-between px-4 py-3">
        {/* LEFT SECTION WITH LOGO */}
        <div className="flex items-center gap-4">
          {/* Universal Menu Button (all devices) */}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <LuMenu size={22} />
          </button>

          {/* Logo moved here */}
          <img
            onClick={() => {
              if (userInfo.role === "ADMIN") {
                navigate("/admin/dashboard");
              } else if (userInfo.role === "RECRUITER") {
                navigate("/recruiter/dashboard");
              }
            }}
            src={mavenLogo}
            alt="Logo"
            className="h-7 w-auto cursor-pointer"
          />
        </div>

        {/* USER INFO */}
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
              {userInfo.name}
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
    </header>
  );
};

export default Header;
