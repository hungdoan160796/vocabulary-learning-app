"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"

import LessonCard from "../../../../components/LessonCards"
import SwipeContainer from "../../../../components/SwipeContainer"
import { lessons } from "../../../../lib/lessons"

export default function LessonPage() {
  const params = useParams()

  const [currentIndex, setCurrentIndex] = useState(0)

  const lesson = useMemo(() => {
    return lessons.find((l) => l.id === params.id)
  }, [params.id])

  if (!lesson) {
    return <div>Lesson not found</div>
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
    <main className="w-100 p-4">
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
        <button onClick={prev} className="mr-4 rounded-xl bg-gray-500 p-4">
          Previous
        </button>
        <button onClick={() => window.history.back()} className="rounded-xl bg-gray-500 p-4">
            Back to lessons
        </button>
        <button onClick={next} className="ml-4 rounded-xl bg-gray-500 p-4">
          Next
        </button>
        <div className="w-10"></div>
      </div>
    </main>
  )
}