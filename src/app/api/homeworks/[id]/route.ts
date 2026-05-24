// app/api/lessons/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const homeworkId = (await params).id

    // example:
    // /api/homeworks/homework1?learnerId=ahoai
    const learnerId = request.nextUrl.searchParams.get("learnerId")

    if (!learnerId) {
      return NextResponse.json(
        { error: "learnerId is required" },
        { status: 400 }
      )
    }

    const filePath = path.join(
      process.cwd(),
      "homework",
      learnerId,
      `${homeworkId}.md`
    )

    await fs.access(filePath)
    const fileContents = await fs.readFile(filePath, "utf-8")

    return NextResponse.json({
      id: homeworkId,
      title: homeworkId,
      homework: fileContents,
    })
  } catch (error) {
    console.error("Homework API Error:", error)

    return NextResponse.json(
      { error: "Homework not found" },
      { status: 404 }
    )
  }
}