"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiFetch } from "@/lib/api"

type PublicUser = {
  id: string
  displayName?: string
  firstName?: string
  lastName?: string
  bio?: string
  avatar?: string
  role?: string
  company?: string
  location?: string
}

export default function PublicUserPage() {
  const params = useParams()
  const identifier = (params.slug ?? params.id) as string
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    apiFetch<{ user?: PublicUser }>(`/api/users/${identifier}`, { auth: false })
      .then((res) => {
        if (!cancelled) setUser(res.user ?? null)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load user")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [identifier])

  if (loading) return <div className="p-8">Loading profile...</div>
  if (error || !user) return <div className="p-8 text-red-600">User profile not found.</div>

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold">
        {user.displayName || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User"}
      </h1>
      {user.role ? <p className="text-gray-600 mt-1">{user.role}</p> : null}
      {user.bio ? <p className="mt-4 text-gray-700">{user.bio}</p> : null}
      {user.company ? <p className="mt-2 text-gray-700">Company: {user.company}</p> : null}
      {user.location ? <p className="mt-1 text-gray-700">Location: {user.location}</p> : null}
    </main>
  )
}
