"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Homeworks } from "../../../types/lesson"
import HomeworkCarousel from "../../../components/HomeworkCarousel"

export default function homeworkPage() {
  const router = useRouter()
  const [learnerId, setLearnerId] = useState("")
  
  const [homeworks, sethomeworks] = useState<Homeworks[]>([])
  
  useEffect(() => {
    async function loadhomework() {
      const storedLearnerId = localStorage.getItem("learnerId")

      if (!storedLearnerId) return

      setLearnerId(storedLearnerId)

      try {
        const res = await fetch(
          `/api/homeworks?learnerId=${storedLearnerId}`
        )

        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed")
        }

        sethomeworks(data)
      } catch (err) {
        console.error("Failed to load homework", err)
      }
    }

    loadhomework()
  }, [])
  

  return (
    <div className="w-full lg:min-w-100 flex flex-col items-center justify-center">
      <div className="w-full absolute top-0 left-0  flex items-center justify-center">
        <div className="lg:max-w-200 w-full lg:h-[15vh] h-[10vh] mb-4 p-4 rounded-xl shadow-lg border flex flex-col items-center justify-center gap-3">
          <h1 className="lg:text-5xl text-3xl font-bold lg:p-4 p-12">Homework</h1>
          <div className="flex w-full max-w-xs flex-col gap-3">
          </div>
        </div>
      </div>
      <div className="absolute pt-4 w-full lg:top-[15vh] top-[10vh] lg:max-w-200 lg:max-h-screen h-screen ">
        <HomeworkCarousel homeworks={homeworks} learnerId={learnerId}/>
      </div>
        
      <div className="sticky bottom-2 right-2 w-fit">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700"
      >
        Go to Lessons
      </button>
      </div>
    </div>
  )
}