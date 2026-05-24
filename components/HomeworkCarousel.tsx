"use client"

import Link from "next/link"
import { Homeworks } from "../types/lesson"

interface Props {
  learnerId: string;
  homeworks: Homeworks[]
}

export default function LessonCarousel({ homeworks, learnerId }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {homeworks.map((hw) => (
        <Link
          key={hw.id}
          href={`/homeworks/${hw.id}?learnerId=${learnerId}`}
          className="break-inside-avoid border rounded-3xl shadow-lg flex flex-col justify-center items-center transition hover:shadow-xl lg:p-4 p-8 w-full"
        >
          <h2 className="lg:text-2xl text-xl font-bold">
            {hw.title}
          </h2>
        </Link>
      ))}
    </div>
  )
}