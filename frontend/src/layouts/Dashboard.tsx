import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useState } from "react";

export default function Dashboard({
  username,
  onLogout,
}: {
  username: string;
  onLogout: () => void;
}) {
  const navigate = useNavigate();

  const runParserTest = async () => {
    try {
      const res = await fetch("http://localhost:8001/api/gen"); // Adjust port/route as needed
      const data = await res.json();
      alert(`Parser Test Result: ${data.message}`);
    } catch (err) {
      alert("Failed to contact parser service.");
    }
  };

  const runGeneratorTest = async () => {
    try {
      const res = await fetch("http://localhost:8002/api/parse"); // Adjust port/route as needed
      const data = await res.json();
      alert(`Generator Test Result: ${data.message}`);
    } catch (err) {
      alert("Failed to contact generator service.");
    }
  };
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Main content area (includes Topbar + content) */}
      <div className="flex-1 flex flex-col">
        <Topbar
          username={username}
          onLogout={onLogout}
          onToggleSidebar={toggleSidebar}
        />

        <main className="flex-1 bg-gray-900 text-white overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">
                Test Document Parser
              </h2>
              <p className="mb-4 text-gray-300">
                Make sure the parser service is up and responding.
              </p>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                onClick={runParserTest}
              >
                Run Parser Test
              </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">
                Test Document Generator
              </h2>
              <p className="mb-4 text-gray-300">
                Ensure document generation returns a valid file.
              </p>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                onClick={runGeneratorTest}
              >
                Run Generator Test
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
