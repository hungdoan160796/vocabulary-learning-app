// app/api/lessons/route.ts

import fs from "fs"
import path from "path"

import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const learnerId = searchParams.get("learnerId")

    console.log("Loading lessons for learner:", learnerId)

    if (!learnerId) {
      return NextResponse.json(
        { error: "Missing learnerId" },
        { status: 400 }
      )
    }

    const lessonsDir = path.join(
      process.cwd(),
      "content",
      learnerId
    )

    console.log("Looking for lessons in:", lessonsDir)

    if (!fs.existsSync(lessonsDir)) {
      return NextResponse.json(
        { error: "Learner folder not found" },
        { status: 404 }
      )
    }

    console.log("Found lessons folder for learner:", learnerId)

    // get json files
    const files = fs
      .readdirSync(lessonsDir)
      .filter((file) => file.endsWith(".json"))

    console.log(
      `Found ${files.length} lesson(s) for learner ${learnerId}`
    )

    const lessons = files.map((file) => {
      const filePath = path.join(lessonsDir, file)

      const raw = fs.readFileSync(filePath, "utf8")

      const cards = JSON.parse(raw)

      return {
        id: file.replace(".json", ""),
        title: file.replace(".json", ""),
        cards,
      }
    })

    console.log("Parsed lessons:", lessons)

    return NextResponse.json(lessons)
  } catch (error) {
    console.error("Lesson API Error:", error)

    return NextResponse.json(
      { error: "Failed to load lessons" },
      { status: 500 }
    )
  }
}