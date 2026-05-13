"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "learnerId"

export function useLocalUser() {
  const [learnerId, setLearnerId] = useState<string | null>(null)

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY)

    if (cached) {
      setLearnerId(cached)
    }
  }, [])

  const saveUser = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id)
    setLearnerId(id)
  }

  const clearUser = () => {
    localStorage.removeItem(STORAGE_KEY)
    setLearnerId(null)
  }

  return {
    learnerId,
    saveUser,
    clearUser,
  }
}