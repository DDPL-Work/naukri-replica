import React, { useEffect, useState } from "react";
import { FiSearch, FiEdit2, FiXCircle } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { listRecruiters, updateRecruiter } from "../../features/slices/adminSlice";
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

  // ADMIN AUTH CHECK
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
    } catch {
      setIsAdmin(false);
    }
  }, []);

  // FETCH RECRUITERS
  useEffect(() => {
    dispatch(listRecruiters());
  }, []);

  // TOASTS
  useEffect(() => {
    if (listError) toast.error(listError);
  }, [listError]);

  useEffect(() => {
    if (updateSuccess) toast.success("Recruiter updated successfully");
    if (updateError) toast.error(updateError);
  }, [updateSuccess, updateError]);

  // STATUS BADGE STYLE
  const badge = (active) => {
    const isActive = active === true;
    return (
      <span
        className={`px-3 py-0.5 rounded-full text-xs font-normal font-[Calibri] leading-4 ${
          isActive ? "bg-lime-400 text-black" : "bg-red-600 text-white"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  // FILTERING
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

  // UPDATE STATUS
  const toggleStatus = (id, currentStatus) => {
    dispatch(updateRecruiter({ id, updates: { active: !currentStatus } }));
  };

  // BLOCK NON-ADMINS
  if (!isAdmin) {
    return (
      <div className="p-10 text-center">
        <p className="text-2xl text-red-600 font-bold">Access Denied — Admin Only</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white p-10">
      {/* PAGE TITLE */}
      <div className="flex justify-between items-center w-full mb-3">
        <h1 className="text-black text-4xl font-bold font-serif leading-[60px]">
          Recruiter Management
        </h1>

        <Link
          to="/admin/recruiter-management/add"
          className="bg-lime-400 px-4 py-2 rounded-md 
            text-black text-base font-normal font-[Calibri]"
        >
          Add Recruiter
        </Link>
      </div>

      {/* SUBTITLE */}
      <p className="text-zinc-500 text-xl font-normal font-[Calibri] leading-6 mb-8">
        Manage recruiter accounts and permissions
      </p>

      {/* FILTER BOX */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-8">
        <h2 className="text-black text-2xl font-bold font-[Calibri] leading-6 mb-6">
          Filters
        </h2>

        <div className="flex gap-4 flex-wrap">
          {/* SEARCH */}
          <div className="relative flex-1 min-w-[300px]">
            <FiSearch className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 bg-[#FCFBF8] rounded-md pl-10 pr-4 border border-gray-300 
                text-zinc-500 text-sm font-normal font-[Calibri]"
            />
          </div>

          {/* STATUS DROPDOWN */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[180px] h-10 bg-[#FCFBF8] px-3 py-2 border border-gray-300 rounded-md 
                text-zinc-500 text-sm font-normal font-[Calibri] leading-5"
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
          <div className="grid grid-cols-12 items-center 
            text-white text-sm font-bold font-[Calibri] uppercase leading-5 tracking-wide"
          >
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
          <div className="p-6 text-center text-gray-500">No recruiters found</div>
        ) : (
          filteredRecruiters.map((r) => (
            <div key={r._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
              <div className="grid grid-cols-12 items-center px-8 py-3">

                {/* NAME */}
                <div className="col-span-3 text-black text-sm font-normal font-[Calibri] leading-5">
                  {r.name}
                </div>

                {/* EMAIL */}
                <div className="col-span-3 text-zinc-500 text-base font-normal font-[Calibri] leading-6">
                  {r.email}
                </div>

                {/* STATUS */}
                <div className="col-span-2">{badge(r.active)}</div>

                {/* DAILY LIMIT */}
                <div className="col-span-2 text-black text-xs font-bold font-[Calibri] leading-4">
                  {r.dailyDownloadLimit}
                </div>

                {/* ACTIONS */}
                <div className="col-span-2 flex items-center justify-center gap-3">
                  {/* EDIT */}
                  <button
                    onClick={() => navigate(`/admin/recruiter-management/edit/${r._id}`)}
                    className="w-6 h-6 flex items-center justify-center bg-gray-200 
                      text-black text-xs font-normal font-[Calibri] leading-4 rounded-sm hover:bg-orange-200"
                  >
                    <FiEdit2 size={15} />
                  </button>

                  {/* ACTIVATE / DEACTIVATE */}
                  <button
                    disabled={updateLoading}
                    onClick={() => toggleStatus(r._id, r.active)}
                    className={`flex items-center gap-1 px-3 py-1 rounded border text-xs font-normal font-[Calibri] leading-4
                      ${
                        r.active
                          ? "text-red-600 border-red-300"
                          : "text-green-700 border-green-300"
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
