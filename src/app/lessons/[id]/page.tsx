"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"

import LessonCard from "../../../../components/LessonCards"
import SwipeContainer from "../../../../components/SwipeContainer"
import { Lesson } from "../../../../types/lesson"

export default function LessonPage() {
  const params = useParams()
  const searchParams = useSearchParams()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function loadLesson() {
      try {
        const learnerId = searchParams.get("learnerId")

        const res = await fetch(
          `/api/lessons/${params.id}?learnerId=${learnerId}`
        )

        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed")
        }
        setLesson(data)
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
    <div className="w-[50%] min-w-100 p-6">
      <div className="w-full flex flex-col justify-center p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">{lesson.title}</h1>

          <p>
            {currentIndex + 1} / {lesson.cards.length}
          </p>
        </div>

        <SwipeContainer onNext={next} onPrev={prev}>
          <LessonCard
            key={currentIndex}
            card={lesson.cards[currentIndex]}
          />
        </SwipeContainer>
        <div className="flex justify-between items-center">
          <div className="w-10"></div>
          <button onClick={prev} className="mr-4 rounded-xl p-4 min-width-[20vw]">
            Previous
          </button>
          <button onClick={() => window.history.back()} className="rounded-xl p-4 min-width-[20vw]">
              Back to lessons
          </button>
          <button onClick={next} className="ml-4 rounded-xl p-4 min-width-[20vw]">
            Next
          </button>
          <div className="w-10"></div>
        </div>
      </div>
    </div>
  )
}