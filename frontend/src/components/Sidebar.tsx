import logo from "../assets/logo.png";
import { Settings, BarChart3, FileText, Upload } from "lucide-react";

export default function Sidebar({
  isOpen,
  username,
}: {
  isOpen: boolean;
  username: string;
}) {
  return (
    <aside
      className={`
    h-full bg-white text-black shadow-md transition-all duration-300
    z-50 overflow-hidden
    ${isOpen ? "w-64 opacity-100" : "w-0 opacity-0"}
    fixed sm:static
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    sm:translate-x-0
  `}
    >
      <nav
        className={`h-full flex flex-col ${
          isOpen ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
      >
        <div className="p-4 pb-2 flex items-center">
          <img src={logo} alt="Logo" className="w-16" />
          <span>Applications</span>
        </div>
        <ul className="flex-1 px-1">
          <SidebarItem icon={<BarChart3 />} label="Dashboard" />
          <SidebarItem icon={<Upload />} label="File Parser" />
          <SidebarItem icon={<FileText />} label="Document Generator" />
          <SidebarItem icon={<Settings />} label="Settings" />
        </ul>
        <div className="p-4">
          <h4 className="font-semibold text-sm text-black">{username}</h4>
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
