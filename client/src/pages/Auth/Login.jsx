import React, { useState } from "react";
import { FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { MdAdminPanelSettings } from "react-icons/md";
import LogoImage from "../../assets/LogoImage.svg";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../features/slices/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const [role, setRole] = useState("RECRUITER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Enter email & password");
      return;
    }

    const result = await dispatch(loginUser({ email, password, role }));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Login successful!");

      const userRole = result.payload.role;
      if (userRole === "RECRUITER") {
        navigate("/recruiter/dashboard");
      } else if (userRole === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        toast.error("Unknown role detected");
      }
    }

    if (result.meta.requestStatus === "rejected") {
      toast.error(error || "Invalid credentials");
    }
  };

  return (
    <div className="w-full mx-auto h-screen relative bg-white flex">
      {/* LEFT PANEL (DESIGN) */}
      <div className="hidden lg:block w-[661.6px] h-full  flex-col justify-center">
          <img src={LogoImage} className="w-full h-screen object-cover " />
      </div>

      {/* RIGHT LOGIN BOX */}
      <div className="w-full lg:w-[778.4px] mx-auto my-auto flex flex-col items-center">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm  outline-1 outline-zinc-200/50 flex flex-col gap-4">
          {/* Sign In Title */}
          <h2 className="text-neutral-950 text-2xl font-bold font-serif text-center leading-8">
            Sign In
          </h2>
          <p className="text-zinc-500 text-base font-normal font-[Calibri] leading-6 text-center">
            Access your recruiter dashboard
          </p>

          {/* ROLE SWITCH DESIGN */}
          <div className="w-full h-10 p-1 bg-gray-100 rounded-[10px] flex items-center justify-between">
            {/* Recruiter */}
            <button
              onClick={() => setRole("RECRUITER")}
              className={`px-14 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer
                ${
                  role === "RECRUITER"
                    ? "bg-stone-50 text-neutral-950"
                    : "text-zinc-500"
                }`}
            >
              <FiUser size={14} />
              <span className="text-neutral-950 text-sm font-normal font-[Calibri] leading-5">
                Recruiter
              </span>
            </button>

            {/* Admin */}
            <button
              onClick={() => setRole("ADMIN")}
              className={`px-16 py-1.5 rounded-lg flex items-center cursor-pointer gap-2
                ${
                  role === "ADMIN"
                    ? "bg-stone-50 text-neutral-950"
                    : "text-zinc-500"
                }`}
            >
              <MdAdminPanelSettings size={14} />
              <span className="text-zinc-500 text-sm font-normal font-[Calibri] leading-5">
                Admin
              </span>
            </button>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-neutral-950 text-sm font-normal font-[Calibri] leading-4">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 bg-stone-50 rounded-[10px]  outline-1 outline-gray-200 px-4 mt-1 text-zinc-500 text-sm font-[Calibri]"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-neutral-950 text-sm font-normal font-[Calibri] leading-4">
              Password
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 bg-stone-50 rounded-[10px]  outline-1 outline-gray-200 px-4 text-zinc-500 text-sm font-[Calibri]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* REMEMBER ME + FORGOT */}
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-3 h-3 cursor-pointer border border-zinc-500 rounded-sm"
              />
              <span className="text-zinc-500 text-sm font-normal font-[Calibri] leading-5">
                Remember me
              </span>
            </div>
            <span className="text-neutral-950 text-sm font-normal font-[Calibri] leading-5 cursor-pointer">
              Forgot password?
            </span>
          </div>

          {/* SIGN IN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full cursor-pointer h-11 bg-blue-900 rounded-[10px] text-white text-base font-normal font-[Calibri] leading-6 flex items-center justify-center"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* DIVIDER */}
          <div className="relative flex items-center w-full py-2">
            <div className="border-t border-zinc-500 flex-1"></div>
            <span className="px-2 bg-white text-zinc-500 text-xs font-normal font-[Calibri] uppercase leading-4">
              Or continue with
            </span>
            <div className="border-t border-zinc-500 flex-1"></div>
          </div>

          {/* GOOGLE BUTTON */}
          <button className="w-full h-11 bg-stone-50 rounded-[10px]  outline-1 outline-gray-200 cursor-pointer flex items-center justify-center gap-2">
            <FcGoogle className="text-xl" />
            <span className="text-neutral-950 text-sm font-normal font-[Calibri] leading-5">
              Sign in with Google
            </span>
          </button>

          {/* FOOTER TEXT */}
          <div className="flex justify-center mt-2">
            <span className="text-zinc-500 text-sm font-normal font-[Calibri] leading-5">
              Don't have an account?
            </span>
            <span className="ml-1 text-neutral-950 text-sm font-normal font-[Calibri] leading-5 cursor-pointer">
              Contact Admin
            </span>
          </div>
        </div>

        {/* TERMS */}
        <p className="text-center text-zinc-500 text-xs font-normal font-[Calibri] leading-4 mt-4">
          By signing in, you agree to our{" "}
          <span className="underline cursor-pointer">Terms of Service</span> and{" "}
          <span className="underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
