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
    <header className="flex justify-between items-center px-2 py-2 bg-white shadow-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button onClick={onToggleSidebar} className=" text-black">
            <Menu className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-2xl font-bold justify-between text-black">
          Welcome, {username}
        </h1>
      </div>
      <button
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-600 text-black px-4 py-2 rounded-lg"
      >
        Logout
      </button>
    </header>
  );
}
