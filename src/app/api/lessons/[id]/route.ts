// app/api/lessons/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const lessonId = (await params).id

    // example:
    // /api/lessons/lesson1?learnerId=ahoai
    const learnerId = request.nextUrl.searchParams.get("learnerId")

    if (!learnerId) {
      return NextResponse.json(
        { error: "learnerId is required" },
        { status: 400 }
      )
    }

    // D:\vocabulary-learning-app\content\ahoai\lesson1.json
    const filePath = path.join(
      process.cwd(),
      "content",
      learnerId,
      `${lessonId}.json`
    )
    await fs.access(filePath)
    const fileContents = await fs.readFile(filePath, "utf-8")
    console.log("Loaded lesson file:", filePath)

    const cards = JSON.parse(fileContents)
    console.log(cards)

    return NextResponse.json({
        id: lessonId,
        title: lessonId,
        cards,
    })
  } catch (error) {
    console.error("Lesson API Error:", error)

    return NextResponse.json(
      { error: "Lesson not found" },
      { status: 404 }
    )
  }
}