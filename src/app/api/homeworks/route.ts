// app/api/homeworks/route.ts

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

    const homeworksDir = path.join(
      process.cwd(),
      "homework",
      learnerId
    )

    if (!fs.existsSync(homeworksDir)) {
      return NextResponse.json(
        { error: "Learner folder not found" },
        { status: 404 }
      )
    }

    const files = fs
      .readdirSync(homeworksDir)
      .filter((file) => file.endsWith(".md"))

    const homeworks = files.map((file) => {
      const filePath = path.join(homeworksDir, file)
      const raw = fs.readFileSync(filePath, "utf8")

      return {
        id: file.replace(".md", ""),
        title: file.replace(".md", ""),
        homework: raw,
      }
    })

    return NextResponse.json(homeworks)
  } catch (error) {
    console.error("Homework API Error:", error)

    return NextResponse.json(
      { error: "Failed to load homeworks" },
      { status: 500 }
    )
  }
}