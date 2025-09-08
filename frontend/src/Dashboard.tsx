import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard({
  username,
  onLogout,
}: {
  username: string;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8080/api/auth/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.role === "admin") {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, []);

  const runParserTest = async () => {
    try {
      const res = await fetch("http://localhost:8001/api/gen");
      const data = await res.json();
      alert(`Parser Test Result: ${data.message}`);
    } catch {
      alert("Failed to contact parser service.");
    }
  };

  const runGeneratorTest = async () => {
    try {
      const res = await fetch("http://localhost:8002/api/parse");
      const data = await res.json();
      alert(`Generator Test Result: ${data.message}`);
    } catch {
      alert("Failed to contact generator service.");
    }
  };

  const listUsers = async () => {
    try {
      const res = await fetch("http://localhost:8082/api/admin/users", {
        credentials: "include",
      });
      const data = await res.json();
      alert(`Users:\n${JSON.stringify(data, null, 2)}`);
    } catch {
      alert("Failed to contact admin service.");
    }
  };

  const createUser = async () => {
    const newUsername = prompt("Enter new user's username:");
    const newPassword = prompt("Enter new user's password:");
    const permissions = prompt('Enter comma-separated permissions (e.g. "doc_parser,generator"):');
    if (!newUsername || !newPassword) return alert("Username and password required");

    try {
      const res = await fetch("http://localhost:8082/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: "user",
          permissions: permissions?.split(",").map((p) => p.trim()) || [],
        }),
      });

      const data = await res.json();
      if (res.ok) alert("User created successfully");
      else alert(`Failed to create user: ${data.error || "Unknown error"}`);
    } catch {
      alert("Error contacting admin service.");
    }
  };

  const deleteUser = async () => {
    const userId = prompt("Enter ID of user to delete:");
    if (!userId) return;

    try {
      const res = await fetch(`http://localhost:8082/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) alert("User deleted successfully");
      else alert(`Failed to delete user: ${data.error || "Unknown error"}`);
    } catch {
      alert("Error contacting admin service.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {username}</h1>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Parser */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Test Document Parser</h2>
          <p className="mb-4 text-gray-300">Make sure the parser service is up and responding.</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            onClick={runParserTest}
          >
            Run Parser Test
          </button>
        </div>

        {/* Generator */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Test Document Generator</h2>
          <p className="mb-4 text-gray-300">Ensure document generation returns a valid file.</p>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            onClick={runGeneratorTest}
          >
            Run Generator Test
          </button>
        </div>

        {/* Admin Panel */}
        {isAdmin && (
          <div className="bg-gray-800 p-6 rounded-lg shadow col-span-1">
            <h2 className="text-xl font-semibold mb-2 text-yellow-400">Admin Services</h2>
            <p className="mb-4 text-gray-300">Manage users and system permissions.</p>
            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md block mb-2"
              onClick={listUsers}
            >
              View All Users
            </button>
            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md block mb-2"
              onClick={createUser}
            >
              Create New User
            </button>
            <button
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md block"
              onClick={deleteUser}
            >
              Delete User
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
