"use client"

import Link from "next/link"

import { Lesson } from "../types/lesson"

interface Props {
  lessons: Lesson[]
}

export default function LessonCarousel({ lessons }: Props) {
  return (
    <div className="flex snap-x gap-4 overflow-x-auto pb-4">
      {lessons.map((lesson) => (
        <Link
          key={lesson.id}
          href={`/lessons/${lesson.id}`}
          className="min-w-70 snap-center rounded-3xl bg-white p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold">{lesson.title}</h2>

          <p className="mt-4 text-gray-600">
            {lesson.cards.length} cards
          </p>
        </Link>
      ))}
    </div>
  )
}