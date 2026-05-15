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

    <div className="w-full flex flex-col justify-center items-center min-w-100 p-6">
      <div className="lg:w-full lg:max-w-200 w-full lg:max-h-screen h-screen flex flex-col justify-start">
        <div className="lg:h-[15vh] h-[10vh] mb-4 flex items-center justify-between p-8 rounded-xl shadow-lg">
          <h1 className="lg:text-4xl text-7xl font-bold lg:p-4 p-12">{lesson.title}</h1>

          <p className="lg:text-xl text-3xl mt-4 text-gray-600 lg:px-4 px-12">
            {currentIndex + 1} / {lesson.cards.length}
          </p>
        </div>

        <SwipeContainer onNext={next} onPrev={prev}>
          <LessonCard
            key={currentIndex}
            card={lesson.cards[currentIndex]}
          />
        </SwipeContainer>
        <div className="flex justify-center items-center lg:min-h-[10vh] min-h-[10vh]">
          <div className="lg:min-w-40">
          <button onClick={prev} className="w-full lg:text-3xl text-5xl rounded-xl lg:p-4 p-12 shadow-xl">
            Previous
          </button>
          </div>
          <div className="lg:w-40"></div>
          <button onClick={() => window.history.back()} className="w-full lg:text-3xl text-5xl rounded-xl lg:p-4 p-12 shadow-xl">
              Back to lessons
          </button>
          <div className="lg:w-40"></div>
          <div className="lg:min-w-40">
          <button onClick={next} className="w-full lg:text-3xl text-5xl rounded-xl lg:p-4 p-12 shadow-xl">
            Next
          </button></div>
        </div>
      </div>
    </div>
  )
}