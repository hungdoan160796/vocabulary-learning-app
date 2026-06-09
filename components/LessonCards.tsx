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
import FlipCard from "./FlipCard"

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
  if (card.type == "chart")
  return (
    <div className="w-full lg:min-h-[60vh] min-h-[60vh] flex flex-col justify-start rounded-3xl lg:p-4 shadow-xl">
      {/* Replay audio */}
      <button
        onClick={() =>
          playAudio(
            completed
              ? getAudioPath(2)
              : getAudioPath(1)
          )
        }
        className="w-fit rounded-full transition gap-4 lg:p-4"
      >
        <Volume2 className="lg:h-[2vw] lg:w-[2vw] h-4 w-4 lg:m-0 m-4" />
      </button>

      {/* Chart */}
      <div className="w-full flex flex-col items-center justify-center lg:p-4 p-4 gap-4">
        <FlipCard card={card} />
      </div>
    </div>
  )
  else return (
    <div className="w-full h-[80vh] flex flex-col justify-start rounded-3xl lg:p-4 shadow-xl">
      {/* Replay audio */}
      <button
        onClick={() =>
          playAudio(
            completed
              ? getAudioPath(2)
              : getAudioPath(1)
          )
        }
        className="w-fit rounded-full transition gap-4 lg:p-4 h-[10vh]"
      >
        <Volume2 className="lg:h-[2vw] lg:w-[2vw] h-4 w-4 lg:m-0 m-4" />
      </button>

      {/* Sentence */}
      
      <div className="h-[30vh] w-full flex flex-col items-center justify-center lg:p-4 p-4 gap-4 overflow-auto">
        <h2 className="h-full text-wrap text-center lg:text-3xl text-xl font-bold leading-relaxed">
          {card.sentence}
        </h2>

        {card.translation ? (
          <p className="text-center lg:text-xl text-base text-slate-600">
            {card.translation}
          </p>
        ) : null}
      </div>

      {/* Options */}
      <div className="h-[50vh] w-full space-y-4 flex flex-col items-center">
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
              className="min-w-[50%] flex flex-col items-center"
            >
              <div className="w-full flex-1">
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