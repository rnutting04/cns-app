import { useEffect, useState } from "react";

type Role = "user" | "admin" | "super";

type User = {
  ID: string;
  Username: string;
  Role: Role;
};

const ADMIN_API = "http://localhost:8082";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${ADMIN_API}/api/admin/users`, {
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to load users (${res.status})`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CREATE
  const onCreate: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);

    // Capture form before awaits
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const payload = {
      username: String(fd.get("username") || "").trim(),
      password: String(fd.get("password") || ""),
      role: (String(fd.get("role") || "user") as Role),
    };
    if (!payload.username || !payload.password) {
      setError("Username and password required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/admin/users`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to create user (${res.status})`);
      }
      form.reset();
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  // DELETE
  const onDelete = async (u: User) => {
    setError(null);
    if (u.Role === "super") {
      setError("Cannot delete super user");
      return;
    }
    if (!confirm(`Delete user "${u.Username}"?`)) return;

    try {
      const res = await fetch(`${ADMIN_API}/api/admin/users/${u.ID}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to delete user (${res.status})`);
      }
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to delete user");
    }
  };

  // UPDATE ROLE (optimistic select + explicit save)
  const onChangeRoleLocal = (id: string, newRole: Role) => {
    setUsers((prev) => prev.map((u) => (u.ID === id ? { ...u, Role: newRole } : u)));
  };

  const onSaveRole = async (u: User) => {
    setError(null);
    if (u.Role === "super") {
      setError("Cannot modify super user");
      return;
    }
    setSaving(u.ID);
    try {
      const res = await fetch(`${ADMIN_API}/api/admin/users/${u.ID}/role`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: u.Role }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to update role (${res.status})`);
      }
      // Optionally reload to ensure canonical view
      // await load();
    } catch (e: any) {
      setError(e?.message || "Failed to update role");
      await load(); // revert optimistic change on error
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">User Management</h1>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* Create user */}
      <form onSubmit={onCreate} className="bg-gray-800 p-4 rounded-lg space-y-3 max-w-md">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            name="username"
            className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700"
            placeholder="jdoe"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            name="password"
            className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Role</label>
          <select
            name="role"
            defaultValue="user"
            className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
            {/* no "super" in UI */}
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          {creating ? "Creating…" : "Create User"}
        </button>
      </form>

      {/* Users table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700 text-sm uppercase text-gray-300">
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 w-56">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4" colSpan={3}>
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-4 py-4" colSpan={3}>
                  No users.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSuper = u.Role === "super";
                const isSaving = saving === u.ID;

                return (
                  <tr key={u.ID} className="border-t border-gray-700">
                    <td className="px-4 py-3">{u.Username}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.Role}
                        disabled={isSuper || isSaving}
                        onChange={(e) => onChangeRoleLocal(u.ID, e.target.value as Role)}
                        className="px-3 py-2 rounded bg-gray-900 border border-gray-700 disabled:opacity-50"
                      >
                        {isSuper ? (
                          <option value="super">super</option>
                        ) : (
                          <>
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </>
                        )}
                      </select>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => onSaveRole(u)}
                        disabled={isSuper || isSaving}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm"
                        title={isSuper ? "Cannot modify super" : "Save role"}
                      >
                        {isSaving ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={() => onDelete(u)}
                        disabled={isSuper}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm"
                        title={isSuper ? "Cannot delete super" : "Delete user"}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
