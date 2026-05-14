import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  try {
    const { learnerId } = await req.json()

    const filePath = path.join(process.cwd(), "content", "user.json")

    const file = await fs.readFile(filePath, "utf-8")

    const users = JSON.parse(file)

    const exists = users.some(
      (user: { id: string }) => user.id === learnerId
    )

    return NextResponse.json({ exists })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { exists: false, error: "Server error" },
      { status: 500 }
    )
  }
}