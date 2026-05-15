"use client"

import { useMemo, useState, useEffect } from "react"
import { Volume2 } from "lucide-react"

import { LessonCardData } from "../types/lesson"
import { shuffle } from "../lib/shuffle"

import OptionButton from "./OptionButton"

interface Props {
  card: LessonCardData
}

export default function LessonCard({ card }: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const getAudioPath = (type: 1 | 2) => {
    const safeCorrect = card.correct
      .toLowerCase()
      .replace(/\s+/g, "-")

    return `/audio/lesson-1/flashcard-${safeCorrect}${type}.mp3`
  }

  const playAudio = (src: string) => {
    audio?.pause()

    const nextAudio = new Audio(src)

    nextAudio.play()

    setAudio(nextAudio)
  }

  const handleSelect = (option: string) => {
    if (completed) return

    setSelectedOption(option)

    // wrong answer
    if (option !== card.correct) {
      return
    }

    // correct answer
    setCompleted(true)

    // play filled sentence audio
    playAudio(getAudioPath(2))
  }
  const options = useMemo(() => {
    return shuffle([
      card.correct,
      card.wrong1,
      card.wrong2,
    ])
  }, [card])

  return (
    <div className="lg:min-h-[60vh] min-h-[60vh] flex flex-col justify-start rounded-3xl lg:p-4 pb-20 shadow-xl">
        <button
          onClick={() => playAudio(getAudioPath(1))}
          className="w-fit rounded-full transition gap-4 lg:p-4 px-12 pt-12"
        >
          <Volume2 className="lg:h-[40] lg:w-[40] h-[100] w-[100]" />
          <div></div>
        </button>
      {/* Sentence */}
      <div className="flex items-center justify-center gap-4 lg:p-4 p-20">
        <h2 className="text-center lg:text-4xl text-7xl font-bold leading-relaxed">
          {card.sentence}
        </h2>
      </div>

      {/* Options */}
      <div className="w-fullspace-y-4 flex flex-col items-center lg:gap-4 gap-12">
        {options.map((option) => {
          const state =
            selectedOption === option
              ? option === card.correct
                ? "correct"
                : "wrong"
              : "default"

          return (
            <div
              key={option}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex-1">
                <OptionButton
                  option={option}
                  onClick={() => handleSelect(option)}
                  state={state}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}