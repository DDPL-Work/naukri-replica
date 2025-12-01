import React from 'react';
import { LuBell } from 'react-icons/lu';
import { useLocation } from 'react-router-dom';
import profileIcon from '../../assets/profileIcon.svg';

const neonBG = 'bg-[#a1db40]';
const bellColor = 'text-[#103c7f]';

const Header = () => {
  const location = useLocation();

  // SHOW ONLY ON THESE ROUTES
  const showDashboardTag =
    location.pathname === '/recruiter/dashboard' ||
    location.pathname === '/admin/dashboard';

  return (
    <div className="w-full">
      <div className="py-3 px-3">
        <div className="flex items-center justify-between">

          {/* LEFT — SHOW ONLY ON SPECIFIC ROUTES */}
          <div>
            {showDashboardTag && (
              <div className={`${neonBG} py-2 px-5 w-fit rounded-full`}>
                Dashboard Overview
              </div>
            )}
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-5 pr-10">
            <div className="relative">
              <LuBell size={20} className={`${bellColor}`} />
              <span className={`${neonBG} absolute rounded-full -top-2 -right-1 w-2 h-2`} />
            </div>
            <div>
              <div className="border-4 border-gray-200 w-8 h-8 rounded-full flex items-center justify-center">
                <img src={profileIcon} className="w-5 h-5" alt="" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Header;
