import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaFilter } from "react-icons/fa";
import ProfileCard from "../../components/RecruiterComponents/CandidateProfileCard";
import { searchCandidates } from "../../features/slices/recruiterSlice";

export default function CandidateSearch() {
  const dispatch = useDispatch();
  const { searchLoading, searchError, searchResults } = useSelector(
    (state) => state.recruiter
  );

  const staticLocations = [
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Noida",
    "Gurgaon",
    "Kolkata",
    "Jaipur",
  ];

  const staticSkills = [
    "React",
    "Node.js",
    "JavaScript",
    "Python",
    "MongoDB",
    "Express.js",
    "Java",
    "Angular",
    "DevOps",
    "UI/UX",
  ];

  const staticDesignations = [
    "Software Engineer",
    "Full Stack Developer",
    "Backend Developer",
    "Frontend Developer",
    "Team Lead",
    "Senior Developer",
    "Project Manager",
    "Data Analyst",
  ];

  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [filters, setFilters] = useState({
    searchText: "",
    location: "",
    minExp: "",
    maxExp: "",
    designation: "",
    skills: "",
  });

  const formattedResults = searchResults?.map((item) => ({
    ...item.source,
    _id: item.id,
  }));

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const params = {
      q: filters.searchText || undefined,
      location: filters.location || undefined,
      minExp: filters.minExp || undefined,
      maxExp: filters.maxExp || undefined,
      designation: filters.designation || undefined,
      skills: filters.skills
        ? filters.skills.split(",").map((s) => s.trim())
        : undefined,
      page: 1,
      size: 20,
    };

    dispatch(searchCandidates(params));
    setShowResults(true);

    setTimeout(() => {
      window.scrollTo({ top: 400, behavior: "smooth" });
    }, 200);
  };

  return (
    <div className="w-full px-6 space-y-10">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-4xl font-serif font-bold leading-[60px] text-black">
          Candidate Search
        </h1>
        <p className="text-xl font-['Calibri'] text-zinc-500 leading-6">
          Find the perfect candidates for your requirements
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1 bg-stone-50  outline-1 outline-zinc-200 rounded-xl p-5 flex items-center gap-4">
          {/* Search text */}
          <input
            className="flex-1 text-sm font-['Calibri'] text-zinc-500 bg-transparent outline-none"
            placeholder="Search by name / designation / skills / company"
            onChange={(e) => handleChange("searchText", e.target.value)}
          />

          <div className="w-px h-4 bg-zinc-400"></div>

          {/* Location */}
          <input
            className="text-sm font-['Calibri'] text-zinc-500 bg-transparent outline-none"
            placeholder="Enter location"
            onChange={(e) => handleChange("location", e.target.value)}
          />
        </div>

        {/* SEARCH BUTTON */}
        <button
          className="bg-lime-400 px-5 py-2 rounded-md flex items-center gap-2 text-black text-base font-['Calibri']"
          onClick={handleSearch}
        >
          <FaSearch /> Search
        </button>

        {/* FILTER TOGGLE */}
        <button
          className={`w-10 h-10 flex justify-center items-center rounded-md ${
            showFilters
              ? "bg-lime-400"
              : "bg-stone-50  outline-1 outline-zinc-200"
          }`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
        </button>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="bg-white rounded-lg  outline-1 outline-zinc-200 p-6 space-y-6">
          <h2 className="text-lg font-['Lato'] font-bold">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LOCATION */}
            <div>
              <label className="text-sm font-['Lato'] text-black">
                Location
              </label>

              <select
                className="w-full bg-stone-50  outline-1 outline-zinc-200 rounded-md px-3 py-2 mt-1 text-sm text-zinc-500"
                onChange={(e) => handleChange("location", e.target.value)}
              >
                <option value="">Select location</option>
                {staticLocations.map((loc) => (
                  <option key={loc}>{loc}</option>
                ))}
              </select>

              <input
                placeholder="Or enter custom"
                className="w-full bg-stone-50  outline-1 outline-zinc-200 rounded-md px-3 py-2 mt-2 text-sm text-zinc-500"
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>

            {/* MIN EXP */}
            <div>
              <label className="text-sm font-['Lato'] text-black">
                Min Experience
              </label>
              <input
                placeholder="e.g., 3"
                className="w-full bg-stone-50  outline-1 outline-zinc-200 rounded-md px-3 py-2 mt-1 text-sm text-zinc-500"
                onChange={(e) => handleChange("minExp", e.target.value)}
              />
            </div>

            {/* MAX EXP */}
            <div>
              <label className="text-sm font-['Lato'] text-black">
                Max Experience
              </label>
              <input
                placeholder="e.g., 10"
                className="w-full bg-stone-50  outline-1 outline-zinc-200 rounded-md px-3 py-2 mt-1 text-sm text-zinc-500"
                onChange={(e) => handleChange("maxExp", e.target.value)}
              />
            </div>

            {/* DESIGNATION */}
            <div>
              <label className="text-sm font-['Lato'] text-black">
                Designation
              </label>

              <select
                className="w-full bg-stone-50  outline-1 outline-zinc-200 rounded-md px-3 py-2 mt-1 text-sm text-zinc-500"
                onChange={(e) => handleChange("designation", e.target.value)}
              >
                <option value="">Select designation</option>
                {staticDesignations.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              <input
                placeholder="Or enter custom"
                className="w-full bg-stone-50  outline-1 outline-zinc-200 rounded-md px-3 py-2 mt-2 text-sm text-zinc-500"
                onChange={(e) => handleChange("designation", e.target.value)}
              />
            </div>

            {/* SKILLS */}
            <div>
              <label className="text-sm font-['Lato'] text-black">Skills</label>

              <select
                className="w-full bg-stone-50  outline-1 outline-zinc-200 rounded-md px-3 py-2 mt-1 text-sm text-zinc-500"
                onChange={(e) => handleChange("skills", e.target.value)}
              >
                <option value="">Select skill</option>
                {staticSkills.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              <input
                placeholder="Comma-separated skills"
                className="w-full bg-stone-50  outline-1 outline-zinc-200 rounded-md px-3 py-2 mt-2 text-sm text-zinc-500"
                onChange={(e) => handleChange("skills", e.target.value)}
              />
            </div>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSearch}
              className="bg-lime-400 text-black text-sm font-['Calibri'] px-4 py-2 rounded-md"
            >
              Apply Filters
            </button>

            <button
              className="bg-stone-50  outline-1 outline-zinc-200 text-zinc-500 text-sm px-4 py-2 rounded-md"
              onClick={() => window.location.reload()}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* RESULTS SECTION */}
      {showResults && (
        <div className="space-y-6 mt-4">
          {searchLoading && <p>Searching candidates...</p>}
          {searchError && <p className="text-red-500">{searchError}</p>}

          {formattedResults?.map((item) => (
            <ProfileCard key={item._id} data={item} />
          ))}

          {!searchLoading && searchResults?.length === 0 && (
            <p className="text-zinc-500">No candidates found.</p>
          )}
        </div>
      )}
    </div>
  );
}
