'use client'

import { FaSun, FaMoon, FaGlobe, FaBell, FaEnvelope, FaUserCircle, FaCog, FaSlidersH } from "react-icons/fa";
import { VscSettings } from "react-icons/vsc";
import { ThemeSwitcher } from '../../components/ThemeSwitcher'

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-md p-4 flex justify-between items-center">
      <div>
        <div className="text-lg font-bold">Koleksiyon</div>
        <div className="text-sm text-gray-500">Koleksiyon Listesi</div>
      </div>
      <div className="flex items-center gap-6">
        <ThemeSwitcher />
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
        <button className="hover:text-blue-500">
          <FaGlobe size={20} />
        </button>
        <button className="relative hover:text-blue-500">
          <FaBell size={20} />
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            12
          </span>
        </button>
        <button className="hover:text-blue-500">
          <FaEnvelope size={20} />
        </button>
        <button className="hover:text-blue-500">
          <VscSettings size={20} />
        </button>
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full">
          <FaUserCircle className="w-7 h-7 text-gray-500" />
        </div>
      </div>
    </header>
  );
} 