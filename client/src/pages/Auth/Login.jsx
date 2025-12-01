import React, { useState } from "react";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import LogoImage from "../../assets/LogoImage.svg";
import { MdAdminPanelSettings } from "react-icons/md";

const Login = () => {
  const [role, setRole] = useState("recruiter");

  return (
    <div className="w-full h-screen flex bg-white">
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${LogoImage})` }}
      ></div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 flex-col">
        <div className="w-full  max-w-md px-10 py-8 border border-gray-200 rounded-xl shadow-sm">
          {/* HEADER */}
          <h2 className="text-2xl font-bold text-center mb-1">Sign In</h2>
          <p className="text-gray-500 text-center mb-4">
            Access your recruiter dashboard
          </p>

          {/* ROLE SWITCH */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
            <button
              onClick={() => setRole("recruiter")}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-sm
        ${
          role === "recruiter"
            ? "bg-[#fcfbf8] shadow font-semibold text-black"
            : "text-gray-500"
        }`}
            >
              <FiUser className="text-sm" /> Recruiter
            </button>

            <button
              onClick={() => setRole("admin")}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-sm
        ${
          role === "admin"
            ? "bg-[#fcfbf8] shadow font-semibold text-black"
            : "text-gray-500"
        }`}
            >
              <MdAdminPanelSettings className="text-sm" /> Admin
            </button>
          </div>

          {/* EMAIL FIELD */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your email"
            />
          </div>

          {/* PASSWORD FIELD */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <button className="text-sm text-blue-600 cursor-pointer">
                Forgot password?
              </button>
            </div>

            <input
              type="password"
              className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your password"
            />
          </div>

          {/* REMEMBER ME */}
          <div className="flex items-center gap-2 mb-5">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-gray-600 text-sm">Remember me</span>
          </div>

          {/* SIGN IN BUTTON */}
          <button className="w-full bg-[#103c7f] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#0c2f63] transition mb-5">
            Sign In
          </button>

          {/* DIVIDER */}
          <div className="relative flex items-center mb-5">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-xs text-gray-400">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* GOOGLE LOGIN */}
          <button className="w-full border border-gray-300 bg-white rounded-lg py-3 flex items-center justify-center gap-3 hover:bg-gray-50">
            <FcGoogle className="text-xl" />
            <span className="text-sm text-gray-700">Sign in with Google</span>
          </button>

          {/* FOOTER */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{" "}
            <span className="text-blue-600 font-medium cursor-pointer">
              Contact Admin
            </span>
          </p>
        </div>
        <p className="text-center text-sm text-gray-400 mt-4">
          By signing in, you agree to our{" "}
          <span className="hover:text-blue-600 cursor-pointer underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="hover:text-blue-600 cursor-pointer underline">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
