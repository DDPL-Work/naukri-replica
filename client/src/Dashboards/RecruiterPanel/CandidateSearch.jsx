import React, { useState } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import ProfileCard from "../../components/RecruiterComponents/CandidateProfileCard";

export default function CandidateSearch() {
  const [filters, setFilters] = useState({
    jobType: "",
    searchText: "",
    location: "",
    qualification: "",
    minExp: "",
    maxExp: "",
    designation: "",
    expectedCtc: "",
    skills: "",
  });

  const [showResults, setShowResults] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const candidates = [
    {
      name: "John Doe",
      role: "Senior Full Stack Developer",
      experience: "8 years",
      company: "Tech Corp",
      postedOn: "2025-01-15",
      ctc: "₹25 LPA",
      location: "Bangalore",
      applyDate: "2025-01-10",
      skills: ["React", "Node.js", "TypeScript", "AWS"],
    },
    {
      name: "James Smith",
      role: "UI/UX Designer",
      experience: "5 years",
      company: "Creative Studio",
      postedOn: "2025-01-12",
      ctc: "₹18 LPA",
      location: "Mumbai",
      applyDate: "2025-01-09",
      skills: ["Figma", "Adobe XD", "Wireframing"],
    },
  ];

  const handleSearch = () => {
    setShowResults(true);
  };

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full space-y-8 ">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Candidate Search
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Find the perfect candidates for your requirements
        </p>
      </div>

      <div className="mr-15 space-y-[24px]">
        {/* SEARCH BAR */}
      <div className="flex items-center justify-between mr-4">
        {/* LEFT SEARCH BAR */}
        <div className="flex items-center w-full bg-[#f8f9f7] border border-gray-300 rounded-xl px-4 py-3 gap-4">
          {/* Job Type Dropdown */}
          <select
            className="bg-transparent text-gray-700 text-sm focus:outline-none"
            onChange={(e) => handleChange("jobType", e.target.value)}
          >
            <option value="">Select job type</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
          </select>

          {/* Divider */}
          <span className="text-gray-400">|</span>

          {/* Search Text */}
          <input
            type="text"
            placeholder="Search by name / designation / skills / company"
            className="bg-transparent flex-1 text-sm text-gray-700 focus:outline-none"
            onChange={(e) => handleChange("searchText", e.target.value)}
          />

          {/* Divider */}
          <span className="text-gray-400">|</span>

          {/* Location */}
          <input
            type="text"
            placeholder="Enter location"
            className="bg-transparent text-sm text-gray-700 focus:outline-none"
            onChange={(e) => handleChange("location", e.target.value)}
          />
        </div>

        {/* SEARCH BUTTON */}
        <button
          className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-black px-6 py-2 rounded-md ml-3"
          onClick={handleSearch}
        >
          <FaSearch /> Search
        </button>

        {/* FILTER BUTTON */}
        <button
          className={`ml-3 px-4 py-3 rounded-md  transition-colors 
      ${
        filterOpen
          ? "bg-lime-500 text-black"
          : "text-gray-700 hover:bg-gray-100"
      }`}
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <FaFilter />
        </button>
      </div>

      {/* FILTER SECTION */}
      {filterOpen && (
        <div className="border border-gray-200 rounded-2xl bg-white py-8 px-10 shadow-sm animate-fadeIn">
          <h2 className="text-xl font-semibold mb-8 text-gray-900">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                className="w-full border border-gray-300 bg-[#fafafa] rounded-md px-3 py-2 text-gray-700 focus:outline-lime-500"
                onChange={(e) => handleChange("location", e.target.value)}
              >
                <option value="">Select location</option>
                <option>Bangalore</option>
                <option>Mumbai</option>
                <option>Delhi</option>
              </select>
            </div>

            {/* Min Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Experience
              </label>
              <input
                type="number"
                placeholder="e.g., 3"
                className="w-full border border-gray-300 bg-[#fafafa] rounded-md px-3 py-2 text-gray-700 focus:outline-lime-500"
                onChange={(e) => handleChange("minExp", e.target.value)}
              />
            </div>

            {/* Max Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Experience
              </label>
              <input
                type="number"
                placeholder="e.g., 10"
                className="w-full border border-gray-300 bg-[#fafafa] rounded-md px-3 py-2 text-gray-700 focus:outline-lime-500"
                onChange={(e) => handleChange("maxExp", e.target.value)}
              />
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualification
              </label>
              <select
                className="w-full border border-gray-300 bg-[#fafafa] rounded-md px-3 py-2 text-gray-700 focus:outline-lime-500"
                onChange={(e) => handleChange("qualification", e.target.value)}
              >
                <option value="">Select qualification</option>
                <option>B.Tech</option>
                <option>MCA</option>
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>
              <input
                type="text"
                placeholder="e.g., Senior Developer"
                className="w-full border border-gray-300 bg-[#fafafa] rounded-md px-3 py-2 text-gray-700 focus:outline-lime-500"
                onChange={(e) => handleChange("designation", e.target.value)}
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <input
                type="text"
                placeholder="e.g., React, Node.js"
                className="w-full border border-gray-300 bg-[#fafafa] rounded-md px-3 py-2 text-gray-700 focus:outline-lime-500"
                onChange={(e) => handleChange("skills", e.target.value)}
              />
            </div>

            {/* Expected CTC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected CTC (LPA)
              </label>
              <select
                className="w-full border border-gray-300 bg-[#fafafa] rounded-md px-3 py-2 text-gray-700 focus:outline-lime-500"
                onChange={(e) => handleChange("expectedCtc", e.target.value)}
              >
                <option value="">Any CTC</option>
                <option>10 LPA</option>
                <option>20 LPA</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 mt-10">
            <button
              onClick={handleSearch}
              className="bg-lime-500 hover:bg-lime-600 text-white rounded-md px-6 py-2 font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={() => window.location.reload()}
              className="border border-gray-300 rounded-md px-6 py-2 text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* RESULTS SECTION */}
      {showResults && (
        <div className="space-y-6 ">
          {candidates.map((item, index) => (
            <ProfileCard key={index} data={item} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
