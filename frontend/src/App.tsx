// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import UserManagement from "./UserManagement";  
import DataManagement from "./DataManagement";
import UnderConstruction from "./UnderConstruction";


export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

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
        setRole(data.role);
      })
      .catch(() => {
         setUsername(null);
         setRole(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    console.log("Logging out...");
    await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUsername(null);
    setRole(null);
    console.log("Logged out");
  };

  if (loading) return <div className="p-4">Loading...</div>;
  const isLoggedIn = !!username;    

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={(name: string, role: string) => { 
                            setUsername(name); 
                            setRole(role);
                        }} />
            )
          }
        />
        <Route
          element={<AppLayout username={username} role={role} onLogout={handleLogout} />}
        >
            <Route path="/under-construction" element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                role = {role ?? undefined}
                allowedRoles={["admin", "super", "user"]}
              >
                  <UnderConstruction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  role={role ?? undefined}
                  allowedRoles={["admin", "super", "user"]}
                >
                <Dashboard username={username} onLogout={handleLogout} role={role} />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/users" element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  role={role ?? undefined}
                  allowedRoles={["admin", "super"]}
                >
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/data" element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  role={role ?? undefined}
                  allowedRoles={["admin", "super"]}
                >
                  <DataManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={<Navigate to={username ? "/dashboard" : "/login"} />}
            />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
