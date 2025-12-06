import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerRecruiter,
  resetRecruiterState,
} from "../../features/slices/adminSlice";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AddRecruiterForm() {
  const dispatch = useDispatch();

  const { loading, success, error } = useSelector((state) => state.admin);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "RECRUITER",
    dailyLimit: "50",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  const statusOptions = ["Active", "Inactive"];

  // VERIFY ADMIN
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setIsAdmin(false);
      toast.error("You must be logged in as Admin");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      if (decoded.role === "ADMIN") {
        setIsAdmin(true);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        setIsAdmin(false);
        toast.error("Access Denied — Only Admin can add recruiters");
      }
    } catch (err) {
      setIsAdmin(false);
      toast.error("Invalid Token");
    }
  }, []);

  // VALIDATION
  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!formData.dailyLimit || isNaN(Number(formData.dailyLimit))) {
      newErrors.dailyLimit = "Daily limit must be a valid number";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the highlighted errors");
      return false;
    }

    return true;
  };

  const changeHandler = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: "RECRUITER",
      active: formData.status === "Active",
      dailyDownloadLimit: Number(formData.dailyLimit),
    };

    dispatch(registerRecruiter(payload));
  };

  useEffect(() => {
    if (success) {
      toast.success("Recruiter created successfully!");

      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "RECRUITER",
        dailyLimit: "50",
        status: "Active",
      });

      setErrors({});
      dispatch(resetRecruiterState());
    }

    if (error) {
      toast.error(error);
    }
  }, [success, error]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold text-red-600">
          Access Denied — Admin Only
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white px-8">

      {/* PAGE TITLE */}
      <div className="w-full flex flex-col text-left mb-2">
        <h1 className="text-black text-4xl font-bold font-serif leading-[60px]">
          Recruiter Management
        </h1>

        <p className="text-zinc-500 text-xl font-normal font-[Calibri] leading-6 mb-10 max-w-[650px]">
          Manage recruiter accounts and permissions
        </p>
      </div>

      {/* FORM CONTAINER */}
      <div className="w-full max-w-[1038px] bg-white rounded-lg border border-[#E0E5EB] p-6">
        <h2 className="text-black text-2xl font-bold font-[Calibri] leading-6 mb-6">
          Add New Recruiter
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">

          {/* FULL NAME */}
          <div>
            <label className="block text-black text-sm font-normal font-[Calibri] leading-4 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              placeholder="Enter recruiter's full name"
              onChange={(e) => changeHandler("fullName", e.target.value)}
              className="w-full h-10 bg-[#FCFBF8] border border-[#E0E5EB] rounded-md 
              px-3 text-sm font-normal font-[Calibri] text-zinc-500"
            />
            {errors.fullName && (
              <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-black text-sm font-normal font-[Calibri] leading-4 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              placeholder="recruiter@company.com"
              onChange={(e) => changeHandler("email", e.target.value)}
              className="w-full h-10 bg-[#FCFBF8] border border-[#E0E5EB] rounded-md 
              px-3 text-sm font-normal font-[Calibri] text-zinc-500"
            />
            {errors.email && (
              <p className="text-red-600 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-black text-sm font-normal font-[Calibri] leading-4 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                placeholder="Enter password"
                onChange={(e) => changeHandler("password", e.target.value)}
                className="w-full h-10 bg-[#FCFBF8] border border-[#E0E5EB] rounded-md 
                px-3 text-sm font-normal font-[Calibri] text-zinc-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-600 text-xs mt-1">{errors.password}</p>
            )}
            <p className="text-zinc-500 text-sm font-normal font-[Tahoma] leading-5 mt-1">
              Minimum 8 characters
            </p>
          </div>

          {/* DAILY LIMIT */}
          <div>
            <label className="block text-black text-sm font-normal font-[Calibri] leading-4 mb-1.5">
              Daily Download Limit *
            </label>
            <input
              type="number"
              value={formData.dailyLimit}
              onChange={(e) => changeHandler("dailyLimit", e.target.value)}
              className="w-full h-10 bg-[#FCFBF8] border border-[#E0E5EB] rounded-md 
              px-3 text-sm font-normal font-[Calibri] text-black"
            />
            {errors.dailyLimit && (
              <p className="text-red-600 text-xs mt-1">{errors.dailyLimit}</p>
            )}
            <p className="text-zinc-500 text-sm font-normal font-[Calibri] leading-5 mt-1">
              Maximum number of resume downloads per day
            </p>
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-black text-sm font-normal font-[Calibri] leading-4 mb-1.5">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => changeHandler("status", e.target.value)}
              className="w-full h-10 bg-[#FCFBF8] border border-[#E0E5EB] rounded-md 
              px-3 text-sm font-normal font-[Calibri] text-zinc-500 leading-5"
            >
              {statusOptions.map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="mt-8">
          <button
            disabled={loading}
            onClick={handleSubmit}
            className={`px-4 py-2 bg-[#A1DB40] rounded-md flex items-center gap-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className="text-black text-sm font-normal font-[Calibri] leading-5">
              {loading ? "Creating..." : "Create Recruiter"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
