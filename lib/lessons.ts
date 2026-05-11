// lib\lessons.ts
import lesson1 from "../content/lesson1"

import { parseMarkdownLesson } from "./markdownParser"

export const lessons = [
  {
    id: "lesson1",
    title: "Data Vocabulary",
    cards: parseMarkdownLesson(lesson1),
  }
]