import React, { useEffect, useState } from "react";
import { FiSearch, FiEdit2, FiXCircle } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  listRecruiters,
  updateRecruiter,
} from "../../features/slices/adminSlice";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import toast from "react-hot-toast";

export default function RecruiterManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { recruiters, listLoading, listError, updateLoading, updateError, updateSuccess } =
    useSelector((state) => state.admin);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isAdmin, setIsAdmin] = useState(false);

  // -------------------------------
  // VERIFY ADMIN + SET TOKEN
  // -------------------------------
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      if (decoded.role === "ADMIN") {
        setIsAdmin(true);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        toast.error("Access denied — Admin only");
      }
    } catch (err) {
      setIsAdmin(false);
    }
  }, []);

  // -------------------------------
  // FETCH RECRUITERS
  // -------------------------------
  useEffect(() => {
    dispatch(listRecruiters());
  }, []);

  // -------------------------------
  // TOAST ALERTS FOR LIST & UPDATE
  // -------------------------------
  useEffect(() => {
    if (listError) toast.error(listError);
  }, [listError]);

  useEffect(() => {
    if (updateSuccess) toast.success("Recruiter updated successfully");
    if (updateError) toast.error(updateError);
  }, [updateSuccess, updateError]);

  // -------------------------------
  // BADGE COMPONENT
  // -------------------------------
  const badge = (active) => {
    const isActive = active === true;
    return (
      <span
        className={`px-3 py-0.5 text-xs font-[Calibri] rounded-full ${
          isActive ? "bg-lime-400 text-black" : "bg-red-600 text-white"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  // -------------------------------
  // FILTERED DATA
  // -------------------------------
  const filteredRecruiters = recruiters.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All Status"
        ? true
        : statusFilter === "Active"
        ? r.active === true
        : r.active === false;

    return matchSearch && matchStatus;
  });

  // -------------------------------
  // TOGGLE ACTIVE/INACTIVE
  // -------------------------------
  const toggleStatus = async (id, currentStatus) => {
    dispatch(
      updateRecruiter({
        id,
        updates: { active: !currentStatus },
      })
    );
  };

  // -------------------------------
  // BLOCK NON-ADMINS
  // -------------------------------
  if (!isAdmin) {
    return (
      <div className="p-10 text-center">
        <p className="text-2xl text-red-600 font-bold">
          Access Denied — Admin Only
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white p-10">
      {/* PAGE TITLE */}
      <div className="flex justify-between items-center w-full mb-3">
        <h1 className="text-[40px] leading-[60px] font-bold font-serif text-black">
          Recruiter Management
        </h1>

        <Link
          to="/admin/recruiter-management/add"
          className="bg-lime-400 px-4 py-2 rounded-md font-[Calibri] text-[16px] text-black"
        >
          Add Recruiter
        </Link>
      </div>

      <p className="text-[20px] text-[#808080] font-[Calibri] leading-6 mb-8">
        Manage recruiter accounts and permissions
      </p>

      {/* FILTER BOX */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-[24px] font-bold font-[Calibri] leading-6 mb-6">
          Filters
        </h2>

        <div className="flex gap-4 flex-wrap">
          {/* Search Field */}
          <div className="relative flex-1 min-w-[300px]">
            <FiSearch
              className="absolute left-3 top-3 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 bg-[#FCFBF8] rounded-md pl-10 pr-4 border border-gray-300 
                         text-sm font-[Calibri] text-[#808080]"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[180px] h-10 bg-[#FCFBF8] px-3 py-2 border border-gray-300 rounded-md 
                       text-sm text-[#808080] font-[Calibri]"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        {/* TABLE HEADER */}
        <div className="bg-[#10407E] text-white px-8 py-3">
          <div className="grid grid-cols-12 items-center font-[Calibri] text-sm font-bold uppercase">
            <div className="col-span-3">Recruiter Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Daily Limit</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
        </div>

        {/* TABLE BODY */}
        {listLoading ? (
          <div className="p-6 text-center">Loading recruiters...</div>
        ) : filteredRecruiters.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No recruiters found
          </div>
        ) : (
          filteredRecruiters.map((r) => (
            <div
              key={r._id}
              className="border-b border-gray-200 hover:bg-gray-50 transition"
            >
              <div className="grid grid-cols-12 items-center px-8 py-3">
                {/* NAME */}
                <div className="col-span-3 text-sm font-[Calibri] text-black">
                  {r.name}
                </div>

                {/* EMAIL */}
                <div className="col-span-3 text-sm font-[Calibri] text-gray-600">
                  {r.email}
                </div>

                {/* STATUS */}
                <div className="col-span-2">{badge(r.active)}</div>

                {/* DAILY LIMIT (read-only now) */}
                <div className="col-span-2 text-sm font-[Calibri]">
                  {r.dailyDownloadLimit}
                </div>

                {/* ACTIONS */}
                <div className="col-span-2 flex items-center justify-center gap-3">
                  {/* EDIT BUTTON */}
                  <button
                    onClick={() =>
                      navigate(`/admin/recruiter-management/edit/${r._id}`)
                    }
                    className="text-gray-600 bg-gray-200 w-6 h-6 rounded-sm flex items-center justify-center hover:bg-orange-200 hover:text-black"
                  >
                    <FiEdit2 size={15} />
                  </button>

                  {/* ACTIVATE / DEACTIVATE */}
                  <button
                    disabled={updateLoading}
                    onClick={() => toggleStatus(r._id, r.active)}
                    className={`flex items-center gap-1 px-3 py-1 rounded border text-xs font-[Calibri] bg-[#FCFBF8] ${
                      r.active
                        ? "border-red-300 text-red-600"
                        : "border-green-300 text-green-700"
                    }`}
                  >
                    <FiXCircle size={14} />
                    {r.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
