// src/Login.tsx
import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";

export default function Login({ onLogin }: { onLogin: (username: string, role: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Login failed");
      }

      // Optionally fetch user info after login
      const meRes = await fetch("http://localhost:8080/api/auth/me", {
        credentials: "include",
      });
      const me = await meRes.json();
      onLogin(me.username, me.role);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#151827] text-gray-100 font-mont">

      <div className="absolute top-0 right-0 h-full">
        <svg className="h-full w-auto" viewBox="0 0 865 720" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M257.5 139C121.9 151.8 29.6667 51 0.5 -1L864.5 2.5V720.5H768C469.2 682.5 519.5 531 582 460C618.5 410.167 684.5 290.1 656.5 208.5C621.5 106.5 427 123 257.5 139Z" fill="#1A1F37"/>
        </svg>
      </div>      

      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 opacity-70">
        <svg width="1200" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="150" cy="650" r="600" fill="#1A1F37" fillOpacity="1"/>
            <circle cx="150" cy="650" r="500" fill="#1E2538" fillOpacity="1"/>
            <circle cx="150" cy="650" r="400" fill="#151827" fillOpacity="0.502"/>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center mb-5 w-full max-w-sm p-4">

        <div className = "mb-8">
          <img src="/logo.png" alt="C&S Logo" className="w-lg" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full"
        >

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="USERNAME"
              className="w-full bg-transparent text-white px-10 py-3 border border-white rounded focus:outline-none focus:ring-2 focus:ring-[#0F9848] transition-all"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD"
              className="w-full bg-transparent text-white px-10 py-3 border border-white rounded focus:outline-none focus:ring-2 focus:ring-[#0F9848] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-white font-bold text-[#2A4189] py-3 rounded-md hover:bg-[#0F9848] transition-colors"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
