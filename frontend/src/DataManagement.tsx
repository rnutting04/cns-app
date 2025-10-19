import { useEffect, useMemo, useState } from "react";

/* -------------------- API endpoints -------------------- */
const API = {
  managers: "http://localhost:8082/api/admin/data/managers",
  associations: "http://localhost:8082/api/admin/data/associations",
};

/* -------------------- fetch helpers -------------------- */
async function jsonOrText(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (res.status === 204) return null;
  const txt = await res.text();
  if (ct.includes("application/json")) {
    try { return JSON.parse(txt); } catch {}
  }
  return { _raw: txt };
}

const req = (url: string, init?: RequestInit) =>
  fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });

/* -------------------- types -------------------- */
type Manager = {
  id: string;
  name: string;
  email: string;
  titles: string;
  initials: string;
  _isNew?: boolean;     // staged
  _deleted?: boolean;   // staged
};

type Association = {
  id: string;
  legalName: string;
  filterName: string;
  location: string;
  managerId: string;
  managerName?: string; // embedded from backend or derived from managers
  _isNew?: boolean;
  _deleted?: boolean;
};

/* -------------------- normalizers -------------------- */
const s = (v: any) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim());

function normalizeManager(m: any): Manager {
  return {
    id: s(m.id ?? m.ID),
    name: s(m.name ?? m.Name),
    email: s(m.email ?? m.Email),
    titles: s(m.titles ?? m.Titles),
    initials: s(m.initials ?? m.Initials),
  };
}

function normalizeAssociation(a: any, managersById?: Map<string, Manager>): Association {
  const embedded = a.Manager ?? a.manager ?? null;
  const managerId = s(a.managerId ?? a.ManagerID ?? a.manager_id);
  const managerName =
    embedded ? s(embedded.Name ?? embedded.name) :
    managersById?.get(managerId)?.name;
  return {
    id: s(a.id ?? a.ID),
    legalName: s(a.legalName ?? a.LegalName),
    filterName: s(a.filterName ?? a.FilterName ?? a.filter_name),
    location: s(a.location ?? a.Location),
    managerId,
    managerName,
  };
}

const unwrapArray = (x: any): any[] => {
  if (Array.isArray(x)) return x;
  if (Array.isArray(x?.associations)) return x.associations;
  if (Array.isArray(x?.managers)) return x.managers;
  if (Array.isArray(x?.data)) return x.data;
  return [];
};

/* -------------------- editing / staging -------------------- */
type TableChoice = "associations" | "managers";
type AssocField = keyof Association;
type MgrField = keyof Manager;

type EditCell =
  | { table: "associations"; id: string; field: AssocField; value: string }
  | { table: "managers"; id: string; field: MgrField; value: string }
  | null;

type SortDir = "asc" | "desc" | null;

