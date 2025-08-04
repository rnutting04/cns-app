import logo from "../assets/logo.png";
import { Home, User, Settings } from "lucide-react";

export function Sidebar({ onClose }: { onClose: () => void }) {
  return (
    <aside className="hidden sm:block w-50 h-full bg-white border-r shadow-sm transform transition-transform duration-300">
      <nav className="h-full flex flex-col">
        <div className="p-4 pb-2 flex items-center justify-between">
          <img src={logo} alt="Logo" className="w-32" />
          <button
            className="p-2 rounded hover:bg-gray-200"
            onClick={onClose}
          ></button>
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
