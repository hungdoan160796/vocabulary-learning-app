"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Volume2, VolumeX } from "lucide-react"
import HomeworkCard from "../../../../components/HomeworkCard"

export default function HomeworkPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const learnerId = searchParams.get("learnerId")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [homework, setHomework] = useState<string>("")
  useEffect(() => {
    const saved = localStorage.getItem("homework-sound-enabled")

    if (saved !== null) {
      setSoundEnabled(saved === "true")
    }
  }, [])
  const toggleSound = () => {
    const next = !soundEnabled

    setSoundEnabled(next)
    localStorage.setItem("homework-sound-enabled", String(next))
  }
  useEffect(() => {
    async function loadHomework() {
      try {

        const res = await fetch(
          `/api/homeworks/${params.id}?learnerId=${learnerId}`
        )

        const data = await res.json()
        if (!res.ok) {
          throw new Error("Failed")
        }
        console.log(data)
        setHomework(data.homework || "")
      } catch (err) {
        console.error("Failed to load homework", err)
      }
    }

    loadHomework()
  }, [params.id, searchParams])

  if (!homework) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full lg:min-w-100 flex flex-col justify-center items-center">
      <div className="w-full absolute top-0 left-0  flex items-center justify-center">
        <div className="lg:max-w-200 w-full h-[10vh] mb-4 p-4 rounded-xl shadow-lg border flex items-center justify-between">
          <button
            onClick={toggleSound}
            className="flex flex-row justify-center items-center rounded-xl gap-4"
          >
            Mute?
            {soundEnabled ? (
              <Volume2 className="lg:h-[2vw] lg:w-[2vw] h-4 w-4" />
            ) : (
              <VolumeX className="lg:h-[2vw] lg:w-[2vw] h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <div className="absolute top-[10vh] h-[76vh] w-full lg:max-w-200 flex flex-col justify-start scroll-auto">
        <HomeworkCard homework={homework} soundEnabled={soundEnabled}/>
      </div>
    </div>
  )
}