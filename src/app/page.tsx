"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  const [selectedUser, setSelectedUser] = useState("")

  useEffect(() => {
    const cached = localStorage.getItem("learnerId")

    if (cached) {
      router.push("/lessons")
    }
  }, [router])

  const handleContinue = () => {
    if (!selectedUser) return

    localStorage.setItem("learnerId", selectedUser)

    router.push("/lessons")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Select Learner
        </h1>
        <p className="mb-4 text-center text-gray-600">
          Please enter your learner ID.
        </p>

        <input
          type="text"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full rounded-xl border p-4"
        ></input>

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