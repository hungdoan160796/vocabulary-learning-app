// scripts/generateNarrations.ts

import "dotenv/config"
import fs from "fs/promises"
import path from "path"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"

type Flashcard = {
  sentence: string
  correct: string
  wrong1: string
  wrong2: string
}

type VoicePreset = {
  voiceId: string
  speed: number
}

function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}`
    )
  }

  return value
}

const client = new ElevenLabsClient({
  apiKey: requireEnv(
    "ELEVENLABS_API_KEY"
  ),
})

const VOICE_PRESETS: VoicePreset[] = [
  {
    voiceId: requireEnv(
      "VOICE_ID_BELLE"
    ),
    speed: 0.9,
  },

  {
    voiceId: requireEnv(
      "VOICE_ID_ROGER"
    ),
    speed: 0.8,
  },

  {
    voiceId: requireEnv(
      "VOICE_ID_LIAM"
    ),
    speed: 0.8,
  },
]

function getRandomVoice() {
  const index = Math.floor(
    Math.random() *
      VOICE_PRESETS.length
  )

  return VOICE_PRESETS[index]
}

function buildPauseSentence(
  sentence: string
) {
  return sentence.replace(
    "___",
    "<break time=\"1.0s\" />"
  )
}

function buildAnswerSentence(
  sentence: string,
  answer: string
) {
  return sentence.replace(
    "___",
    answer
  )
}

function formatNarration(
  text: string
) {
  return text
    .replaceAll("*", "")
    .replaceAll('"', "")
    .replaceAll(
      "! ",
      "!<break time=\"1s\" /> "
    )
    .replaceAll(
      "? ",
      "?<break time=\"1s\" /> "
    )
    .replaceAll(
      ". ",
      ".<break time=\"1s\" /> "
    )
    .replaceAll(
      ", ",
      ",<break time=\"0.5s\" /> "
    )
}

function sanitizeFilename(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
}

async function fileExists(
  filePath: string
) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function getMp3Duration(
  buffer: Buffer
) {
  const mm = await import(
    "music-metadata"
  )

  const metadata =
    await mm.parseBuffer(buffer)

  return (
    metadata.format.duration ?? 0
  )
}

async function generateSpeech(
  voice: VoicePreset,
  text: string,
  outputPath: string
) {
  const stream =
    await client.textToSpeech.convert(
      voice.voiceId,
      {
        text,

        modelId:
          "eleven_multilingual_v2",

        outputFormat:
          "mp3_44100_128",

        voiceSettings: {
          speed: voice.speed,

          stability: 0.75,

          similarityBoost:
            0.75,

          style: 0.15,
        },
      }
    )

  const chunks: Buffer[] = []

  for await (const chunk of stream) {
    chunks.push(
      Buffer.from(chunk)
    )
  }

  const buffer =
    Buffer.concat(chunks)

  await fs.mkdir(
    path.dirname(outputPath),
    {
      recursive: true,
    }
  )

  await fs.writeFile(
    outputPath,
    buffer
  )

  const duration =
    await getMp3Duration(buffer)

  console.log(
    `✓ ${path.basename(
      outputPath
    )} (${duration.toFixed(2)}s)`
  )
}

async function run() {
  const username =
    process.argv[2]

  const file =
    process.argv[3]

  if (!username || !file) {
    console.error(
      "Usage: npx tsx scripts/generateNarrations.ts username lesson1.json"
    )

    process.exit(1)
  }

  const inputFile =
    path.join(
      process.cwd(),
      "content",
      username,
      file
    )

  const raw =
    await fs.readFile(
      inputFile,
      "utf8"
    )

  const cards: Flashcard[] =
    JSON.parse(raw)

  const lessonName =
    path
      .basename(
        inputFile,
        ".json"
      )
      .replace(
        "lesson",
        "lesson-"
      )

  const outputDir =
    path.join(
      process.cwd(),
      "public",
      "audio",
      username,
      lessonName
    )

  console.log(
    "MP3s will be written to:"
  )

  console.log(outputDir)

  for (const card of cards) {
    const voice =
      getRandomVoice()

    const safeCorrect =
      sanitizeFilename(
        card.correct
      )

    const pauseSentence =
      formatNarration(
        buildPauseSentence(
          card.sentence
        )
      )

    const answerSentence =
      formatNarration(
        buildAnswerSentence(
          card.sentence,
          card.correct
        )
      )

    const output1 =
      path.join(
        outputDir,
        `flashcard-${safeCorrect}1.mp3`
      )

    const output2 =
      path.join(
        outputDir,
        `flashcard-${safeCorrect}2.mp3`
      )

    if (
      await fileExists(output1)
    ) {
      console.log(
        "Skipping:",
        path.basename(
          output1
        )
      )
    } else {
      console.log(
        "Generating:",
        path.basename(
          output1
        )
      )

      await generateSpeech(
        voice,
        pauseSentence,
        output1
      )
    }

    if (
      await fileExists(output2)
    ) {
      console.log(
        "Skipping:",
        path.basename(
          output2
        )
      )
    } else {
      console.log(
        "Generating:",
        path.basename(
          output2
        )
      )

      await generateSpeech(
        voice,
        answerSentence,
        output2
      )
    }

    console.log(
      `Done: ${card.correct}`
    )

    console.log("")
  }

  console.log(
    "All audio generated."
  )
}

run().catch(error => {
  console.error(
    "\nGeneration failed:\n"
  )

  console.error(error)

  process.exit(1)
})