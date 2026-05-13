// generate-vocab.mjs

import fs from "fs/promises"
import path from "path"
import OpenAI from "openai"
import "dotenv/config"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// =========================
// CONFIG
// =========================

const INPUT_DIR =
  "D:\\teaching-project-1\\data\\ahoai\\improved"

const OUTPUT_CONTENT_DIR =
  "D:\\vocabulary-learning-app\\content\\ahoai"


// =========================
// GET INPUT FILE
// =========================

const inputFile = process.argv[2]

if (!inputFile) {
  console.error(
    "Usage: node generate-vocab.mjs lesson-1.md"
  )
  process.exit(1)
}

const inputPath = path.join(INPUT_DIR, inputFile)

// =========================
// HELPERS
// =========================

function extractLessonNumber(filename) {
  const match = filename.match(/lesson-(\d+)/i)

  if (!match) {
    throw new Error(
      "Filename must look like lesson-1.md"
    )
  }

  return match[1]
}

function buildLessonVariableName(lessonNumber) {
  return `lesson${lessonNumber}`
}

function buildOutputFileName(lessonNumber) {
  return `lesson${lessonNumber}.ts`
}

function buildImportLine(lessonNumber) {
  return `import lesson${lessonNumber} from "../content/lesson${lessonNumber}"`
}

function buildLessonObject(lessonNumber) {
  return `{
    id: "lesson${lessonNumber}",
    title: "Lesson ${lessonNumber}",
    content: lesson${lessonNumber},
  }`
}

// =========================
// MAIN
// =========================

async function main() {
  // Read markdown lesson
  const markdown = await fs.readFile(inputPath, "utf-8")

  const lessonNumber = extractLessonNumber(inputFile)

  const lessonVariable =
    buildLessonVariableName(lessonNumber)

  const outputFileName =
    buildOutputFileName(lessonNumber)

  const outputPath = path.join(
    OUTPUT_CONTENT_DIR,
    outputFileName
  )

  // =========================
  // OPENAI GENERATION
  // =========================

  const prompt = `
You are creating vocabulary revision flashcards for language learners.

IMPORTANT:
- Focus on meaningful vocabulary only
- Prefer content words:
  nouns, verbs, adjectives, domain vocabulary
- Avoid functional words:
  always, often, very, really, etc.

Create a JSON file with 15 flashcards based on the following lesson content. Each flashcard should have a sentence with a ___ blank, one correct option that fits naturally, and two wrong options that are believable but incorrect.

Example output format:
[
  {
    "sentence": "First, I ___ my emails to check for new messages.",
    "correct": "check",
    "wrong1": "attend",
    "wrong2": "finalize"
  },
  {
    "sentence": "Then, I ___ meetings with my team to discuss tasks.",
    "correct": "attend",
    "wrong1": "write",
    "wrong2": "drink"
  }
]

Rules:
- Sentence must contain ___ blank
- Correct option must fit naturally
- Wrong options should be believable
- Generate 15 flashcards
- Vocabulary must be extracted from the lesson content
- Keep vocabulary useful for revision after studying lesson content

Lesson content:

${markdown}
`

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You create vocabulary learning flashcards.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  const generatedTable =
    response.choices[0].message.content?.trim()

  if (!generatedTable) {
    throw new Error("No flashcards generated")
  }
  // =========================
  // WRITE lessonX.json
  // =========================

  // generatedTable is already JSON from the AI
  const parsed = JSON.parse(generatedTable)

  // pretty-print json
  const jsonContent = JSON.stringify(parsed, null, 2)

  // replace .ts -> .json
  const jsonOutputPath = outputPath.replace(".ts", ".json")

  await fs.writeFile(jsonOutputPath, jsonContent)

  console.log(`Created: ${jsonOutputPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})