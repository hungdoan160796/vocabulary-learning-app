"use client"

import Link from "next/link"

import { Lesson } from "../types/lesson"

interface Props {
  learnerId: string;
  lessons: Lesson[]
}

export default function LessonCarousel({ lessons, learnerId }: Props) {
  return (
    <div className="w-full columns-2 gap-4 space-y-4">
      {lessons.map((lesson) => (
        <Link
          key={lesson.id}
          href={`/lessons/${lesson.id}?learnerId=${learnerId}`}
          className="break-inside-avoid border rounded-3xl shadow-lg flex flex-col justify-center items-center transition hover:shadow-xl lg:p-4 p-8 w-full"
        >
          <h2 className="lg:text-3xl text-xl font-bold">
            {lesson.title}
          </h2>

          <p className="lg:text-2xl mt-4 text-gray-600">
            {lesson.cards.length} cards
          </p>
        </Link>
      ))}
    </div>
  )
}