import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
              Go to User Management
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
