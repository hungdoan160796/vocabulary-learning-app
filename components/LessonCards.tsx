"use client"

import {
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react"

import { Volume2 } from "lucide-react"
import {
  useParams,
  useSearchParams,
} from "next/navigation"

import { LessonCardData } from "../types/lesson"
import { shuffle } from "../lib/shuffle"

import OptionButton from "./OptionButton"

interface Props {
  card: LessonCardData
  soundEnabled: boolean
}

export default function LessonCard({
  card,
  soundEnabled,
}: Props) {
  const [selectedOption, setSelectedOption] =
    useState<string | null>(null)

  const [completed, setCompleted] =
    useState(false)

  // audio instance
  const audioRef =
    useRef<HTMLAudioElement | null>(null)

  // prevents stale closure issues
  const soundEnabledRef =
    useRef(soundEnabled)

  const params = useParams()
  const searchParams = useSearchParams()

  const learnerId =
    searchParams.get("learnerId")

  const lessonId = params.id
    ? params.id.toString().replace("lesson", "")
    : ""

  // keep ref synchronized
  useEffect(() => {
    soundEnabledRef.current = soundEnabled
  }, [soundEnabled])

  // reset card state on change
  useEffect(() => {
    setSelectedOption(null)
    setCompleted(false)
  }, [card])

  const getAudioPath = (type: 1 | 2) => {
    const safeCorrect = card.correct
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")

    return `/audio/${learnerId}/lesson-${lessonId}/flashcard-${safeCorrect}${type}.mp3`
  }

  const stopAudio = () => {
    if (!audioRef.current) return

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    audioRef.current = null
  }

  const playAudio = async (src: string) => {
    if (!soundEnabledRef.current) return

    stopAudio()

    const nextAudio = new Audio(src)

    audioRef.current = nextAudio

    try {
      await nextAudio.play()
    } catch (err) {
      console.error(
        "Audio playback failed:",
        err
      )
    }
  }

  // autoplay first audio
  useEffect(() => {
    if (!soundEnabled) {
      stopAudio()
      return
    }

    playAudio(getAudioPath(1))

    return () => {
      stopAudio()
    }
  }, [card, soundEnabled])

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  const handleSelect = async (
    option: string
  ) => {
    if (completed) return

    setSelectedOption(option)

    // wrong answer
    if (option !== card.correct) {
      return
    }

    // correct answer
    setCompleted(true)

    // play completed sentence audio
    await playAudio(getAudioPath(2))
  }

  // reshuffle only when card changes
  const options = useMemo(() => {
    return shuffle([
      card.correct,
      card.wrong1,
      card.wrong2,
    ])
  }, [card])

  return (
    <div className="lg:min-h-[60vh] min-h-[60vh] flex flex-col justify-start rounded-3xl lg:p-4 pb-20 shadow-xl">
      {/* Replay audio */}
      <button
        onClick={() =>
          playAudio(
            completed
              ? getAudioPath(2)
              : getAudioPath(1)
          )
        }
        className="w-fit rounded-full transition gap-4 lg:p-4 px-12 pt-12"
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
      <div className="w-full space-y-4 flex flex-col items-center lg:gap-4 gap-12">
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
                  onClick={() =>
                    handleSelect(option)
                  }
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