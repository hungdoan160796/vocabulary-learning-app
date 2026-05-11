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
  "D:\\teaching-project-1\\data\\overall-improved"

const OUTPUT_CONTENT_DIR =
  "D:\\vocabulary-learning-app\\content"

const LESSONS_TS_PATH =
  "D:\\vocabulary-learning-app\\lib\\lessons.ts"

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

Create a markdown table with EXACTLY these columns:

| Sentence | Correct option | Wrong option 1 | Wrong option 2 |

Rules:
- Sentence must contain ___ blank
- Correct option must fit naturally
- Wrong options should be believable
- Generate 20 flashcards
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
  // WRITE lessonX.ts
  // =========================

  const lessonTsContent = `
const ${lessonVariable} = \`
${generatedTable}
\`

export default ${lessonVariable}
`.trim()

  await fs.writeFile(outputPath, lessonTsContent)

  console.log(`Created: ${outputPath}`)

  // =========================
  // UPDATE lessons.ts
  // =========================

  let lessonsTs = await fs.readFile(
    LESSONS_TS_PATH,
    "utf-8"
  )

  // Check import exists
  const importLine = buildImportLine(lessonNumber)

  if (!lessonsTs.includes(importLine)) {
    lessonsTs = `${importLine}\n${lessonsTs}`
  }

  // Check lesson object exists
  const lessonId = `id: "lesson${lessonNumber}"`

  if (!lessonsTs.includes(lessonId)) {
    // Try inserting into lessons array
    lessonsTs = lessonsTs.replace(
      /(\[\s*)([\s\S]*?)(\s*\])/m,
      (match, start, middle, end) => {
        return `${start}${middle.trim()}
  ${buildLessonObject(lessonNumber)},
${end}`
      }
    )

    console.log(
      `Added lesson${lessonNumber} to lessons.ts`
    )
  } else {
    console.log(
      `lesson${lessonNumber} already exists in lessons.ts`
    )
  }

  await fs.writeFile(LESSONS_TS_PATH, lessonsTs)

  console.log("Updated lessons.ts")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})