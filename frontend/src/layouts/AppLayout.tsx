// src/layouts/AppLayout.tsx
import { NavLink, Outlet } from "react-router-dom";

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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-4 hidden md:block">
        <h2 className="text-lg font-semibold mb-4">Control Panel</h2>
        <nav className="space-y-2">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "block px-3 py-2 rounded bg-gray-700" : "block px-3 py-2 rounded hover:bg-gray-700"}>
            Dashboard
          </NavLink>

          {isAdmin && (
            <NavLink to="/dashboard" className={({isActive}) => isActive ? "block px-3 py-2 rounded bg-gray-700" : "block px-3 py-2 rounded hover:bg-gray-700"}>
              User Management
            </NavLink>
          )}

          {isSuper && (
            <NavLink to="/dashboard" className={({isActive}) => isActive ? "block px-3 py-2 rounded bg-gray-700" : "block px-3 py-2 rounded hover:bg-gray-700"}>
              Super Tools
            </NavLink>
          )}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
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
