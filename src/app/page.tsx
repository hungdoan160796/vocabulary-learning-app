"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle} from "../../components/ThemeToggle"

export default function HomePage() {
  const router = useRouter()

  const [selectedUser, setSelectedUser] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const cached = localStorage.getItem("learnerId")

    if (cached) {
      router.push("/lessons")
    }
  }, [router])

  const handleContinue = async () => {
    if (!selectedUser) return

    setError("")

    try {
      const res = await fetch("/api/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          learnerId: selectedUser,
        }),
      })

      const data = await res.json()

      if (!data.exists) {
        setError("Wrong ID")
        return
      }

      localStorage.setItem("learnerId", selectedUser)

      router.push("/lessons")
    } catch (err) {
      console.error(err)
      setError("Something went wrong")
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
    
      <div className="w-full max-w-sm rounded-3xl p-6 shadow-xl">
        <h1 className="mb-6 text-center text-7xl font-bold">
          Select Learner
        </h1>

        <p className="mb-4 text-center text-gray-600">
          Please enter your learner ID.
        </p>

        <input
          type="text"
          value={selectedUser}
          onChange={(e) => {
            setSelectedUser(e.target.value)
            setError("")
          }}
          className="w-full rounded-xl border p-4"
        />

        {error && (
          <p className="mt-3 text-center text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          onClick={handleContinue}
          className="mt-6 w-full rounded-xl p-4 text-white"
        >
          Continue
        </button>
      </div>
    </main>
  )
}