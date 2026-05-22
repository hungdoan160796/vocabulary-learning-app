"use client"

import { useState } from "react"

import ChartRenderer from "./ChartRenderer"
import { FlipCardData } from "../types/lesson"

interface Props {
  card: FlipCardData
}

export default function FlipCard({ card }: Props) {
  const [flipped, setFlipped] = useState(false)

  const toggleFlip = () => {
    setFlipped((current) => !current)
  }

  return (
    <button
      type="button"
      onClick={toggleFlip}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          toggleFlip()
        }
      }}
      className="w-full rounded-3xl bg-white p-4 transition focus:outline-none focus:ring-2 focus:ring-sky-500"
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full min-h-96 transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 py-6"
          style={{ backfaceVisibility: "hidden" }}
        >
          {card.data ? <ChartRenderer data={card.data} /> : null}
          <h2 className="text-center lg:text-2xl text-xl font-bold leading-relaxed">
            {card.sentence}
          </h2>
          <p className="text-sm text-slate-500">Tap to reveal answer</p>
        </div>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 py-6"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Answer</p>
            <h2 className="mt-2 text-center lg:text-2xl text-xl font-bold leading-relaxed">
              {card.correct}
            </h2>
            {card.translation ? (
              <p className="mt-4 text-center lg:text-xl text-base text-slate-600">
                {card.translation}
              </p>
            ) : null}
          </div>
          <p className="text-sm text-slate-500">Tap again to flip back</p>
        </div>
      </div>
    </button>
  )
}
