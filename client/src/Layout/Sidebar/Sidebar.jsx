import React, { useState } from 'react';
import { LuLayoutDashboard, LuLogOut, LuSearch, LuSettings, LuUserCog} from 'react-icons/lu'
import mavenLogo from '../../assets/mavenLogo.svg'
import { Link } from 'react-router-dom';

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard',  to:'/', label: 'Dashboard', icon: LuLayoutDashboard },
    { id: 'search', to:'/candidate-search', label: 'Search Candidates', icon: LuSearch },
    { id: 'admin', to:'/', label: 'Admin', icon: LuUserCog },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: LuSettings },
    { id: 'logout', label: 'Logout', icon: LuLogOut },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-[#103c7f] text-white">
      {/* Logo Section */}
      <div className=" p-4">
        <img src={mavenLogo} alt="" />
      </div>

      {/* Main Menu Items */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <Link
                  onClick={() => setActiveItem(item.id)}
                  to={item.to}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-[#a1db40] text-[#103c7f] font-semibold'
                      : 'text-white hover:bg-[#1a4d99]'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Menu Items */}
      <div className=" px-4 py-4">
        <ul className="space-y-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveItem(item.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-white transition-colors hover:bg-[#1a4d99]"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}