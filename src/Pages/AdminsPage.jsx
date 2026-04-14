import { useMemo, useState, useEffect } from "react";
import {
    collection,
    onSnapshot,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { setDoc } from "firebase/firestore";

import {
    createUserWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useTranslation } from "react-i18next";

export default function AdminsPage() {
    const { t } = useTranslation();

    const [q, setQ] = useState("");
    const [admins, setAdmins] = useState([]);
    const [open, setOpen] = useState(false);

    const [newAdmin, setNewAdmin] = useState({
        name: "",
        email: "",
        password: "",
    });

    // 🔥 GET ADMINS
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "admins"), (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setAdmins(data);
        });

        return () => unsubscribe();
    }, []);

    // 🔍 FILTER
    const filtered = useMemo(() => {
        return admins.filter((a) =>
            `${a.name} ${a.email}`.toLowerCase().includes(q.toLowerCase())
        );
    }, [admins, q]);

    // ➕ ADD ADMIN
    async function addAdmin(e) {
        e.preventDefault();

        if (!newAdmin.name || !newAdmin.email || !newAdmin.password) return;

        try {
            const userCred = await createUserWithEmailAndPassword(
                auth,
                newAdmin.email,
                newAdmin.password
            );

            const user = userCred.user;

            await setDoc(doc(db, "admins", user.uid), {
                uid: user.uid,
                name: newAdmin.name,
                email: newAdmin.email,
                role: "admin",
            });

            await signOut(auth);

            setNewAdmin({
                name: "",
                email: "",
                password: "",
            });

            setOpen(false);

        } catch (error) {
            alert(error.message);
        }
    }

    // ❌ DELETE
    async function deleteAdmin(id) {
        const ok = confirm(t("delete_admin_confirm"));
        if (!ok) return;

        await deleteDoc(doc(db, "admins", id));
    }

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {t("admins")}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {t("admins_desc")}
                    </p>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-sm font-semibold"
                >
                    + {t("add_admin")}
                </button>
            </div>

            {/* Search */}
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("search_admin")}
                className="w-full md:w-80 rounded-xl border bg-white px-3 py-2 text-sm"
            />

            {/* Table */}
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

                <div className="grid grid-cols-12 border-b bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                    <div className="col-span-5">{t("admin")}</div>
                    <div className="col-span-5">{t("email")}</div>
                    <div className="col-span-2 text-right">{t("actions")}</div>
                </div>

                {filtered.map((a) => (
                    <div key={a.id} className="grid grid-cols-12 px-4 py-4 border-b items-center">

                        <div className="col-span-5">
                            <p className="font-semibold">{a.name}</p>
                            <p className="text-xs text-gray-500">ID: {a.id}</p>
                        </div>

                        <div className="col-span-5">{a.email}</div>

                        <div className="col-span-2 text-right">
                            <button
                                onClick={() => deleteAdmin(a.id)}
                                className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-1.5 text-sm"
                            >
                                {t("delete")}
                            </button>
                        </div>

                    </div>
                ))}
            </div>

            {/* MODAL */}
            {open && (
                <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center">
                    <div className="bg-white p-5 rounded-2xl w-full max-w-md">

                        <h2 className="text-lg font-bold">
                            {t("add_admin")}
                        </h2>

                        <form onSubmit={addAdmin} className="mt-4 space-y-3">

                            <input
                                value={newAdmin.name}
                                onChange={(e) => setNewAdmin((p) => ({ ...p, name: e.target.value }))}
                                placeholder={t("name")}
                                className="w-full border p-2 rounded"
                            />

                            <input
                                value={newAdmin.email}
                                onChange={(e) => setNewAdmin((p) => ({ ...p, email: e.target.value }))}
                                placeholder={t("email")}
                                className="w-full border p-2 rounded"
                            />

                            <input
                                type="password"
                                value={newAdmin.password}
                                onChange={(e) => setNewAdmin((p) => ({ ...p, password: e.target.value }))}
                                placeholder={t("password")}
                                className="w-full border p-2 rounded"
                            />

                            <button className="w-full bg-black text-white py-2 rounded">
                                {t("add")}
                            </button>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
