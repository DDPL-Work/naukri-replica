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

  // -----------------------------
  // LOAD RECRUITER DATA
  // -----------------------------
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

  // -----------------------------
  // LISTEN FOR UPDATE STATUS
  // -----------------------------
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

  // -----------------------------
  // SUBMIT FORM
  // -----------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    const updates = {
      name: formData.name,
      email: formData.email,
      active: formData.active,
      dailyDownloadLimit: Number(formData.dailyDownloadLimit),
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
      {/* PAGE TITLE */}
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
        <h2 className="text-black text-2xl font-bold font-[Calibri] leading-6 mb-6">
          Edit Recruiter
        </h2>

        {/* FORM GRID */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">

            {/* FULL NAME */}
            <div>
              <label className="block text-black text-sm font-[Calibri] mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => changeHandler("name", e.target.value)}
                className="w-full h-10 bg-[#FCFBF8] border border-[#E0E5EB] 
                           rounded-md px-3 text-sm text-[#808080] font-[Calibri]"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-black text-sm font-[Calibri] mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                readOnly
                className="w-full h-10 bg-gray-200 border border-[#E0E5EB] 
                           rounded-md px-3 text-sm text-gray-600 font-[Calibri] cursor-not-allowed"
                placeholder="recruiter@company.com"
              />
            </div>

            {/* DAILY LIMIT */}
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
                           rounded-md px-3 text-sm font-[Calibri]"
                required
              />
            </div>

            {/* STATUS */}
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
                           rounded-md px-3 text-sm font-[Calibri]"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-black text-sm font-[Calibri] mb-2">
                Password (optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  placeholder="Enter new password"
                  onChange={(e) => changeHandler("password", e.target.value)}
                  className="w-full h-10 bg-[#FCFBF8] border border-[#E0E5EB] 
                             rounded-md px-3 text-sm text-[#808080] font-[Calibri]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              <p className="text-[#808080] text-xs font-[Tahoma] mt-1">
                Leave blank to keep existing password
              </p>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-10 flex gap-4">
            <button
              type="submit"
              disabled={updateLoading}
              className={`px-6 py-2 bg-[#A1DB40] rounded-md text-black text-sm font-[Calibri]
                ${updateLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {updateLoading ? "Saving..." : "Save Changes"}
            </button>

            {/* CANCEL BUTTON */}
            <button
              type="button"
              onClick={() => navigate("/admin/recruiter-management")}
              className="px-6 py-2 bg-gray-200 rounded-md text-black text-sm font-[Calibri] hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
