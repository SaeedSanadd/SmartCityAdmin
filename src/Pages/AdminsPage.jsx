import { useMemo, useState } from "react";

export default function AdminsPage() {
    const [q, setQ] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");

    const [admins, setAdmins] = useState(() => [
        { id: "a1", name: "Saeed Sanad", email: "saeedsanadd@gmail.com", role: "Super Admin", status: "Active" },
        { id: "a2", name: "Ahmed Hassan", email: "ahmed@gmail.com", role: "Admin", status: "Active" },
        { id: "a3", name: "Mona Ali", email: "mona@gmail.com", role: "Admin", status: "Inactive" },
    ]);

    const [open, setOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: "", email: "", role: "Admin" });

    const filtered = useMemo(() => {
        return admins.filter((a) => {
            const matchQ =
                q.trim() === "" ||
                `${a.name} ${a.email}`.toLowerCase().includes(q.toLowerCase());

            const matchRole = roleFilter === "All" ? true : a.role === roleFilter;
            return matchQ && matchRole;
        });
    }, [admins, q, roleFilter]);

    function addAdmin(e) {
        e.preventDefault();

        if (!newAdmin.name.trim() || !newAdmin.email.trim()) return;

        setAdmins((prev) => [
            {
                id: `a${Date.now()}`,
                name: newAdmin.name.trim(),
                email: newAdmin.email.trim(),
                role: newAdmin.role,
                status: "Active",
            },
            ...prev,
        ]);

        setNewAdmin({ name: "", email: "", role: "Admin" });
        setOpen(false);
    }

    function deleteAdmin(id) {
        const ok = confirm("Delete this admin?");
        if (!ok) return;
        setAdmins((prev) => prev.filter((a) => a.id !== id));
    }

    function toggleStatus(id) {
        setAdmins((prev) =>
            prev.map((a) =>
                a.id === id ? { ...a, status: a.status === "Active" ? "Inactive" : "Active" } : a
            )
        );
    }

    function changeRole(id, role) {
        setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, role } : a)));
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admins</h1>
                    <p className="text-sm text-slate-500">Manage admin accounts and roles.</p>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-sm font-semibold"
                >
                    + Add Admin
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-2">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by name or email"
                    className="w-full md:w-80 rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                />

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                >
                    <option value="All">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                </select>
            </div>

            {/* Table */}
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 border-b bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                    <div className="col-span-4">Admin</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-2">Role</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {filtered.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500">No admins found.</div>
                ) : (
                    filtered.map((a) => (
                        <div key={a.id} className="grid grid-cols-12 px-4 py-4 border-b items-center">
                            <div className="col-span-4">
                                <p className="font-semibold text-slate-900">{a.name}</p>
                                <p className="text-xs text-slate-500">ID: {a.id}</p>
                            </div>

                            <div className="col-span-3 text-sm text-slate-700">{a.email}</div>

                            <div className="col-span-2">
                                <select
                                    value={a.role}
                                    onChange={(e) => changeRole(a.id, e.target.value)}
                                    className="rounded-xl border bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Super Admin">Super Admin</option>
                                </select>
                            </div>

                            <div className="col-span-1">
                                <Badge tone={a.status === "Active" ? "success" : "neutral"}>{a.status}</Badge>
                            </div>

                            <div className="col-span-2 flex justify-end gap-2">
                                <button
                                    onClick={() => toggleStatus(a.id)}
                                    className="rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50"
                                >
                                    Toggle
                                </button>

                                <button
                                    onClick={() => deleteAdmin(a.id)}
                                    className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-1.5 text-sm hover:bg-red-100"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {open && (
                <div
                    className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white border shadow-lg p-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Add Admin</h2>
                                <p className="text-xs text-slate-500">Create a new admin account (mock).</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-900">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={addAdmin} className="mt-4 space-y-3">
                            <div>
                                <label className="text-xs text-slate-500">Name</label>
                                <input
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin((p) => ({ ...p, name: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                                    placeholder="Admin name"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate-500">Email</label>
                                <input
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin((p) => ({ ...p, email: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                                    placeholder="admin@email.com"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate-500">Role</label>
                                <select
                                    value={newAdmin.role}
                                    onChange={(e) => setNewAdmin((p) => ({ ...p, role: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Super Admin">Super Admin</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2 text-sm font-semibold"
                            >
                                Add
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function Badge({ children, tone = "neutral" }) {
    const cls =
        tone === "success"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-slate-50 text-slate-700 border-slate-200";

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${cls}`}>
            {children}
        </span>
    );
}