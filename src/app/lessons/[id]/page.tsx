"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Volume2, VolumeX } from "lucide-react"
import LessonCard from "../../../../components/LessonCards"
import SwipeContainer from "../../../../components/SwipeContainer"
import { Lesson } from "../../../../types/lesson"
import { ThemeToggle } from "../../../../components/ThemeToggle"
import { shuffle } from "../../../../lib/shuffle"

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const learnerId = searchParams.get("learnerId")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  useEffect(() => {
    const saved = localStorage.getItem("lesson-sound-enabled")

    if (saved !== null) {
      setSoundEnabled(saved === "true")
    }
  }, [])
  const toggleSound = () => {
    const next = !soundEnabled

    setSoundEnabled(next)
    localStorage.setItem("lesson-sound-enabled", String(next))
  }
  useEffect(() => {
    async function loadLesson() {
      try {

        const res = await fetch(
          `/api/lessons/${params.id}?learnerId=${learnerId}`
        )

        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed")
        }
        setLesson({ ...data, cards: shuffle(data.cards) })
      } catch (err) {
        console.error("Failed to load lesson", err)
      }
    }

    loadLesson()
  }, [params.id, searchParams])

  if (!lesson) {
    return <div>Loading...</div>
  }

  const next = () => {
    if (currentIndex < lesson.cards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }


  return (
    <div className="w-full lg:min-w-100 flex flex-col justify-center items-center">
      <div className="w-full absolute top-0 left-0  flex items-center justify-center">
        <div className="lg:max-w-120 w-full h-[10vh] mb-4 p-4 rounded-xl shadow-lg border flex items-center justify-between">
          <p className="lg:text-2xl text-xl text-gray-600">
            {currentIndex + 1} / {lesson.cards.length}
          </p>
        
          <button
            onClick={toggleSound}
            className="flex flex-row justify-center items-center rounded-xl gap-4"
          >
            Mute?
            {soundEnabled ? (
              <Volume2 className="lg:h-[2vw] lg:w-[2vw] h-4 w-4" />
            ) : (
              <VolumeX className="lg:h-[2vw] lg:w-[2vw] h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <div className="absolute top-[10vh] h-[66vh] w-full lg:max-w-120 flex flex-col justify-start scroll-auto">
        <SwipeContainer onNext={next} onPrev={prev}>
          <LessonCard
            key={currentIndex}
            card={lesson.cards[currentIndex]}
            soundEnabled={soundEnabled}
          />
        </SwipeContainer>
      </div>
      <div className="absolute bottom-0 w-full px-4 lg:max-w-120 flex justify-between items-center h-[10vh] m-0 p-0">
          <button onClick={prev} className="lg:text-2xl rounded-xl lg:p-4 shadow-xl">
            Previous
          </button>
          <button onClick={() => router.push("/")} className="lg:text-2xl rounded-xl lg:p-4 shadow-xl">
              Back to lessons
          </button>
          <button onClick={next} className="lg:text-2xl rounded-xl lg:p-4 shadow-xl">
            Next
          </button>
        </div>
    </div>
  )
}