"use client"
import { useEffect, useState } from "react"
import LessonCarousel from "../../../components/LessonCarousel"
import { Lesson } from "../../../types/lesson"

export default function LessonsPage() {
  const [learnerId, setLearnerId] = useState("")
  
  const [lessons, setLessons] = useState<Lesson[]>([])
  
  useEffect(() => {
    async function loadLessons() {
      const storedLearnerId = localStorage.getItem("learnerId")

      console.log("storedLearnerId:", storedLearnerId)

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

        console.log("lessons:", data)

        setLessons(data)
      } catch (err) {
        console.error("Failed to load lessons", err)
      }
    }

    loadLessons()
  }, [])
  

  return (
    <main className="min-h-screen p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lessons</h1>
      </div>

      <LessonCarousel lessons={lessons} learnerId={learnerId}/>
    </main>
  )
}