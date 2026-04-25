"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, User, Trash2, RefreshCw } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: "USER" | "ADMIN"
  createdAt: string
  _count: { savedAreas: number; reports: number }
}

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) setUsers(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleRole = async (user: AdminUser) => {
    setBusy(user.id)
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN"
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u))
    } else {
      const data = await res.json()
      alert(data.error ?? "Failed to update role")
    }
    setBusy(null)
  }

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`Delete user ${user.email}? This cannot be undone.`)) return
    setBusy(user.id)
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } else {
      alert("Failed to delete user")
    }
    setBusy(null)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        Loading users...
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500">{users.length} total users</span>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2.5">User</th>
              <th className="text-left px-4 py-2.5">Role</th>
              <th className="text-left px-4 py-2.5 hidden sm:table-cell">Areas</th>
              <th className="text-left px-4 py-2.5 hidden sm:table-cell">Reports</th>
              <th className="text-left px-4 py-2.5 hidden md:table-cell">Joined</th>
              <th className="px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{user.name ?? "—"}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold ${
                    user.role === "ADMIN"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {user.role === "ADMIN" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-600">{user._count.savedAreas}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-600">{user._count.reports}</td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-500 text-xs">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      disabled={busy === user.id}
                      onClick={() => toggleRole(user)}
                      className="text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors font-medium"
                    >
                      {user.role === "ADMIN" ? "Demote" : "Make Admin"}
                    </button>
                    <button
                      disabled={busy === user.id}
                      onClick={() => deleteUser(user)}
                      className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
