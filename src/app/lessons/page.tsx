"use client"
import { useEffect, useState } from "react"
import LessonCarousel from "../../../components/LessonCarousel"
import { Lesson } from "../../../types/lesson"
import { ThemeToggle } from "../../../components/ThemeToggle"

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
    <div className="w-full lg:min-w-100 flex flex-col justify-center items-center">
      <div className="w-full absolute top-0 left-0  flex items-center justify-center">
        <div className="lg:max-w-200 w-full lg:h-[15vh] h-[10vh] mb-4 p-4 rounded-xl shadow-lg border flex items-center justify-center">
        <h1 className="lg:text-5xl text-3xl font-bold lg:p-4 p-12">Lessons</h1>
        </div>
      </div>
      <div className="absolute w-full lg:top-[15vh] top-[10vh] lg:max-w-200 lg:max-h-screen h-screen ">
        <LessonCarousel lessons={lessons} learnerId={learnerId}/>
      </div>
    </div>
  )
}