export default function DataManagement() {
  /* originals (as last loaded from backend) */
  const [origManagers, setOrigManagers] = useState<Manager[]>([]);
  const [origAssociations, setOrigAssociations] = useState<Association[]>([]);

  /* drafts (editable, staged) */
  const [managers, setManagers] = useState<Manager[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);

  /* dirty tracking: map of rowId -> Set(fields) */
  const [dirtyMgr, setDirtyMgr] = useState<Map<string, Set<string>>>(new Map());
  const [dirtyAssoc, setDirtyAssoc] = useState<Map<string, Set<string>>>(new Map());

  /* rows staged for deletion (by id) */
  const [deleteMgr, setDeleteMgr] = useState<Set<string>>(new Set());
  const [deleteAssoc, setDeleteAssoc] = useState<Set<string>>(new Set());

  /* ui state */
  const [table, setTable] = useState<TableChoice>("associations");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [mgrFilter, setMgrFilter] = useState<string>("");
  const [edit, setEdit] = useState<EditCell>(null);

  // sorting
  const [assocSortKey, setAssocSortKey] = useState<AssocField>("legalName");
  const [assocSortDir, setAssocSortDir] = useState<SortDir>("asc");
  const [mgrSortKey, setMgrSortKey] = useState<MgrField>("name");
  const [mgrSortDir, setMgrSortDir] = useState<SortDir>("asc");

  /* maps and helpers */
  const managersById = useMemo(() => {
    const map = new Map<string, Manager>();
    managers.forEach((m) => m.id && map.set(m.id, m));
    return map;
  }, [managers]);

  const displayManager = (a: Association) =>
    a.managerName || managersById.get(a.managerId)?.name || "Unassigned";

  /* load both tables */
  const reloadAll = async () => {
    const [mRes, aRes] = await Promise.all([req(API.managers), req(API.associations)]);
    const [mRaw, aRaw] = await Promise.all([jsonOrText(mRes), jsonOrText(aRes)]);
    const m = unwrapArray(mRaw).map(normalizeManager);
    const mMap = new Map<string, Manager>(m.map((x) => [x.id, x]));
    const a = unwrapArray(aRaw).map((row) => normalizeAssociation(row, mMap));

    setOrigManagers(m);
    setOrigAssociations(a);
    setManagers(m);
    setAssociations(a);

    setDirtyMgr(new Map());
    setDirtyAssoc(new Map());
    setDeleteMgr(new Set());
    setDeleteAssoc(new Set());
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { await reloadAll(); } finally { setLoading(false); }
    })();
  }, []);

  /* filtering + search + sorting for display */
  const visibleAssociations = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = associations
      .filter((a) => !a._deleted)
      .filter((a) => {
        const matchesQ =
          !needle ||
          a.legalName.toLowerCase().includes(needle) ||
          a.filterName.toLowerCase().includes(needle) ||
          a.location.toLowerCase().includes(needle) ||
          displayManager(a).toLowerCase().includes(needle);
        const matchesMgr = !mgrFilter || a.managerId === mgrFilter;
        return matchesQ && matchesMgr;
      });

    const dir = assocSortDir === "desc" ? -1 : 1;
    const sorted = [...filtered].sort((x, y) => {
      const a = String(x[assocSortKey] ?? "").toLowerCase();
      const b = String(y[assocSortKey] ?? "").toLowerCase();
      if (a < b) return -1 * dir;
      if (a > b) return 1 * dir;
      return 0;
    });

    // New rows stay on top
    const news = sorted.filter((r) => r._isNew);
    const rest = sorted.filter((r) => !r._isNew);
    return [...news, ...rest];
  }, [associations, q, mgrFilter, assocSortKey, assocSortDir, managersById]);

  const visibleManagers = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = managers
      .filter((m) => !m._deleted)
      .filter(
        (m) =>
          !needle ||
          m.name.toLowerCase().includes(needle) ||
          m.email.toLowerCase().includes(needle) ||
          m.titles.toLowerCase().includes(needle) ||
          m.initials.toLowerCase().includes(needle)
      );

    const dir = mgrSortDir === "desc" ? -1 : 1;
    const sorted = [...filtered].sort((x, y) => {
      const a = String(x[mgrSortKey] ?? "").toLowerCase();
      const b = String(y[mgrSortKey] ?? "").toLowerCase();
      if (a < b) return -1 * dir;
      if (a > b) return 1 * dir;
      return 0;
    });

    const news = sorted.filter((r) => r._isNew);
    const rest = sorted.filter((r) => !r._isNew);
    return [...news, ...rest];
  }, [managers, q, mgrSortKey, mgrSortDir]);

  /* dirty helpers */
  const markDirty = (mapSetter: any, map: Map<string, Set<string>>, id: string, field: string, dirty: boolean) => {
    const next = new Map(map);
    const set = new Set(next.get(id) ?? []);
    if (dirty) set.add(field); else set.delete(field);
    if (set.size === 0) next.delete(id); else next.set(id, set);
    mapSetter(next);
  };

  const isDirtyCell = (map: Map<string, Set<string>>, id: string, field: string) =>
    map.get(id)?.has(field) ?? false;

  const rowDirtyCount = (map: Map<string, Set<string>>, id: string) =>
    (map.get(id)?.size ?? 0) + 0;

  const totalChanges =
    [...dirtyMgr.values()].reduce((n, s) => n + s.size, 0) +
    [...dirtyAssoc.values()].reduce((n, s) => n + s.size, 0) +
    deleteMgr.size +
    deleteAssoc.size +
    managers.filter((m) => m._isNew).length +
    associations.filter((a) => a._isNew).length;

  /* editing logic */
  function startEdit(t: TableChoice, id: string, field: any, value: string) {
    setEdit({ table: t, id, field, value } as EditCell);
  }
  function cancelEdit() { setEdit(null); }
  function onCellKey(e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") cancelEdit();
  }

  function updateAssocDraft(id: string, field: keyof Association, value: string) {
    const orig = origAssociations.find((x) => x.id === id);
    setAssociations((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next: Association = { ...r, [field]: value };
        if (field === "managerId") {
          const m = managersById.get(value);
          next.managerName = m?.name || next.managerName || "";
        }
        return next;
      })
    );
    const was = (orig as any)?.[field] ?? "";
    markDirty(setDirtyAssoc, dirtyAssoc, id, field, String(value) !== String(was));
  }

  function updateMgrDraft(id: string, field: keyof Manager, value: string) {
    const orig = origManagers.find((x) => x.id === id);
    setManagers((prev) =>
      prev.map((r) => (r.id === id ? ({ ...r, [field]: value } as Manager) : r))
    );
    const was = (orig as any)?.[field] ?? "";
    markDirty(setDirtyMgr, dirtyMgr, id, field, String(value) !== String(was));
    if (field === "name") {
      // reflect in association display immediately
      setAssociations((prev) =>
        prev.map((a) => (a.managerId === id ? { ...a, managerName: value } : a))
      );
    }
  }

  async function commitEdit() {
    if (!edit) return;
    const { table: t, id, field, value } = edit;
    if (t === "associations") updateAssocDraft(id, field as AssocField, String(value));
    else updateMgrDraft(id, field as MgrField, String(value));
    setEdit(null);
  }

  /* create locals (appear at top, only saved on Apply) */
  const slugify = (txt: string) =>
    txt.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 64);

  function createAssociationLocal() {
    if (managers.length === 0) {
      alert("Create a manager first.");
      return;
    }
    const id = `NEW-A-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
    const legal = "New Association";
    const draft: Association = {
      id,
      legalName: legal,
      filterName: slugify(legal),
      location: "—",
      managerId: managers[0].id,
      managerName: managers[0].name,
      _isNew: true,
    };
    setAssociations((prev) => [draft, ...prev]);
    const set = new Set<AssocField>(["legalName","filterName","location","managerId"]);
    const next = new Map(dirtyAssoc); next.set(id, set); setDirtyAssoc(next);
  }

  function createManagerLocal() {
    const id = `NEW-M-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
    const uniq = Date.now().toString().slice(-6);
    const draft: Manager = {
      id,
      name: `New Manager ${uniq}`,
      email: `new.manager.${uniq}@example.com`,
      titles: "Manager",
      initials: "NM",
      _isNew: true,
    };
    setManagers((prev) => [draft, ...prev]);
    const set = new Set<MgrField>(["name","email","titles","initials"]);
    const next = new Map(dirtyMgr); next.set(id, set); setDirtyMgr(next);
  }

  /* stage deletes (only execute on Apply) */
  function stageDeleteAssociation(id: string) {
    // deleting a brand new row? just remove it
    const row = associations.find((x) => x.id === id);
    if (row?._isNew) {
      setAssociations((prev) => prev.filter((x) => x.id !== id));
      const next = new Map(dirtyAssoc); next.delete(id); setDirtyAssoc(next);
      return;
    }
    setAssociations((prev) => prev.map((x) => (x.id === id ? { ...x, _deleted: true } : x)));
    const next = new Set(deleteAssoc); next.add(id); setDeleteAssoc(next);
  }

  function stageDeleteManager(id: string) {
    const row = managers.find((x) => x.id === id);
    if (row?._isNew) {
      setManagers((prev) => prev.filter((x) => x.id !== id));
      const next = new Map(dirtyMgr); next.delete(id); setDirtyMgr(next);
      return;
    }
    setManagers((prev) => prev.map((x) => (x.id === id ? { ...x, _deleted: true } : x)));
    const next = new Set(deleteMgr); next.add(id); setDeleteMgr(next);
  }

  /* revert a single row */
  function revertAssociation(id: string) {
    const orig = origAssociations.find((x) => x.id === id);
    if (!orig) return;
    setAssociations((prev) => prev.map((x) => (x.id === id ? { ...orig } : x)));
    const next = new Map(dirtyAssoc); next.delete(id); setDirtyAssoc(next);
    const del = new Set(deleteAssoc); del.delete(id); setDeleteAssoc(del);
  }
  function revertManager(id: string) {
    const orig = origManagers.find((x) => x.id === id);
    if (!orig) return;
    setManagers((prev) => prev.map((x) => (x.id === id ? { ...orig } : x)));
    const next = new Map(dirtyMgr); next.delete(id); setDirtyMgr(next);
    const del = new Set(deleteMgr); del.delete(id); setDeleteMgr(del);
  }

  /* discard all staged changes */
  function discardAll() {
    setManagers(origManagers);
    setAssociations(origAssociations);
    setDirtyMgr(new Map());
    setDirtyAssoc(new Map());
    setDeleteMgr(new Set());
    setDeleteAssoc(new Set());
  }

  /* apply all staged changes */
  async function applyChanges() {
    // 1) Deletes
    const delMgrIds = Array.from(deleteMgr);
    const delAssocIds = Array.from(deleteAssoc);
    await Promise.all([
      ...delAssocIds.map((id) => req(`${API.associations}/${id}`, { method: "DELETE" })),
      ...delMgrIds.map((id) => req(`${API.managers}/${id}`, { method: "DELETE" })),
    ]);

    // 2) Creates
    const newManagers = managers.filter((m) => m._isNew && !m._deleted);
    const newAssociations = associations.filter((a) => a._isNew && !a._deleted);

    const createdMgrs: Manager[] = [];
    for (const m of newManagers) {
      const res = await req(API.managers, { method: "POST", body: JSON.stringify({
        name: m.name, email: m.email, titles: m.titles, initials: m.initials,
      })});
      if (!res.ok) throw new Error("Failed to create manager");
      const body = await jsonOrText(res);
      createdMgrs.push(normalizeManager(body));
    }

    // map temporary NEW-M-* ids to real ids, for new associations referencing new managers
    const tempMgrIdToReal = new Map<string,string>();
    for (const m of newManagers) {
      const real = createdMgrs.find((x) => x.email === m.email && x.name === m.name);
      if (real) tempMgrIdToReal.set(m.id, real.id);
    }

    const createdAssocs: Association[] = [];
    for (const a of newAssociations) {
      const managerId = tempMgrIdToReal.get(a.managerId) ?? a.managerId;
      const res = await req(API.associations, { method: "POST", body: JSON.stringify({
        legalName: a.legalName, filterName: a.filterName, location: a.location, managerId,
      })});
      if (!res.ok) throw new Error("Failed to create association");
      const body = await jsonOrText(res);
      createdAssocs.push(normalizeAssociation(body));
    }

    // 3) Updates
    // Managers with any dirty fields and not deleted/new
    const updateMgrIds = Array.from(dirtyMgr.keys()).filter((id) => {
      const row = managers.find((m) => m.id === id);
      return row && !row._deleted && !row._isNew;
    });

    for (const id of updateMgrIds) {
      const row = managers.find((m) => m.id === id)!;
      const res = await req(`${API.managers}/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: row.name, email: row.email, titles: row.titles, initials: row.initials,
        }),
      });
      if (!res.ok) throw new Error("Failed to update manager");
    }

    // Associations with dirty fields and not deleted/new
    const updateAssocIds = Array.from(dirtyAssoc.keys()).filter((id) => {
      const row = associations.find((a) => a.id === id);
      return row && !row._deleted && !row._isNew;
    });

    for (const id of updateAssocIds) {
      const row = associations.find((a) => a.id === id)!;
      const res = await req(`${API.associations}/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          legalName: row.legalName,
          filterName: row.filterName,
          location: row.location,
          managerId: row.managerId,
        }),
      });
      if (!res.ok) throw new Error("Failed to update association");
    }

    // 4) Reload to get fresh embedded Manager names, etc.
    await reloadAll();
  }

  /* -------------------- table helpers -------------------- */
  const thBtn =
    "px-4 py-3 text-left hover:text-white cursor-pointer select-none";
  const sortIcon = (dir: SortDir) => (dir === "asc" ? "▲" : dir === "desc" ? "▼" : "");

  const toggleAssocSort = (key: AssocField) => {
    if (assocSortKey !== key) { setAssocSortKey(key); setAssocSortDir("asc"); }
    else { setAssocSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc")); }
  };
  const toggleMgrSort = (key: MgrField) => {
    if (mgrSortKey !== key) { setMgrSortKey(key); setMgrSortDir("asc"); }
    else { setMgrSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc")); }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Data Management</h1>
          <p className="text-sm text-gray-400">
            Edit cells then <span className="text-indigo-300">Apply changes</span>. Unsaved edits are highlighted.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={applyChanges}
            disabled={totalChanges === 0}
            className={`px-3 py-2 rounded-lg text-sm ${
              totalChanges === 0
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
            title={totalChanges ? `${totalChanges} pending change(s)` : "No pending changes"}
          >
            Apply changes {totalChanges ? `(${totalChanges})` : ""}
          </button>
          <button
            onClick={discardAll}
            disabled={totalChanges === 0}
            className={`px-3 py-2 rounded-lg text-sm ${
              totalChanges === 0
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            Discard all
          </button>

          <select
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-200"
            value={table}
            onChange={(e) => setTable(e.target.value as TableChoice)}
          >
            <option value="associations">associations</option>
            <option value="managers">managers</option>
          </select>

          <input
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-200"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-gray-400">Loading…</div>
      ) : table === "associations" ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Manager:</label>
              <select
                className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-200"
                value={mgrFilter}
                onChange={(e) => setMgrFilter(e.target.value)}
              >
                <option value="">All</option>
                {managers.filter((m) => !m._deleted).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.initials})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={createAssociationLocal}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
            >
              New Association
            </button>
          </div>

          <div className="overflow-y-auto max-h-[70vh] rounded-xl border border-gray-800">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-900 text-gray-300">
                <tr>
                  <th className={thBtn} onClick={() => toggleAssocSort("legalName")}>
                    Legal Name {assocSortKey === "legalName" && sortIcon(assocSortDir)}
                  </th>
                  <th className={thBtn} onClick={() => toggleAssocSort("filterName")}>
                    Filter Name {assocSortKey === "filterName" && sortIcon(assocSortDir)}
                  </th>
                  <th className={thBtn} onClick={() => toggleAssocSort("location")}>
                    Location {assocSortKey === "location" && sortIcon(assocSortDir)}
                  </th>
                  <th className="px-4 py-3 text-left">Manager</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {visibleAssociations.map((a) => {
                  const cellClass = (f: AssocField) =>
                    `px-4 py-3 ${isDirtyCell(dirtyAssoc, a.id, f) ? "bg-yellow-900/30" : ""}`;
                  const isEditing = (f: AssocField) =>
                    edit && edit.table === "associations" && edit.id === a.id && edit.field === f;

                  return (
                    <tr key={a.id} className={`${a._deleted ? "opacity-50 line-through" : ""} hover:bg-gray-900/60`}>
                      {/* legalName */}
                      <td
                        className={`${cellClass("legalName")} text-white cursor-text`}
                        onClick={() =>
                          !a._deleted &&
                          !isEditing("legalName") &&
                          startEdit("associations", a.id, "legalName", a.legalName)
                        }
                      >
                        {isEditing("legalName") ? (
                          <input
                            autoFocus
                            className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-100 w-full"
                            value={(edit as any)?.value || ""}
                            onChange={(e) =>
                              setEdit((prev) => prev && { ...prev, value: e.target.value })
                            }
                            onBlur={commitEdit}
                            onKeyDown={onCellKey}
                          />
                        ) : (
                          a.legalName || <span className="text-gray-500">—</span>
                        )}
                      </td>

                      {/* filterName */}
                      <td
                        className={`${cellClass("filterName")} text-gray-300 cursor-text`}
                        onClick={() =>
                          !a._deleted &&
                          !isEditing("filterName") &&
                          startEdit("associations", a.id, "filterName", a.filterName)
                        }
                      >
                        {isEditing("filterName") ? (
                          <input
                            autoFocus
                            className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-100 w-full"
                            value={(edit as any)?.value || ""}
                            onChange={(e) =>
                              setEdit((prev) => prev && { ...prev, value: e.target.value })
                            }
                            onBlur={commitEdit}
                            onKeyDown={onCellKey}
                          />
                        ) : (
                          a.filterName || <span className="text-gray-500">—</span>
                        )}
                      </td>

                      {/* location */}
                      <td
                        className={`${cellClass("location")} text-gray-300 cursor-text`}
                        onClick={() =>
                          !a._deleted &&
                          !isEditing("location") &&
                          startEdit("associations", a.id, "location", a.location)
                        }
                      >
                        {isEditing("location") ? (
                          <input
                            autoFocus
                            className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-100 w-full"
                            value={(edit as any)?.value || ""}
                            onChange={(e) =>
                              setEdit((prev) => prev && { ...prev, value: e.target.value })
                            }
                            onBlur={commitEdit}
                            onKeyDown={onCellKey}
                          />
                        ) : (
                          a.location || <span className="text-gray-500">—</span>
                        )}
                      </td>

                      {/* manager (click to change, otherwise show name) */}
                      <td className={cellClass("managerId")}>
                        {isEditing("managerId") ? (
                          <select
                            autoFocus
                            className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-100 w-full"
                            value={(edit as any)?.value || ""}
                            onChange={(e) =>
                              setEdit((prev) => prev && { ...prev, value: e.target.value })
                            }
                            onBlur={commitEdit}
                            onKeyDown={onCellKey}
                          >
                            {managers.filter((m) => !m._deleted).map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.initials})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            className="text-left w-full"
                            title="Click to change manager"
                            onClick={() =>
                              !a._deleted &&
                              startEdit(
                                "associations",
                                a.id,
                                "managerId",
                                a.managerId || managers.find((m) => !m._deleted)?.id || ""
                              )
                            }
                          >
                            {displayManager(a)}
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right space-x-3">
                        {/* {rowDirtyCount(dirtyAssoc, a.id) > 0 || a._isNew || a._deleted ? (
                          <button
                            className="text-yellow-400 hover:text-yellow-300"
                            onClick={() => revertAssociation(a.id)}
                          >
                            Revert
                          </button>
                        ) : null} */}
                        <button
                          className="text-red-400 hover:text-red-300"
                          onClick={() => stageDeleteAssociation(a.id)}
                        >
                          {a._deleted ? "Undelete" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {visibleAssociations.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                      No associations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-end">
            <button
              onClick={createManagerLocal}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
            >
              New Manager
            </button>
          </div>

          <div className="overflow-y-auto max-h-[70vh] rounded-xl border border-gray-800">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-900 text-gray-300">
                <tr>
                  <th className={thBtn} onClick={() => toggleMgrSort("name")}>
                    Name {mgrSortKey === "name" && sortIcon(mgrSortDir)}
                  </th>
                  <th className={thBtn} onClick={() => toggleMgrSort("email")}>
                    Email {mgrSortKey === "email" && sortIcon(mgrSortDir)}
                  </th>
                  <th className={thBtn} onClick={() => toggleMgrSort("titles")}>
                    Titles {mgrSortKey === "titles" && sortIcon(mgrSortDir)}
                  </th>
                  <th className={thBtn} onClick={() => toggleMgrSort("initials")}>
                    Initials {mgrSortKey === "initials" && sortIcon(mgrSortDir)}
                  </th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {visibleManagers.map((m) => {
                  const cellClass = (f: MgrField) =>
                    `px-4 py-3 ${isDirtyCell(dirtyMgr, m.id, f) ? "bg-yellow-900/30" : ""}`;
                  const isEditing = (f: MgrField) =>
                    edit && edit.table === "managers" && edit.id === m.id && edit.field === f;

                  return (
                    <tr key={m.id} className={`${m._deleted ? "opacity-50 line-through" : ""} hover:bg-gray-900/60`}>
                      {/* name */}
                      <td
                        className={`${cellClass("name")} text-white cursor-text`}
                        onClick={() =>
                          !m._deleted && !isEditing("name") && startEdit("managers", m.id, "name", m.name)
                        }
                      >
                        {isEditing("name") ? (
                          <input
                            autoFocus
                            className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-100 w-full"
                            value={(edit as any)?.value || ""}
                            onChange={(e) => setEdit((prev) => prev && { ...prev, value: e.target.value })}
                            onBlur={commitEdit}
                            onKeyDown={onCellKey}
                          />
                        ) : (
                          m.name || <span className="text-gray-500">—</span>
                        )}
                      </td>

                      {/* email */}
                      <td
                        className={`${cellClass("email")} text-gray-300 cursor-text break-all`}
                        onClick={() =>
                          !m._deleted && !isEditing("email") && startEdit("managers", m.id, "email", m.email)
                        }
                      >
                        {isEditing("email") ? (
                          <input
                            autoFocus
                            className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-100 w-full"
                            value={(edit as any)?.value || ""}
                            onChange={(e) => setEdit((prev) => prev && { ...prev, value: e.target.value })}
                            onBlur={commitEdit}
                            onKeyDown={onCellKey}
                          />
                        ) : (
                          m.email || <span className="text-gray-500">—</span>
                        )}
                      </td>

                      {/* titles */}
                      <td
                        className={`${cellClass("titles")} text-gray-300 cursor-text`}
                        onClick={() =>
                          !m._deleted && !isEditing("titles") && startEdit("managers", m.id, "titles", m.titles)
                        }
                      >
                        {isEditing("titles") ? (
                          <input
                            autoFocus
                            className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-100 w-full"
                            value={(edit as any)?.value || ""}
                            onChange={(e) => setEdit((prev) => prev && { ...prev, value: e.target.value })}
                            onBlur={commitEdit}
                            onKeyDown={onCellKey}
                          />
                        ) : (
                          m.titles || <span className="text-gray-500">—</span>
                        )}
                      </td>

                      {/* initials */}
                      <td
                        className={`${cellClass("initials")} text-gray-300 cursor-text`}
                        onClick={() =>
                          !m._deleted && !isEditing("initials") && startEdit("managers", m.id, "initials", m.initials)
                        }
                      >
                        {isEditing("initials") ? (
                          <input
                            autoFocus
                            className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-100 w-full"
                            value={(edit as any)?.value || ""}
                            onChange={(e) => setEdit((prev) => prev && { ...prev, value: e.target.value })}
                            onBlur={commitEdit}
                            onKeyDown={onCellKey}
                          />
                        ) : (
                          m.initials || <span className="text-gray-500">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right space-x-3">
                        {/* {rowDirtyCount(dirtyMgr, m.id) > 0 || m._isNew || m._deleted ? (
                          <button
                            className="text-yellow-400 hover:text-yellow-300"
                            onClick={() => revertManager(m.id)}
                          >
                            Revert
                          </button>
                        ) : null} */}
                        <button
                          className="text-red-400 hover:text-red-300"
                          onClick={() => stageDeleteManager(m.id)}
                        >
                          {m._deleted ? "Undelete" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {visibleManagers.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                      No managers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
