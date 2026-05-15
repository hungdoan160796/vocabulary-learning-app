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
      <div className="lg:w-full lg:max-w-200 w-full lg:max-h-screen h-screen flex flex-col justify-start ">
        <div className="lg:h-[15vh] h-[10vh] mb-4 flex items-center justify-between p-8 rounded-xl shadow-lg border ">
          <h1 className="lg:text-4xl text-7xl font-bold lg:p-4 p-12">Lessons</h1>
        </div>

        <LessonCarousel lessons={lessons} learnerId={learnerId}/>
      </div>
    </div>
  )
}