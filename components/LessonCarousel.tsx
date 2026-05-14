"use client"

import Link from "next/link"

import { Lesson } from "../types/lesson"

interface Props {
  learnerId: string;
  lessons: Lesson[]
}

export default function LessonCarousel({ lessons, learnerId }: Props) {
  return (
    <div className="flex snap-x gap-4 overflow-x-auto pb-4">
      {lessons.map((lesson) => (
        <Link
          key={lesson.id}
          href={`/lessons/${lesson.id}?learnerId=${learnerId}`}
          className="snap-center rounded-3xl bg-white shadow-lg flex flex-col justify-center items-center min-w-[40%] transition hover:shadow-xl lg:p-4 p-12 m-[5%]"
        >
          <h2 className="lg:text-3xl text-5xl font-bold">{lesson.title}</h2>

          <p className="lg:text-xl text-3xl mt-4 text-gray-600">
            {lesson.cards.length} cards
          </p>
        </Link>
      ))}
    </div>
  )
}