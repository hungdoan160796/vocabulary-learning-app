import lesson1 from "../content/lesson1"
import lesson2 from "../content/lesson2"

import { parseMarkdownLesson } from "./markdownParser"

export const lessons = [
  {
    id: "lesson1",
    title: "Data Vocabulary",
    cards: parseMarkdownLesson(lesson1),
  },
  {
    id: "lesson2",
    title: "Business Vocabulary",
    cards: parseMarkdownLesson(lesson2),
  },
]