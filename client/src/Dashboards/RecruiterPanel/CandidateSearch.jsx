import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import ProfileCard from "../../components/RecruiterComponents/CandidateProfileCard";
import { searchCandidates } from "../../features/slices/recruiterSlice";
import { LuX } from "react-icons/lu";

export default function CandidateSearch() {
  const dispatch = useDispatch();
  const location = useLocation();

  const searchBarRef = useRef(null);

  const Label = ({ children }) => (
    <label className="text-sm font-['Lato'] text-black">
      {children}
      <span className="text-red-500">*</span>
    </label>
  );

  const prefillQuery = location.state?.prefill || null;

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

  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [filters, setFilters] = useState({
    searchText: "",
    location: "",
    minExp: "",
    maxExp: "",
    designation: "",
    skills: [],
  });

  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");

  const filteredSkills = staticSkills.filter((skill) =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const handleAddNewSkill = (skill) => {
    if (!filters.skills.includes(skill)) {
      setFilters((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
    if (!staticSkills.includes(skill)) staticSkills.push(skill);
  };

  const handleSkillToggle = (skill) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const formattedResults = searchResults?.map((item) => ({
    ...item.source,
    _id: item.id,
  }));

  // SEARCH HANDLER WITH PAGINATION
  const handleSearch = (prefillParams = null, newPage = page) => {
    const params = prefillParams || {
      q: filters.searchText || undefined,
      location: filters.location || undefined,
      minExp: filters.minExp || undefined,
      maxExp: filters.maxExp || undefined,
      designation: filters.designation || undefined,
      skills: filters.skills.length > 0 ? filters.skills : undefined,
      page: newPage,
      size,
    };

    dispatch(searchCandidates(params))
      .unwrap()
      .then((res) => {
        const total = res.total || res.hits?.total?.value || 0;
        const computedPages = Math.ceil(total / size);
        setTotalPages(res.totalPages || computedPages || 1);
      });

    setShowResults(true);
  };

  useEffect(() => {
    if (showResults) handleSearch(null, page);
  }, [page]);

  useEffect(() => {
    if (showResults && searchResults?.length > 0) {
      setTimeout(() => {
        const scrollContainer = document.querySelector("main");
        scrollContainer?.scrollTo({
          top: searchBarRef.current.offsetTop - 20,
          behavior: "smooth",
        });
      }, 50);
    }
  }, [searchResults]);

  useEffect(() => {
    if (prefillQuery) {
      setFilters({
        searchText: prefillQuery.q || "",
        location: prefillQuery.location || "",
        minExp: prefillQuery.minExp || "",
        maxExp: prefillQuery.maxExp || "",
        designation: prefillQuery.designation || "",
        skills: Array.isArray(prefillQuery.skills)
          ? prefillQuery.skills
          : prefillQuery.skills
          ? [prefillQuery.skills]
          : [],
      });

      setPage(prefillQuery.page || 1);
      handleSearch(prefillQuery, prefillQuery.page || 1);
    }
  }, [prefillQuery]);

  return (
    <div className="w-full px-6 space-y-10">
      {/* HEADER */}
      <div ref={searchBarRef}>
        <h1 className="text-4xl font-serif font-bold text-black leading-[60px]">
          Candidate Search
        </h1>
        <p className="text-xl font-['Calibri'] text-zinc-500">
          Find the perfect candidates for your requirements
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-stone-50 outline outline-zinc-200 rounded-xl px-5 flex items-center gap-4">
          <input
            className="flex-1 text-sm bg-transparent outline-none text-zinc-500"
            placeholder="Search by name / company"
            value={filters.searchText}
            onChange={(e) => handleChange("searchText", e.target.value)}
          />

          <div className="w-px h-4 bg-zinc-400"></div>

          <input
            className="text-sm bg-transparent outline-none text-zinc-500"
            placeholder="Enter location"
            value={filters.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
        </div>

        <button
          onClick={() => {
            setPage(1);
            handleSearch(null, 1);
          }}
          className="bg-lime-400 text-black px-5 py-2 rounded-md flex items-center gap-2"
        >
          <FaSearch /> Search
        </button>

        {/* FILTER BUTTON FIXED */}
        <button
          className={`w-10 h-10 flex justify-center items-center rounded-md ${
            showFilters
              ? "bg-lime-400"
              : "bg-stone-50 outline outline-zinc-200"
          }`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
        </button>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="bg-white rounded-lg outline outline-zinc-200 p-6 space-y-6">
          <h2 className="text-lg font-bold">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LOCATION */}
            <div>
              <Label>Location</Label>
              <input
                list="locations"
                placeholder="Select or type location"
                className="w-full bg-stone-50 outline outline-zinc-200 rounded-md px-3 py-2 mt-1"
                value={filters.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
              <datalist id="locations">
                {staticLocations.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>

            {/* MIN EXP */}
            <div>
              <Label>Min Experience</Label>
              <input
                className="w-full bg-stone-50 outline outline-zinc-200 rounded-md px-3 py-2 mt-1"
                placeholder="e.g. 3"
                value={filters.minExp}
                onChange={(e) => handleChange("minExp", e.target.value)}
              />
            </div>

            {/* MAX EXP */}
            <div>
              <Label>Max Experience</Label>
              <input
                className="w-full bg-stone-50 outline outline-zinc-200 rounded-md px-3 py-2 mt-1"
                placeholder="e.g. 10"
                value={filters.maxExp}
                onChange={(e) => handleChange("maxExp", e.target.value)}
              />
            </div>

            {/* DESIGNATION */}
            <div>
              <Label>Designation</Label>
              <input
                list="designations"
                placeholder="Select or type designation"
                className="w-full bg-stone-50 outline outline-zinc-200 rounded-md px-3 py-2 mt-1"
                value={filters.designation}
                onChange={(e) => handleChange("designation", e.target.value)}
              />
              <datalist id="designations">
                {staticDesignations.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            {/* SKILLS */}
            <div className="relative">
              <Label>Skills</Label>

              <div
                className="w-full bg-stone-50 outline outline-zinc-200 rounded-md px-3 py-2 mt-1 cursor-pointer"
                onClick={() => setShowSkillsDropdown((prev) => !prev)}
              >
                {filters.skills.length === 0
                  ? "Select or add skill..."
                  : filters.skills.join(", ")}
              </div>

              {showSkillsDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white border shadow-md border-zinc-200 rounded-md p-3 space-y-3">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm"
                    placeholder="Search or add new skill..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && skillSearch.trim()) {
                        handleAddNewSkill(skillSearch.trim());
                        setSkillSearch("");
                      }
                    }}
                  />

                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredSkills.length === 0 && (
                      <p className="text-xs text-zinc-400">
                        Press Enter to add "{skillSearch}"
                      </p>
                    )}

                    {filteredSkills.map((skill) => (
                      <label
                        key={skill}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={filters.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                        {skill}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {filters.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {filters.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-2"
                    >
                      {skill}
                      <button
                        className="text-blue-700 font-bold"
                        onClick={() => handleSkillToggle(skill)}
                      >
                        <LuX />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setPage(1);
                handleSearch(null, 1);
              }}
              className="bg-lime-400 px-4 py-2 text-black rounded-md"
            >
              Apply Filters
            </button>

            <button
              onClick={() => window.location.reload()}
              className="bg-stone-50 outline outline-zinc-200 px-4 py-2 text-zinc-500 rounded-md"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {showResults && (
        <div className="space-y-6 mt-4">
          {searchLoading && <p>Searching candidates...</p>}
          {searchError && <p className="text-red-500">{searchError}</p>}

          {formattedResults?.map((item) => (
            <ProfileCard key={item._id} data={item} />
          ))}

          {!searchLoading && formattedResults?.length === 0 && (
            <p className="text-zinc-500">No candidates found.</p>
          )}

          {/* PAGINATION FIXED */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              {/* Prev */}
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className={`px-3 py-1 rounded-md border ${
                  page === 1
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-zinc-200"
                }`}
              >
                Prev
              </button>

              {/* Page Numbers */}
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded-md border ${
                      page === pageNum
                        ? "bg-lime-400 text-black"
                        : "hover:bg-zinc-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next */}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className={`px-3 py-1 rounded-md border ${
                  page === totalPages
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-zinc-200"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
