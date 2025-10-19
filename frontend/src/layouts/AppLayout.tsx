import { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Icon } from '@iconify/react';

const getInitialSidebarState = () => {
  const savedState = localStorage.getItem('sidebarIsOpen');
  // Default to 'true' (open) if nothing is in storage
  return savedState !== null ? JSON.parse(savedState) : true;
};

export default function AppLayout({
  username,
  role,
  onLogout,
}: {
  username: string;
  role: string | null;
  onLogout: () => void;
}) {
  const isAdmin = role === "admin" || role === "super";
  const isSuper = role === "super";
  const [isSidebarOpen, setSidebarOpen] = useState(getInitialSidebarState);

  const handleToggleSidebar = () => {
    setSidebarOpen((prevState: boolean) => {
      const newState = !prevState;
      // save the new state to localStorage every time it changes.
      localStorage.setItem('sidebarIsOpen', JSON.stringify(newState));
      return newState;
    });
  };

return (
    <div className="relative min-h-screen bg-[#151827] text-white md:flex">
      <Sidebar 
        isAdmin={isAdmin}
        isSuper={isSuper}
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
      />

      {/* Mobile overlay to close sidebar when clicking outside of it */}
      {isSidebarOpen && (
        <div
          onClick={handleToggleSidebar}
          className="fixed inset-0 bg-black/40 bg-opacity-50 z-20 md:hidden transition-opacity"
          aria-hidden="true"
        ></div>
      )}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        {/* Mobile-only menu button in the header */}
          <button 
            onClick={handleToggleSidebar} 
            className="p-1.5 rounded-lg hover:bg-gray-700 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Icon icon="material-symbols:menu-rounded" className="text-xl" />
          </button>

          <div className="font-semibold">Welcome, {username}</div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 rounded bg-gray-800">{role ?? "guest"}</span>
            <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded">
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-800 text-sm text-gray-400">
          © {new Date().getFullYear()} C&S Condominium Management
        </footer>
      </div>
    </div>
  );
}
