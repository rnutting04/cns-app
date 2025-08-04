// src/App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Login";
import Dashboard from "./layouts/Dashboard";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated (via cookie)
  useEffect(() => {
    fetch("http://localhost:8080/api/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          console.log("Not authenticated");
          return;
        }
        return res.json();
      })
      .then((data) => {
        setUsername(data.username);
      })
      .catch(() => setUsername(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    console.log("Logging out...");
    await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUsername(null);
    console.log("Logged out");
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            username ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={(name) => setUsername(name)} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            username ? (
              <Dashboard username={username} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/"
          element={<Navigate to={username ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
