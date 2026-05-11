"use client"

import { useMemo, useState } from "react"

import { LessonCardData } from "../types/lesson"
import { shuffle } from "../lib/shuffle"

import OptionButton from "./OptionButton"

interface Props {
  card: LessonCardData
}

export default function LessonCard({ card }: Props) {
const [selectedOption, setSelectedOption] = useState<string | null>(null)
const [completed, setCompleted] = useState(false)

const handleSelect = (option: string) => {
  if (completed) return

  setSelectedOption(option)

  if (option === card.correct) {
    setCompleted(true)
  }
}
  const options = useMemo(() => {
    return shuffle([
      card.correct,
      card.wrong1,
      card.wrong2,
    ])
  }, [card])
  return (
    <div className="flex min-h-[70vh] flex-col justify-center gap-8 rounded-3xl bg-white p-6 shadow-xl">
      <h2 className="text-center text-2xl font-bold leading-relaxed">
        {card.sentence}
      </h2>

      <div className="space-y-4">
        {options.map((option) => {
          let state: "default" | "correct" | "wrong" = "default"

          if (selectedOption === option) {
            state = option === card.correct ? "correct" : "wrong"
          }

          return (
            <OptionButton
                key={option}
                option={option}
                onClick={() => handleSelect(option)}
                state={
                    selectedOption === option
                    ? option === card.correct
                        ? "correct"
                        : "wrong"
                    : "default"
                }
                />
          )
        })}
      </div>
    </div>
  )
}