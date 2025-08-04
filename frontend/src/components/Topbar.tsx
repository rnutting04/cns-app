import { Menu } from "lucide-react";

type TopbarProps = {
  username: string;
  onLogout: () => void;
  onToggleSidebar?: () => void;
};

export default function Topbar({
  username,
  onLogout,
  onToggleSidebar,
}: TopbarProps) {
  return (
    <header className="flex justify-between items-center px-4 py-4 bg-gray-500 shadow-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button onClick={onToggleSidebar} className=" text-white">
            <Menu className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-2xl font-bold text-white"> Welcome, {username}</h1>
      </div>
      <button
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        Logout
      </button>
    </header>
  );
}
