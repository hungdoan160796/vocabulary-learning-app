import { LessonCardData } from "../types/lesson"

export function parseMarkdownLesson(raw: string): LessonCardData[] {
  const lines = raw
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))

  const dataLines = lines.slice(2)

  return dataLines.map((line) => {
    const parts = line
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)

    return {
      sentence: parts[0],
      correct: parts[1],
      wrong1: parts[2],
      wrong2: parts[3],
    }
  })
}