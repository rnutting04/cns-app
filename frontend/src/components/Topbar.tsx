import { Menu } from "lucide-react";

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header className="h-14 px-4 flex items-center bg-white border-b shadow-sm">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded hover:bg-gray-100"
      >
        <Menu />
      </button>
      <h1 className="ml-4 text-lg font-semibold">Dashboard</h1>
    </header>
  );
}
