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
  "E:\\teaching-project-1\\data\\ahoai\\improved"

const OUTPUT_CONTENT_DIR =
  "E:\\vocabulary-learning-app\\content\\ahoai"

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
You are extracting vocabulary for English learners.

TASK:
Generate a JSON array of useful vocabulary words from the lesson.

RULES:
- Include only meaningful vocabulary
- Pick about 10-20 words/phrases
- Prefer:
  nouns, verbs, adjectives, phrases
- Avoid:
  function words, grammar words, filler words, names of people/places/brands
- Prioritize words that are important for understanding the lesson content
- The array must not contain duplicates
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
  const cleanText = cleanMarkdown(markdown)

  // Split by sentence-ending punctuation
  const sentences =
    cleanText.match(/[^.!?]+[.!?]+/g) || []

  const results = []

  for (const vocab of vocabularyList) {
    const regex = new RegExp(
      `\\b${escapeRegex(vocab)}\\b`,
      "i"
    )

    const matchedSentence = sentences.find(
      (sentence) => regex.test(sentence)
    )

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
Convert each object into this format:

{
  "sentence": "First, I ___ my emails.",
  "correct": "check",
  "wrong1": "attend",
  "wrong2": "finalize"
}

RULES:
- Replace ONLY the correct word with ___
- wrong answers must not be synonyms of the correct word, or acceptably close in meaning
- If original sentence is too long, simplify the sentence but keep the same meaning and the target word
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

  // Optional debug output
  const vocabDebugPath = path.join(
    OUTPUT_CONTENT_DIR,
    `lesson${lessonNumber}-vocabularyList.json`
  )

  await fs.writeFile(
    vocabDebugPath,
    JSON.stringify(
      vocabularyList,
      null,
      2
    )
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

  // Optional debug output
  const sentenceDebugPath = path.join(
    OUTPUT_CONTENT_DIR,
    `lesson${lessonNumber}-sentences.json`
  )

  await fs.writeFile(
    sentenceDebugPath,
    JSON.stringify(
      sentenceObjects,
      null,
      2
    )
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
    OUTPUT_CONTENT_DIR,
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