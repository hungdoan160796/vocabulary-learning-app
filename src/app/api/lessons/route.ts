// app/api/lessons/route.ts

import fs from "fs"
import path from "path"

import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const learnerId = searchParams.get("learnerId")

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

    if (!fs.existsSync(lessonsDir)) {
      return NextResponse.json(
        { error: "Learner folder not found" },
        { status: 404 }
      )
    }

    // get json files
    const files = fs
      .readdirSync(lessonsDir)
      .filter((file) => file.endsWith(".json"))

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

    return NextResponse.json(lessons)
  } catch (error) {
    console.error("Lesson API Error:", error)

    return NextResponse.json(
      { error: "Failed to load lessons" },
      { status: 500 }
    )
  }
}