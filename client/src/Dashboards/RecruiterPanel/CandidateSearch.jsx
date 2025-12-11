import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import ProfileCard from "../../components/RecruiterComponents/CandidateProfileCard";
import { searchCandidates, setSearchState } from "../../features/slices/recruiterSlice";
import { LuX } from "react-icons/lu";


 // ADD THIS COMPONENT
  const Label = ({ children }) => (
    <label className="text-sm font-semibold text-zinc-700">
      {children}
    </label>
  );

export default function CandidateSearch() {
  const dispatch = useDispatch();
  const location = useLocation();

  // SCROLL REF
  const searchBarRef = useRef(null);

  const { searchLoading, searchError, searchResults, searchState } = useSelector(
    (state) => state.recruiter
  );

  const prefillQuery = location.state?.prefill || null;

  const staticLocations = [
    "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai",
    "Pune", "Noida", "Gurgaon", "Kolkata", "Jaipur",
  ];

  const staticSkills = [
    "React", "Node.js", "JavaScript", "Python", "MongoDB",
    "Express.js", "Java", "Angular", "DevOps", "UI/UX",
  ];

  const staticDesignations = [
    "Software Engineer", "Full Stack Developer", "Backend Developer",
    "Frontend Developer", "Team Lead", "Senior Developer",
    "Project Manager", "Data Analyst",
  ];

  // RESTORED STATE OR FRESH
  const [filters, setFilters] = useState(searchState.filters || {
    searchText: "",
    location: "",
    minExp: "",
    maxExp: "",
    designation: "",
    skills: [],
  });

  const [page, setPage] = useState(searchState.page || 1);
  const [size] = useState(searchState.size || 20);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(searchState.showResults || false);

  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");

  const filteredSkills = staticSkills.filter((skill) =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // SEARCH FUNCTION (NO CHANGE)
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
        setTotalPages(Math.ceil(total / size));

        // SAVE current state for future return
        dispatch(
          setSearchState({
            filters,
            page: newPage,
            size,
            showResults: true,
          })
        );
      });

    setShowResults(true);
  };

  // RESTORE FROM PROFILE PAGE RETURN
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
      setShowResults(true);

      // DO NOT call API if results already exist
      if (searchResults.length > 0) return;

      handleSearch(prefillQuery, prefillQuery.page || 1);
    }
  }, [prefillQuery]);

  // ON MOUNT: Restore persisted state
  useEffect(() => {
    if (searchState.showResults && searchResults.length > 0) {
      setFilters(searchState.filters);
      setPage(searchState.page);
      setShowResults(true);
    }
  }, []);

  // HANDLE PAGINATION CHANGE
  useEffect(() => {
    if (showResults) {
      handleSearch(null, page);
    }
  }, [page]);

  // AUTO-SCROLL TO RESULTS
  useEffect(() => {
    if (showResults && searchResults.length > 0) {
      setTimeout(() => {
        const scrollContainer = document.querySelector("main");
        scrollContainer?.scrollTo({
          top: searchBarRef.current.offsetTop - 20,
          behavior: "smooth",
        });
      }, 50);
    }
  }, [searchResults]);

  const formattedResults = searchResults?.map((item) => ({
    ...item.source,
    _id: item.id,
  }));

  return (
    <div className="w-full px-6 space-y-10">

      {/* SEARCH HEADER */}
      <div ref={searchBarRef}>
        <h1 className="text-4xl font-serif font-bold text-black leading-[60px]">
          Candidate Search
        </h1>
        <p className="text-xl text-zinc-500">Find the perfect candidates</p>
      </div>

      {/* SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-stone-50 outline outline-1 outline-zinc-200 rounded-xl px-5 flex items-center gap-4">
          <input
            className="flex-1 text-sm bg-transparent outline-none"
            placeholder="Search by name / skills / designation"
            value={filters.searchText}
            onChange={(e) => handleChange("searchText", e.target.value)}
          />

          <div className="w-px h-4 bg-zinc-400"></div>

          <input
            className="text-sm bg-transparent outline-none"
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
          className="bg-lime-400 px-5 py-2 rounded-md flex items-center gap-2"
        >
          <FaSearch /> Search
        </button>

        <button
          className={`w-10 h-10 flex justify-center items-center rounded-md ${
            showFilters ? "bg-lime-400" : "bg-stone-50 outline outline-1"
          }`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
        </button>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="bg-white rounded-lg  outline-1 outline-zinc-200 p-6 space-y-6">
          <h2 className="text-lg font-bold">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Location</Label>
              <input
                list="locations"
                className="w-full bg-stone-50  outline-1 outline-zinc-300 rounded-md px-3 py-2 mt-1"
                value={filters.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
              <datalist id="locations">
                {staticLocations.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>

            <div>
              <Label>Min Experience</Label>
              <input
                className="w-full bg-stone-50  outline-1 outline-zinc-300 rounded-md px-3 py-2 mt-1"
                value={filters.minExp}
                onChange={(e) => handleChange("minExp", e.target.value)}
              />
            </div>

            <div>
              <Label>Max Experience</Label>
              <input
                className="w-full bg-stone-50  outline-1 outline-zinc-300 rounded-md px-3 py-2 mt-1"
                value={filters.maxExp}
                onChange={(e) => handleChange("maxExp", e.target.value)}
              />
            </div>

            <div>
              <Label>Designation</Label>
              <input
                list="designations"
                className="w-full bg-stone-50  outline-1 outline-zinc-300 rounded-md px-3 py-2 mt-1"
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
                className="w-full bg-stone-50  outline-1 outline-zinc-300 rounded-md px-3 py-2 mt-1 cursor-pointer"
                onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
              >
                {filters.skills.length === 0
                  ? "Select or add skill..."
                  : filters.skills.join(", ")}
              </div>

              {showSkillsDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white border shadow-md rounded-md p-3 space-y-3">
                  <input
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="Search or add new skill..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && skillSearch.trim()) {
                        handleSkillToggle(skillSearch.trim());
                        setSkillSearch("");
                      }
                    }}
                  />

                  <div className="max-h-40 overflow-y-auto">
                    {filteredSkills.map((skill) => (
                      <label key={skill} className="flex items-center gap-2 text-sm">
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
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setPage(1);
                handleSearch(null, 1);
              }}
              className="bg-lime-400 px-4 py-2 rounded-md"
            >
              Apply Filters
            </button>

            <button
              onClick={() => window.location.reload()}
              className="bg-stone-50 outline px-4 py-2 rounded-md"
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
            <ProfileCard
              key={item._id}
              data={item}
              searchState={{
                filters,
                page,
                size,
                showResults: true,
              }}
            />
          ))}

          {!searchLoading && formattedResults?.length === 0 && (
            <p className="text-gray-500">No candidates found.</p>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-md border"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded-md border ${
                      page === pageNum ? "bg-lime-400" : ""
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-md border"
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
