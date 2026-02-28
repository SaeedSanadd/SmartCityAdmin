import { useMemo, useState } from "react";

export default function AdminsPage() {
    const [q, setQ] = useState("");

    const [admins, setAdmins] = useState(() => [
        { id: "a1", name: "Saeed Sanad", email: "saeedsanadd@gmail.com", status: "Active" },
        { id: "a2", name: "Ahmed Hassan", email: "ahmed@gmail.com", status: "Active" },
        { id: "a3", name: "Mona Ali", email: "mona@gmail.com", status: "Inactive" },
    ]);

    const [open, setOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: "", email: "" });

    const filtered = useMemo(() => {
        return admins.filter((a) =>
            `${a.name} ${a.email}`.toLowerCase().includes(q.toLowerCase())
        );
    }, [admins, q]);

    function addAdmin(e) {
        e.preventDefault();

        if (!newAdmin.name.trim() || !newAdmin.email.trim()) return;

        setAdmins((prev) => [
            {
                id: `a${Date.now()}`,
                name: newAdmin.name.trim(),
                email: newAdmin.email.trim(),
                status: "Active",
            },
            ...prev,
        ]);

        setNewAdmin({ name: "", email: "" });
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

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admins</h1>
                    <p className="text-sm text-slate-500">Manage admin accounts.</p>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-sm font-semibold"
                >
                    + Add Admin
                </button>
            </div>

            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or email"
                className="w-full md:w-80 rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />

            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 border-b bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                    <div className="col-span-4">Admin</div>
                    <div className="col-span-4">Email</div>
                    <div className="col-span-2">Status</div>
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

                            <div className="col-span-4 text-sm text-slate-700">{a.email}</div>

                            <div className="col-span-2">
                                <Badge tone={a.status === "Active" ? "success" : "neutral"}>
                                    {a.status}
                                </Badge>
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

            {open && (
                <div
                    className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white border shadow-lg p-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-bold text-slate-900">Add Admin</h2>

                        <form onSubmit={addAdmin} className="mt-4 space-y-3">
                            <input
                                value={newAdmin.name}
                                onChange={(e) => setNewAdmin((p) => ({ ...p, name: e.target.value }))}
                                placeholder="Name"
                                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                            />

                            <input
                                value={newAdmin.email}
                                onChange={(e) => setNewAdmin((p) => ({ ...p, email: e.target.value }))}
                                placeholder="Email"
                                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                            />

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