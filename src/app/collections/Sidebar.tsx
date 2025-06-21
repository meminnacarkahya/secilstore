import { FaHome, FaDownload, FaChevronDown, FaShoppingCart } from "react-icons/fa";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col min-h-screen p-4">
      <div className="text-2xl font-bold mb-8 ml-2">LOGO</div>
      <nav className="flex flex-col gap-2">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 ml-2">Menü</h3>
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
          <FaHome />
          <span>Dashboard</span>
        </a>
        <a href="#" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-3">
            <FaDownload />
            <span>Ürünler</span>
          </div>
          <FaChevronDown className="text-gray-500" />
        </a>

        <h3 className="text-xs text-gray-500 uppercase tracking-wider font-bold mt-4 mb-2 ml-2">Satış</h3>
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
          <FaShoppingCart />
          <span>Koleksiyon</span>
        </a>
      </nav>
    </aside>
  );
} 