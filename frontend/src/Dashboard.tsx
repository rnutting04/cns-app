import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./components/ui/Button";
import DashboardCard from "./components/DashboardCard";
import ExcelIcon from './components/icons/ExcelIcon';
import WordIcon from './components/icons/WordIcon';
import { Icon } from '@iconify/react';

export default function Dashboard({
  username,
  onLogout,
  role,
}: {
  username: string;
  onLogout: () => void;
  role: string | null;
}) {
  const isAdmin = role === "admin" || role === "super";
  const isSuper = role === "super";
  const navigate = useNavigate();
  console.log(role);

  const runGeneratorTest = async () => {
    try {
      const res = await fetch("http://localhost:8001/api/gen", {
        credentials: "include",
      });
      const data = await res.json();
      alert(`Parser Test Result: ${data.message}`);
    } catch {
      alert("Failed to contact parser service.");
    }
  };

  const runParserTest = async () => {
    try {
      const res = await fetch("http://localhost:8002/api/parse", {
        credentials: "include",
      });
      const data = await res.json();
      alert(`Generator Test Result: ${data.message}`);
    } catch {
      alert("Failed to contact generator service.");
    }
  };

  const redirectToConstruction = () => {
    window.location.href = "/under-construction";
  };

  // Refreshing services

  //typing for dictionary and endpoints
  type Endpoint = {
    name: string;
    duration: number;
  };

  type Dictionary = {
    [key: string]: string;
  };

  const names: Dictionary = {
    "/api/parse": "parse",
    "/api/gen": "gen",
  };

  //usestate for times
  const [times, setTimes] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(false);

  const endpoints = ["/api/parse", "/api/gen"];

  const refreshServices = async () => {
    setLoading(true);
    try {
      const timings = [];
      for (const url of endpoints) {
        const start = performance.now();
        const res = await fetch(url, { credentials: "include" });
        const end = performance.now();
        const difference = end - start;
        const duration = Number(difference.toFixed(0));
        const endpoint: Endpoint = {
          name: names[url],
          duration: duration,
        };

        timings.push(endpoint);
        console.log(res);
      }
      setTimes(timings);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  // useEffect for on page load and isSuper
  useEffect(() => {
    if (isSuper) {
      refreshServices();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#151827] text-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Parser */}
        <DashboardCard
          title="Excel Data Parsers"
          description="Upload files to be parsed and select desired tasks to generate Excel reports."
          badgeText="XLSX Format"
          buttonText="View Application"
          icon={<ExcelIcon />}
          onClick={redirectToConstruction}
          variant="green"
        />

        {/* Generator */}
        <DashboardCard
          title="Document Form Generators"
          description="Fill out forms and automatically generate different document types including contracts, reports, and templates."
          badgeText="DOCX Format"
          buttonText="View Application"
          icon={<WordIcon />}
          onClick={redirectToConstruction}
          variant="blue"
        />

        {/* Admin Panel */}
        {isAdmin && (
          <DashboardCard
            title="User Management"
            description="Manage user accounts, permissions, and roles. Add new users, edit existing accounts, and control access levels."
            badgeText="User Controls"
            buttonText="View Application"
            icon={<Icon icon="lucide:users" className="w-full h-full" />}
            onClick={() => navigate("/admin/users")}
            variant="purple"
          />
        )}
        {isAdmin && (
          <DashboardCard
            title="Database Editor"
            description="Direct database access for data management. Edit tables, run queries, and maintain system data integrity."
            badgeText="Database Access"
            buttonText="View Application"
            icon={<Icon icon="tabler:database" className="w-full h-full" />}
            onClick={() => navigate("/admin/data")}
            variant="purple"
          />
        )}
      </div>
      {isSuper &&
        (loading ? (
          <div className="bg-[#1A1F37] p-6 rounded-lg shadow flex items-start mt-6">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="bg-[#1A1F37] p-6 rounded-lg shadow flex items-start mt-6 flex flex-row gap-4 border-2 border-[#3C4D66]">
            <button
              onClick={refreshServices}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Refresh
            </button>
            {times.map((item, index) => (
              <div
                key={index}
                className="bg-gray-700 p-4 rounded-lg shadow flex justify-between items-center"
              >
                {item.name}: {item.duration}ms
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}