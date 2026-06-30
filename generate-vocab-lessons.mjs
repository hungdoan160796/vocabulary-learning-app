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

const INPUT_DIR = path.join(process.cwd())

const OUTPUT_CONTENT_DIR = path.join(process.cwd())

// =========================
// GET INPUT FILE
// =========================


const user = process.argv[2]
const inputFile = process.argv[3]

if (!inputFile || !user) {
  console.error(
    "Usage: node generate-vocab-lessons.mjs ahoai lesson-1.md"
  )
  process.exit(1)
}

const inputPath = path.join(INPUT_DIR, "lessons", user, inputFile)

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

function cleanMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`.*?`/g, "")
    .replace(/[#>*_-]/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// =========================
// FUNCTION 1
// .md -> vocab list using GPT
// =========================

async function generateVocabularyList(markdown) {
  const prompt = `
You are making vocabulary list for English learners.

TASK:
Generate a JSON array of useful vocabulary words from the lesson.

RULES:
- Each line of the markdown is one phrase to teach learner.
- Output ONLY valid JSON array
- No markdown

Example:
[
  "deadline",
  "schedule",
  "submit report"
]

Lesson:

${markdown}
`

  const response =
    await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You extract vocabulary lists.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    })
  logUsage("STEP 1 - Vocabulary List", response)
  const content =
    response.choices[0].message.content?.trim()

  if (!content) {
    throw new Error(
      "No vocabulary generated"
    )
  }

  return JSON.parse(content)
}

// =========================
// FUNCTION 2
// Locate vocab inside markdown
// Returns:
// [
//   {
//     word,
//     sentence
//   }
// ]
// =========================

function locateVocabularySentences(
  markdown,
  vocabularyList
) {
  // Keep sentence-ending punctuation for splitting — cleaning
  // everything first removed the punctuation and prevented
  // sentence extraction.
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "\n")

  // Try to split into sentences using punctuation. If that
  // yields nothing, fall back to splitting on newlines.
  let sentences = withoutCode.match(/[^.!?]+[.!?]+/g)

  if (!sentences || sentences.length === 0) {
    sentences = withoutCode.split(/\n+/).filter(Boolean)
  }

  const results = []

  for (const vocab of vocabularyList) {
    // Escape the vocab phrase and search case-insensitively
    const regex = new RegExp(escapeRegex(vocab), "i")

    const matchedSentence = sentences.find((sentence) => {
      // Clean just this sentence for matching (remove markdown, extra whitespace)
      const cleaned = sentence
        .replace(/[#>*_`\[\]]/g, " ")
        .replace(/\s+/g, " ")
        .trim()

      return regex.test(cleaned)
    })

    if (matchedSentence) {
      results.push({
        word: vocab,
        sentence: matchedSentence.trim(),
      })
    }
  }

  return results
}

// =========================
// FUNCTION 3
// sentence -> flashcard object
// =========================

async function generateFlashcards(
  sentenceObjects
) {
  const prompt = `
You are generating vocabulary revision flashcards.

TASK:
See each object as a sentence with a vocabulary or phrase.
Convert each object into this example format:

{
  "sentence": "A basic ___ has a subject and verb."
  "translation": "Một câu căn bản có chủ ngữ và động từ."
  "correct": "sentence",
  "wrong1": "comma",
  "wrong2": "question"
}

RULES:
- The sentence is written using simple language, as short as possible, and clearly signals the correct word/phrase to be filled in ___
- There must be ___ in the sentence, where the correct word/phrase should've been
- translation is the meaning of the completed sentence in vietnamese
- wrong answers must not be synonyms of the correct word/phrase, or acceptably close in meaning
- If the sentence does not have meaning of wrongly formatted, write a new sentence.
- Output ONLY valid JSON array
- No markdown

INPUT:

${JSON.stringify(
  sentenceObjects,
  null,
  2
)}
`

  const response =
    await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You create vocabulary flashcards.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    })
  logUsage("STEP 3 - Flashcards", response)
  const content =
    response.choices[0].message.content?.trim()

  if (!content) {
    throw new Error(
      "No flashcards generated"
    )
  }

  return JSON.parse(content)
}

// =========================
// MAIN
// =========================

async function main() {
  const markdown = await fs.readFile(
    inputPath,
    "utf-8"
  )

  const lessonNumber =
    extractLessonNumber(inputFile)

  // =========================
  // STEP 1
  // Generate vocabulary list
  // =========================

  console.log(
    "Generating vocabulary list..."
  )

  const vocabularyList =
    await generateVocabularyList(markdown)

  // Print step 1 results for debugging
  console.log("STEP 1 - Vocabulary List Result:\n", JSON.stringify(vocabularyList, null, 2))

  // Optional debug output
  const vocabDebugPath = path.join(
    OUTPUT_CONTENT_DIR, "content", user,
    `lesson${lessonNumber}-vocabularyList.json`
  )

  // =========================
  // STEP 2
  // Locate vocab sentences
  // =========================

  console.log(
    "Locating vocabulary in lesson..."
  )

  const sentenceObjects =
    locateVocabularySentences(
      markdown,
      vocabularyList
    )

  // Print step 2 results for debugging
  console.log("STEP 2 - Located Sentences:\n", JSON.stringify(sentenceObjects, null, 2))

  // Optional debug output
  const sentenceDebugPath = path.join(
    OUTPUT_CONTENT_DIR, "content", user,
    `lesson${lessonNumber}-sentences.json`
  )

  // =========================
  // STEP 3
  // Generate flashcards
  // =========================

  console.log(
    "Generating flashcards..."
  )

  const flashcards =
    await generateFlashcards(
      sentenceObjects
    )

  // =========================
  // WRITE OUTPUT
  // =========================
  
  const outputPath = path.join(
    OUTPUT_CONTENT_DIR, "content", user,
    `lesson${lessonNumber}.json`
  )

  await fs.writeFile(
    outputPath,
    JSON.stringify(
      flashcards,
      null,
      2
    )
  )

  console.log(
    `Created: ${outputPath}`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

function logUsage(stepName, response) {
  const usage = response.usage

  if (!usage) {
    console.log(`${stepName}: no usage data`)
    return
  }

  console.log(`
========== ${stepName} ==========
Prompt tokens: ${usage.prompt_tokens}
Completion tokens: ${usage.completion_tokens}
Total tokens: ${usage.total_tokens}
================================
`)
}