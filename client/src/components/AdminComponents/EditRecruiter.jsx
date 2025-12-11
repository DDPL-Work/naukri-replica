import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  updateRecruiter,
  listRecruiters,
} from "../../features/slices/adminSlice";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

export default function EditRecruiter() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { recruiters, updateLoading, updateError, updateSuccess } = useSelector(
    (state) => state.admin
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dailyDownloadLimit: "",
    active: true,
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Load recruiter details
  useEffect(() => {
    if (recruiters.length === 0) {
      dispatch(listRecruiters());
      return;
    }

    const r = recruiters.find((rec) => rec._id === id);
    if (r) {
      setFormData({
        name: r.name,
        email: r.email,
        dailyDownloadLimit: r.dailyDownloadLimit,
        active: r.active,
        password: "",
      });
      setLoading(false);
      toast.success("Recruiter data loaded");
    }
  }, [recruiters, id]);

  // Listen success / error
  useEffect(() => {
    if (updateSuccess) {
      toast.success("Recruiter updated successfully!");
      navigate("/admin/recruiter-management");
    }

    if (updateError) {
      toast.error(updateError);
    }
  }, [updateSuccess, updateError]);

  const changeHandler = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const updates = {
      name: formData.name,
      email: formData.email,
      dailyDownloadLimit: Number(formData.dailyDownloadLimit),
      active: formData.active,
    };

    if (formData.password.trim() !== "") {
      updates.password = formData.password;
    }

    dispatch(updateRecruiter({ id, updates }));
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-xl font-semibold">Loading...</div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white px-8">

      {/* PAGE HEADER */}
      <div className="w-full flex flex-col text-left mb-2">
        <h1 className="text-black text-4xl font-bold font-serif leading-[60px]">
          Recruiter Management
        </h1>
        <p className="text-[#808080] text-xl font-[Calibri] leading-6 mb-10 max-w-[650px]">
          Edit recruiter details and permissions
        </p>
      </div>

      {/* FORM CONTAINER */}
      <div className="w-full max-w-[1038px] bg-white rounded-lg border border-[#E0E5EB] p-6">

        <h2 className="text-black text-2xl font-bold font-[Calibri] mb-6">
          Edit Recruiter
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">

            {/* Name */}
            <div>
              <label className="block text-black text-sm font-[Calibri] mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => changeHandler("name", e.target.value)}
                className="w-full h-10 bg-[#FCFBF8] border border-[#E0E5EB]
                           rounded-md px-3 text-sm text-[#808080]"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Email (editable now) */}
            <div>
              <label className="block text-black text-sm font-[Calibri] mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => changeHandler("email", e.target.value)}
                className="w-full h-10 bg-[#FCFBF8] border border-[#E0E5EB]
                           rounded-md px-3 text-sm text-[#808080]"
                placeholder="recruiter@company.com"
                required
              />
            </div>

            {/* Daily Limit */}
            <div>
              <label className="block text-black text-sm font-[Calibri] mb-2">
                Daily Download Limit *
              </label>
              <input
                type="number"
                value={formData.dailyDownloadLimit}
                onChange={(e) =>
                  changeHandler("dailyDownloadLimit", e.target.value)
                }
                className="w-full h-10 bg-[#FCFBF8] border border-[#E0E5EB]
                           rounded-md px-3 text-sm"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-black text-sm font-[Calibri] mb-2">
                Status *
              </label>
              <select
                value={formData.active}
                onChange={(e) =>
                  changeHandler("active", e.target.value === "true")
                }
                className="w-full h-10 bg-[#FCFBF8] border border-[#E0E5EB]
                           rounded-md px-3 text-sm"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <label className="block text-black text-sm font-[Calibri] mb-2">
                New Password (optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => changeHandler("password", e.target.value)}
                  className="w-full h-10 bg-[#FCFBF8] border border-[#E0E5EB]
                             rounded-md px-3 pr-10 text-sm text-[#808080]"
                  placeholder="Enter new password"
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

          </div>

          {/* BUTTONS */}
          <div className="mt-10 flex gap-4">
            <button
              type="submit"
              disabled={updateLoading}
              className={`px-6 py-2 bg-[#A1DB40] rounded-md text-black text-sm
                ${updateLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {updateLoading ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/recruiter-management")}
              className="px-6 py-2 bg-gray-200 rounded-md text-black text-sm hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
