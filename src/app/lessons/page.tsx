"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LessonCarousel from "../../../components/LessonCarousel"
import { Lesson } from "../../../types/lesson"

export default function LessonsPage() {
  const router = useRouter()
  const [learnerId, setLearnerId] = useState("")
  
  const [lessons, setLessons] = useState<Lesson[]>([])
  
  useEffect(() => {
    async function loadLessons() {
      const storedLearnerId = localStorage.getItem("learnerId")

      if (!storedLearnerId) return

      setLearnerId(storedLearnerId)

      try {
        const res = await fetch(
          `/api/lessons?learnerId=${storedLearnerId}`
        )

        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed")
        }

        setLessons(data)
      } catch (err) {
        console.error("Failed to load lessons", err)
      }
    }

    loadLessons()
  }, [])
  

  return (
    <div className="w-full lg:min-w-100 flex flex-col justify-center items-center">
      <div className="w-full absolute top-0 left-0 flex items-center justify-center">
        <div className="lg:max-w-200 w-full lg:h-[15vh] h-[10vh] mb-4 p-4 rounded-xl shadow-lg border flex flex-col items-center justify-center gap-3">
          <h1 className="lg:text-5xl text-3xl font-bold lg:p-4 p-12">Lessons</h1>
        </div>
      </div>
      <div className="absolute pt-4 w-full lg:top-[15vh] top-[10vh] lg:max-w-200 lg:max-h-screen h-screen ">
        <LessonCarousel lessons={lessons} learnerId={learnerId}/>
      </div>
      <div className="fixed bottom-4 right-4 z-50 w-fit">
          <button
            type="button"
            onClick={() => router.push("/homeworks")}
            className="w-full max-w-xs rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700"
          >
            Go to Homework
          </button>
      </div>
    </div>
  )
}