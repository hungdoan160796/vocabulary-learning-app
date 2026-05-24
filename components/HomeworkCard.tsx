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
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import SelectionTranslator from "./SelectionTranslator"

interface Props {
  homework: string
  soundEnabled: boolean
}

export default function HomeworkCard({
  homework,
  soundEnabled,
}: Props) {

  // audio instance
  const audioRef =
    useRef<HTMLAudioElement | null>(null)

  // prevents stale closure issues
  const soundEnabledRef =
    useRef(soundEnabled)

  const searchParams = useSearchParams()

  const learnerId =
    searchParams.get("learnerId")

  const getAudioPath = `/audio/${learnerId}/homework.mp3`

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

  return (
    <div className="lesson-markdown space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => playAudio(getAudioPath)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50"
          disabled={!soundEnabled}
        >
          <Volume2 size={20} />
          Play Audio
        </button>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        <SelectionTranslator />
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            button(props) {
              if (props.className === "toggle-button") {
                return (
                  <button
                    className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition sticky top-1 left-1"
                    onClick={() => {
                      document.querySelectorAll(".toggle").forEach((el) => {
                        el.classList.toggle("opacity-0");
                      });
                    }}
                  >
                    {props.children}
                  </button>
                );
              }
              return <button {...props} />;
            },
          }}
        >
          {homework}
        </ReactMarkdown>
      </div>
    </div>
  );
}