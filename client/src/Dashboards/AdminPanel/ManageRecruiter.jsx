import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiEdit2, FiXCircle, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteRecruiter,
  fetchRecruiterUsageToday,
  listRecruiters,
  updateRecruiter,
} from "../../features/slices/adminSlice";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import toast from "react-hot-toast";

export default function RecruiterManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    recruiters,
    listLoading,
    listError,
    updateLoading,
    updateError,
    updateSuccess,
    recruiterUsageData,
  } = useSelector((state) => state.admin);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isAdmin, setIsAdmin] = useState(false);

  // -----------------------------
  // ADMIN AUTH CHECK
  // -----------------------------
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

  // -----------------------------
  // FETCH DATA
  // -----------------------------
  useEffect(() => {
    dispatch(listRecruiters());
    dispatch(fetchRecruiterUsageToday());
  }, []);

  // -----------------------------
  // TOASTS
  // -----------------------------
  useEffect(() => {
    if (listError) toast.error(listError);
  }, [listError]);

  useEffect(() => {
    if (updateSuccess) toast.success("Recruiter updated successfully");
    if (updateError) toast.error(updateError);
  }, [updateSuccess, updateError]);
  

  // -----------------------------
  // USAGE MAP (recruiterId -> usedToday)
  // -----------------------------
  const usageMap = useMemo(() => {
    const map = {};
    recruiterUsageData?.recruiters?.forEach((u) => {
      map[u.recruiterId] = u.usedToday;
    });
    return map;
  }, [recruiterUsageData]);

  // -----------------------------
  // FILTERING
  // -----------------------------
  const filteredRecruiters = recruiters.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All Status"
        ? true
        : statusFilter === "Active"
        ? r.active
        : !r.active;

    return matchSearch && matchStatus;
  });

  // -----------------------------
  // ACTIONS
  // -----------------------------
  const toggleStatus = (id, currentStatus) => {
    dispatch(updateRecruiter({ id, updates: { active: !currentStatus } }));
  };

  const handleDelete = (id, name) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-semibold">
            Delete recruiter <span className="text-red-600">{name}</span>?
          </p>
          <p className="text-sm text-gray-500">
            This action is permanent and cannot be undone.
          </p>

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm border rounded"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                dispatch(deleteRecruiter(id));
                toast.dismiss(t.id);
                toast.success("Recruiter deleted permanently");
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  // -----------------------------
  // ACCESS BLOCK
  // -----------------------------
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
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-4xl font-bold">Recruiter Management</h1>

        <Link
          to="/admin/recruiter-management/add"
          className="bg-lime-400 px-4 py-2 rounded-md text-black"
        >
          Add Recruiter
        </Link>
      </div>

      <p className="text-zinc-500 text-xl mb-6">
        Manage recruiter accounts and permissions
      </p>

      {/* ================= GLOBAL USAGE ================= */}
      {/* {recruiterUsageData?.global && (
        <div className="mb-8 bg-[#F9FAFB] border border-gray-300 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3">Download Usage (Today)</h2>

          <div className="flex gap-8 text-sm">
            <div>
              Used:{" "}
              <b className="text-red-600">
                {recruiterUsageData.global.usedToday}
              </b>
            </div>
            <div>
              Total Limit: <b>{recruiterUsageData.global.totalLimit}</b>
            </div>
            <div>
              Remaining:{" "}
              <b className="text-green-700">
                {recruiterUsageData.global.remainingToday}
              </b>
            </div>
          </div>
        </div>
      )} */}

      {/* ================= FILTERS ================= */}
      <div className="border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="w-full h-10 pl-10 border border-gray-200 focus:outline-gray-300 rounded-md"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 border border-gray-200 rounded-md px-3"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#10407E] text-white px-8 py-3 grid grid-cols-12 font-bold text-sm">
          <div className="col-span-3">Recruiter</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Usage (Today)</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {listLoading ? (
          <div className="p-6 text-center">Loading recruiters...</div>
        ) : (
          filteredRecruiters.map((r) => {
            const usedToday = usageMap[r._id] || 0;

            return (
              <div
                key={r._id}
                className="grid grid-cols-12 px-8 py-3 border-b border-gray-200 items-center"
              >
                <div className="col-span-3">{r.name}</div>
                <div className="col-span-3 text-gray-600">{r.email}</div>
                <div className="col-span-2">
                  {r.active ? "Active" : "Inactive"}
                </div>
                <div className="col-span-2 font-medium text-gray-800">
                  {usedToday} / {r.dailyDownloadLimit}
                </div>

                <div className="col-span-2 flex justify-center gap-3">
                  {/* EDIT */}
                  <button
                    type="button"
                    onClick={(e) => {
                      console.log("EDIT CLICKED", r._id);
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/admin/recruiter-management/edit/${r._id}`);
                    }}
                    className="w-6 h-6 flex items-center justify-center 
             bg-gray-200 hover:bg-orange-200 rounded-sm"
                  >
                    <FiEdit2 size={15} />
                  </button>

                  {/* ACTIVATE / DEACTIVATE */}
                  <button
                    disabled={updateLoading}
                    onClick={() => toggleStatus(r._id, r.active)}
                    className={`flex items-center gap-1 px-3 py-1 rounded border text-xs font-normal font-[Calibri] leading-4 ${
                      r.active
                        ? "text-red-600 border-red-300"
                        : "text-green-700 border-green-300"
                    }`}
                  >
                    <FiXCircle size={14} />
                    {r.active ? "Deactivate" : "Activate"}{" "}
                  </button>

                  <button
                    onClick={() => handleDelete(r._id, r.name)}
                    className="text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
