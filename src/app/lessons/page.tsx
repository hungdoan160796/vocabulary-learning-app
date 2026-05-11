import LessonCarousel from "../../../components/LessonCarousel"
import { lessons } from "../../../lib/lessons"

export default function LessonsPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lessons</h1>
      </div>

      <LessonCarousel lessons={lessons} />
    </main>
  )
}