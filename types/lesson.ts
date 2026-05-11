export interface LessonCardData {
  sentence: string
  correct: string
  wrong1: string
  wrong2: string
}

export interface Lesson {
  id: string
  title: string
  cards: LessonCardData[]
}