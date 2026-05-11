"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const USERS = [
  "A Hoài"
]

export default function HomePage() {
  const router = useRouter()

  const [selectedUser, setSelectedUser] = useState("")

  useEffect(() => {
    const cached = localStorage.getItem("learner_id")

    if (cached) {
      router.push("/lessons")
    }
  }, [router])

  const handleContinue = () => {
    if (!selectedUser) return

    localStorage.setItem("learner_id", selectedUser)

    router.push("/lessons")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Select Learner
        </h1>

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full rounded-xl border p-4"
        >
          <option value="">Choose learner</option>

          {USERS.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>

        <button
          onClick={handleContinue}
          className="mt-6 w-full rounded-xl bg-black p-4 text-white"
        >
          Continue
        </button>
      </div>
    </main>
  )
}