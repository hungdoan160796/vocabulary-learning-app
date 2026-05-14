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
    <div className="w-full flex flex-col justify-center items-center min-w-100 p-6">
      <div className="w-[50%] flex flex-col justify-center p-4">
        <div className="mb-4 flex items-center justify-between p-8 rounded-xl shadow-lg bg-white">
        <h1 className="text-3xl font-bold">Lessons</h1>
      </div>

      <LessonCarousel lessons={lessons} learnerId={learnerId}/>
      </div>
    </div>
  )
}