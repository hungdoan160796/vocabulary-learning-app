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

  const speak = async (text: string) => {
    window.speechSynthesis.cancel()

    // split sentence at ___
    const parts = text.split("___")

    const voices = window.speechSynthesis.getVoices()

    // pick a voice
    const selectedVoice =
      voices.find((voice) =>
        voice.name.includes("Microsoft Mark - English (United States)")
      ) || voices[0]

    const speakPart = (part: string) => {
      return new Promise<void>((resolve) => {
        if (!part.trim()) {
          resolve()
          return
        }

        const utterance = new SpeechSynthesisUtterance(part)
        utterance.voice = selectedVoice

        utterance.lang = "en-US"
        utterance.rate = 1
        utterance.pitch = 1

        utterance.onend = () => resolve()

        window.speechSynthesis.speak(utterance)
      })
    }

    for (let i = 0; i < parts.length; i++) {
      await speakPart(parts[i])

      // pause after ___
      if (i < parts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
  }

  const speakSentenceWithHiddenWord = (
    sentence: string,
    hiddenWord: string
  ) => {
    window.speechSynthesis.cancel()

    const parts = sentence.split("___")

    const before = parts[0] ?? ""
    const after = parts[1] ?? ""

    const voices = window.speechSynthesis.getVoices()

    const voice =
      voices.find((v) =>
        v.name.includes("Microsoft Mark - English (United States)")
      ) || voices[0]

    // before blank
    const beforeUtterance = new SpeechSynthesisUtterance(before)
    beforeUtterance.voice = voice
    beforeUtterance.lang = "en-US"

    // hidden answer (quiet)
    const hiddenUtterance = new SpeechSynthesisUtterance(hiddenWord)
    hiddenUtterance.voice = voice
    hiddenUtterance.lang = "en-US"
    hiddenUtterance.volume = 0.05

    // after blank
    const afterUtterance = new SpeechSynthesisUtterance(after)
    afterUtterance.voice = voice
    afterUtterance.lang = "en-US"

    // estimate word duration
    // ~180 words/minute average speech
    const estimatedMs =
      Math.max(hiddenWord.split(" ").length * 350, 500)

    beforeUtterance.onend = () => {
      // speak hidden word quietly
      window.speechSynthesis.speak(hiddenUtterance)

      // wait roughly same duration as word speech
      setTimeout(() => {
        window.speechSynthesis.speak(afterUtterance)
      }, estimatedMs)
    }

    window.speechSynthesis.speak(beforeUtterance)
  }

  const handleSelect = (option: string) => {
    if (completed) return

    setSelectedOption(option)

    if (option === card.correct) {
      setCompleted(true)

      // speak full correct sentence
      const fullSentence = card.sentence.replace(
        "___",
        card.correct
      )

      speak(fullSentence)
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
    <div className="lg:min-h-[60vh] min-h-[60vh] flex flex-col justify-start rounded-3xl bg-white lg:p-4 pb-20 shadow-xl">
        <button
          onClick={() => speakSentenceWithHiddenWord(card.sentence, card.correct)}
          className="w-fit rounded-full transition hover:bg-gray-100 gap-4 lg:p-4 px-12 pt-12"
        >
          <Volume2 className="lg:h-[40] lg:w-[40] h-[100] w-[100]" />
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