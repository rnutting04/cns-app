import logo from "../assets/logo.png";
import { Home, User, Settings } from "lucide-react";

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  return (
    <aside
      className={`bg-white text-black shadow-md transition-all duration-300 overflow-hidden
        ${isOpen ? "w-48" : "w-0"}
      `}
    >
      <nav
        className={`h-full flex flex-col ${
          isOpen ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
      >
        <div className="p-4 pb-2 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-32" />
        </div>
        <ul className="flex-1 px-3 space-y-2">
          <SidebarItem icon={<Home />} label="Dashboard" />
          <SidebarItem icon={<User />} label="Profile" />
          <SidebarItem icon={<Settings />} label="Settings" />
        </ul>
        <div className="border-t p-4">
          <h4 className="font-semibold text-sm text-black">John Doe</h4>
          <p className="text-xs text-gray-500">john@example.com</p>
        </div>
      </nav>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li>
      <button className="flex items-center gap-3 w-full p-2 rounded hover:bg-gray-100 text-gray-700">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </button>
    </li>
  );
}
