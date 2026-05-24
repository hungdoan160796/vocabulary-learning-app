export interface LessonCardData {
  type?: string
  sentence: string
  correct: string
  wrong1: string
  wrong2: string
  translation?: string
  data?: any
}

export interface FlipCardData {
  type?: string
  sentence: string
  correct: string
  translation?: string
  data?: any
}

export interface Lesson {
  id: string
  title: string
  cards: LessonCardData[]
}


export interface Homeworks {
  id: string,
  title: string,
  homework?: string
}