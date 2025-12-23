import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import ProfileCard from "../../components/RecruiterComponents/CandidateProfileCard";
import {
  resetSearchState,
  restoreFromCache,
  searchCandidates,
  setSearchState,
} from "../../features/slices/recruiterSlice";
import { LuX } from "react-icons/lu";
import toast from "react-hot-toast";

export default function CandidateSearch() {
  const dispatch = useDispatch();
  const location = useLocation();

  const searchBarRef = useRef(null);
  const isRestoringRef = useRef(false);

  const Label = ({ children }) => (
    <label className="text-sm font-['Lato'] text-black">
      {children}
      <span className="text-red-500">*</span>
    </label>
  );

  const prefillQuery = location.state?.prefill || null;

  const { searchLoading, searchError } = useSelector(
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
    keywords: [],
  });

  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [showDesignationDropdown, setShowDesignationDropdown] = useState(false);
  const [designationQuery, setDesignationQuery] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const buildCacheKey = (filters, page, size) =>
    JSON.stringify({
      ...normalizeFilters(filters),
      page,
      size,
    });

  const normalizeFilters = (f) => ({
    searchText: f.searchText || "",
    location: f.location || "",
    minExp: f.minExp || "",
    maxExp: f.maxExp || "",
    designation: f.designation || "",
    skills: Array.isArray(f.skills) ? f.skills : [],
    keywords: Array.isArray(f.keywords) ? f.keywords : [],
  });

  const filteredSkills = staticSkills.filter((skill) =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const persistedSearchState = useSelector(
    (state) => state.recruiter.searchState
  );

  const { searchState, searchCache, searchResults } = useSelector(
    (state) => state.recruiter
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

  const handleAddKeyword = (value) => {
    const keyword = value.trim().toLowerCase();
    if (!keyword) return;

    setFilters((prev) => {
      const prevKeywords = Array.isArray(prev.keywords) ? prev.keywords : [];

      if (prevKeywords.includes(keyword)) return prev;

      return {
        ...prev,
        keywords: [...prevKeywords, keyword],
      };
    });

    setKeywordInput("");
  };

  const handleRemoveKeyword = (keyword) => {
    setFilters((prev) => ({
      ...prev,
      keywords: Array.isArray(prev.keywords)
        ? prev.keywords.filter((k) => k !== keyword)
        : [],
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

  const hasAnySearchInput = () => {
    return (
      filters.searchText.trim() ||
      filters.location.trim() ||
      filters.minExp !== "" ||
      filters.maxExp !== "" ||
      filters.designation.trim() ||
      (Array.isArray(filters.skills) && filters.skills.length > 0) ||
      (Array.isArray(filters.keywords) && filters.keywords.length > 0) ||
      keywordInput.trim()
    );
  };

  // SEARCH HANDLER WITH PAGINATION
  const handleSearch = (
    prefillParams = null,
    newPage = page,
    shouldPersist = true
  ) => {
    if (!prefillParams && !hasAnySearchInput()) {
      toast.error("Please enter at least one search criteria");
      return;
    }

    const params = prefillParams || {
      q: filters.searchText || undefined,
      location: filters.location || undefined,
      minExp: filters.minExp !== "" ? filters.minExp : undefined,
      maxExp: filters.maxExp !== "" ? filters.maxExp : undefined,
      designation: filters.designation || undefined,
      skills:
        Array.isArray(filters.skills) && filters.skills.length > 0
          ? filters.skills
          : undefined,

      keywords:
        Array.isArray(filters.keywords) && filters.keywords.length > 0
          ? filters.keywords
          : undefined,

      page: newPage,
      size,
    };

    const cacheKey = buildCacheKey(filters, newPage, size);

    // ✅ CHECK CACHE FIRST
    // const cached = persistedSearchState?.cache?.[cacheKey];
    const cached = searchCache[cacheKey];

    if (cached) {
      dispatch(restoreFromCache({ cacheKey }));
      // dispatch(
      //   setSearchState({
      //     filters: normalizeFilters(filters),
      //     page: newPage,
      //     size,
      //     showResults: true,
      //   })
      // );
      setShowResults(true);
      setTotalPages(Math.ceil(cached.total / size));
      // Restore results from cache
      return;
    }

    dispatch(
      searchCandidates({
        params,
        cacheKey,
      })
    )
      .unwrap()
      .then((res) => {
        const total = res.total || res.hits?.total?.value || 0;
        const computedPages = Math.ceil(total / size);
        setTotalPages(res.totalPages || computedPages || 1);
      });

    setShowResults(true);
  };

  const recruiterState = useSelector((state) => state.recruiter);

  useEffect(() => {
    console.log("🟢 REDUX STATE ON RENDER:", recruiterState);
  }, [recruiterState]);

  useEffect(() => {
    console.log("🔵 RESTORE EFFECT RUNNING");

    if (!persistedSearchState?.showResults) {
      console.log("🔴 NO persistedSearchState.showResults");
      return;
    }
    console.log(
      "🟢 RESTORING FILTERS FROM REDUX:",
      persistedSearchState.filters
    );
    // 🔁 Restore filters into local UI state
    setFilters(normalizeFilters(persistedSearchState.filters));
    setPage(persistedSearchState.page || 1);
    setShowResults(true);
  }, []);

  useEffect(() => {
    console.log("🟣 CACHE EFFECT RUNNING");
    // if (!persistedSearchState?.showResults) return;
    if (!persistedSearchState?.showResults) {
      console.log("🔴 CACHE: showResults false");
      return;
    }

    const restoredFilters = normalizeFilters(persistedSearchState.filters);

    const cacheKey = buildCacheKey(
      restoredFilters,
      persistedSearchState.page || 1,
      size
    );
    console.log("🟣 CACHE KEY:", cacheKey);
    console.log("🟣 CACHE ENTRY:", searchCache[cacheKey]);

    const cached = searchCache[cacheKey];

    // ✅ CACHE HIT → RESTORE UI ONLY
    if (cached) {
      setFilters(restoredFilters);
      setPage(persistedSearchState.page || 1);
      setShowResults(true);
      console.log("🟢 CACHE HIT → restoring results only");
      setTotalPages(Math.ceil(cached.total / size));
      return;
    }

    // ❌ CACHE MISS → API CALL
    console.log("🟡 CACHE MISS → API CALL");
    isRestoringRef.current = true;

    // setFilters(restoredFilters);
    // setPage(persistedSearchState.page || 1);
    setShowResults(true);

    requestAnimationFrame(() => {
      handleSearch(
        {
          q: restoredFilters.searchText || undefined,
          location: restoredFilters.location || undefined,
          minExp: restoredFilters.minExp || undefined,
          maxExp: restoredFilters.maxExp || undefined,
          designation: restoredFilters.designation || undefined,
          skills: restoredFilters.skills.length
            ? restoredFilters.skills
            : undefined,
          keywords: restoredFilters.keywords.length
            ? restoredFilters.keywords
            : undefined,
          page: persistedSearchState.page || 1,
          size,
        },
        persistedSearchState.page || 1,
        false
      );

      isRestoringRef.current = false;
    });
  }, []);

  useEffect(() => {
    console.log("🧪 FILTER STATE CHANGED:", filters);
  }, [filters]);

  useEffect(() => {
    setDesignationQuery(filters.designation || "");
  }, [filters.designation]);

  useEffect(() => {
    setLocationQuery(filters.location || "");
  }, [filters.location]);

  useEffect(() => {
    if (!showResults) return;
    if (isRestoringRef.current) return;

    const cacheKey = buildCacheKey(filters, page, size);
    if (searchCache[cacheKey]) return;

    handleSearch(null, page);
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

  // useEffect(() => {
  //   if (prefillQuery) {
  //     setFilters({
  //       searchText: prefillQuery.q || "",
  //       location: prefillQuery.location || "",
  //       minExp: prefillQuery.minExp || "",
  //       maxExp: prefillQuery.maxExp || "",
  //       designation: prefillQuery.designation || "",
  //       skills: Array.isArray(prefillQuery.skills)
  //         ? prefillQuery.skills
  //         : prefillQuery.skills
  //         ? [prefillQuery.skills]
  //         : [],
  //     });

  //     setPage(prefillQuery.page || 1);
  //     handleSearch(prefillQuery, prefillQuery.page || 1);
  //   }
  // }, [prefillQuery]);

  useEffect(() => {
    // 🚫 Do NOT override restored filters on back navigation
    if (!prefillQuery || persistedSearchState?.showResults) return;

    console.log("🟠 APPLYING PREFILL QUERY:", prefillQuery);

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
      keywords: [],
    });

    setPage(prefillQuery.page || 1);
    handleSearch(prefillQuery, prefillQuery.page || 1);
  }, [prefillQuery]);

  const skillsRef = useRef(null);
  const designationRef = useRef(null);
  const locationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (skillsRef.current && !skillsRef.current.contains(e.target)) {
        setShowSkillsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        designationRef.current &&
        !designationRef.current.contains(e.target)
      ) {
        setShowDesignationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDesignations = staticDesignations.filter((d) =>
    d.toLowerCase().includes(designationQuery.toLowerCase())
  );

  const filteredLocations = staticLocations.filter((loc) =>
    loc.toLowerCase().includes(locationQuery.toLowerCase())
  );

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
          // onClick={() => {
          //   setPage(1);
          //   dispatch(
          //     setSearchState({
          //       filters: normalizeFilters(filters),
          //       page: 1,
          //       size,
          //       showResults: true,
          //     })
          //   );
          //   handleSearch(null, 1);
          // }}
          onClick={() => {
            const payload = {
              filters: normalizeFilters(filters),
              page: 1,
              size,
              showResults: true,
            };

            console.log("🟡 SAVING SEARCH STATE:", payload);

            dispatch(setSearchState(payload));
            handleSearch(null, 1);
          }}
          className="bg-lime-400 text-black px-5 py-2 rounded-md flex items-center gap-2"
        >
          <FaSearch /> Search
        </button>

        {/* FILTER BUTTON FIXED */}
        <button
          className={`w-10 h-10 flex justify-center items-center rounded-md ${
            showFilters ? "bg-lime-400" : "bg-stone-50 outline outline-zinc-200"
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
            <div className="relative" ref={locationRef}>
              <Label>Location</Label>

              <input
                type="text"
                placeholder="Select or type location"
                className="w-full bg-stone-50 outline outline-zinc-200 rounded-md px-3 py-2 mt-1"
                value={locationQuery}
                onFocus={() => setShowLocationDropdown(true)}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  handleChange("location", e.target.value); // allow custom
                  setShowLocationDropdown(true);
                }}
              />

              {showLocationDropdown && (
                <div className="absolute z-50 w-full bg-white border border-zinc-200 rounded-md mt-1 shadow-md max-h-48 overflow-y-auto">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((loc) => (
                      <div
                        key={loc}
                        className="px-3 py-2 cursor-pointer hover:bg-zinc-100 text-sm"
                        onClick={() => {
                          handleChange("location", loc);
                          setLocationQuery(loc);
                          setShowLocationDropdown(false);
                        }}
                      >
                        {loc}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-zinc-500">
                      Press Enter to use "<strong>{locationQuery}</strong>"
                    </div>
                  )}
                </div>
              )}
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
            <div className="relative" ref={designationRef}>
              <Label>Designation</Label>

              <input
                type="text"
                placeholder="Select or type designation"
                className="w-full bg-stone-50 outline outline-zinc-200 rounded-md px-3 py-2 mt-1"
                value={designationQuery}
                onFocus={() => setShowDesignationDropdown(true)}
                onChange={(e) => {
                  setDesignationQuery(e.target.value);
                  handleChange("designation", e.target.value); // allow custom value
                  setShowDesignationDropdown(true);
                }}
              />

              {showDesignationDropdown && (
                <div className="absolute z-50 w-full bg-white border border-zinc-200 rounded-md mt-1 shadow-md max-h-48 overflow-y-auto">
                  {filteredDesignations.length > 0 ? (
                    filteredDesignations.map((d) => (
                      <div
                        key={d}
                        className="px-3 py-2 cursor-pointer hover:bg-zinc-100 text-sm"
                        onClick={() => {
                          handleChange("designation", d);
                          setDesignationQuery(d);
                          setShowDesignationDropdown(false);
                        }}
                      >
                        {d}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-zinc-500">
                      Press Enter to use "<strong>{designationQuery}</strong>"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SKILLS */}
            <div ref={skillsRef}>
              <Label>Skills</Label>

              <div className="flex gap-3 items-start mt-1">
                {/* LEFT: INPUT + DROPDOWN */}
                <div className="relative w-[260px]">
                  <div
                    className="w-full bg-stone-50 outline outline-zinc-200 rounded-md px-3 py-2 cursor-pointer text-sm text-zinc-600"
                    onClick={() => setShowSkillsDropdown((prev) => !prev)}
                  >
                    {!Array.isArray(filters.skills) ||
                    filters.skills.length === 0
                      ? "Select or add skill..."
                      : "Edit skills"}
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
                        {filteredSkills.length === 0 && skillSearch.trim() && (
                          <p className="text-xs text-zinc-400">
                            Press Enter to add "{skillSearch}"
                          </p>
                        )}

                        {filteredSkills.map((skill) => (
                          <label
                            key={skill}
                            className="flex items-center gap-2 text-sm cursor-pointer"
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
                </div>

                {/* RIGHT: SELECTED SKILLS */}
                {Array.isArray(filters.skills) && filters.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 max-w-[300px] max-h-24 overflow-y-auto">
                    {filters.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
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

            {/* ===== KEYWORDS ===== */}
            <div>
              <Label>Resume Keywords</Label>

              <div className="mt-1 space-y-2">
                <input
                  type="text"
                  placeholder="Type keyword and press Enter"
                  className="w-full bg-stone-50 outline outline-zinc-200 rounded-md px-3 py-2 text-sm"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKeyword(keywordInput);
                    }
                  }}
                />

                {/* Keyword Chips */}
                {Array.isArray(filters.keywords) &&
                  filters.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {filters.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-2"
                        >
                          {kw}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(kw)}
                            className="font-bold"
                          >
                            <LuX size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setPage(1);
                dispatch(
                  setSearchState({
                    filters: normalizeFilters(filters),
                    page: 1,
                    size,
                    showResults: true,
                  })
                );
                handleSearch(null, 1);
              }}
              className="bg-lime-400 px-4 py-2 text-black rounded-md"
            >
              Apply Filters
            </button>

            <button
              onClick={() => {
                console.log("🔴 RESET CLICKED — CLEARING FILTERS");
                dispatch(resetSearchState());
                setFilters({
                  searchText: "",
                  location: "",
                  minExp: "",
                  maxExp: "",
                  designation: "",
                  skills: [],
                  keywords: [],
                });
                setPage(1);
                setShowResults(false);
              }}
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
            <ProfileCard
              key={item._id}
              data={item}
              searchState={{
                filters,
                page,
                size,
                showResults,
              }}
            />
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
