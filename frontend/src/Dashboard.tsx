import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./components/ui/Button";

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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Parser */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Test Document Parser</h2>
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

        {/* Generator */}
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

        {/* Admin Panel */}
        {isAdmin && (
          <div className="bg-gray-800 p-6 rounded-lg shadow flex flex-col justify-center items-center">
            <button
              onClick={() => navigate("/admin/users")}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              User Management
            </button>
          </div>
        )}
        {isAdmin && (
          <div className="bg-gray-800 p-6 rounded-lg shadow flex flex-col justify-center items-center">
            <button
              onClick={() => navigate("/admin/data")}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Data Management
            </button>
          </div>
        )}
      </div>
      {isSuper &&
        (loading ? (
          <div className="bg-gray-800 p-6 rounded-lg shadow flex items-start mt-6">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg shadow flex items-start mt-6 flex flex-row gap-4">
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
