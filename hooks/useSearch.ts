"use client"

import { useState, useEffect, useCallback } from "react"
import type { Location } from "@/types"

export function useSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  return { query, setQuery, results, loading }
}
