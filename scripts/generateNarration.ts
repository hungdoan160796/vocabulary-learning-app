// scripts/generateNarrations.ts

import fs from "fs"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

const VOICES = [
  process.env.VOICE_ID_ALICE!,
  process.env.VOICE_ID_BELLE!,
  process.env.VOICE_ID_JACK!,
  process.env.VOICE_ID_ROGER!,
  process.env.VOICE_ID_LIAM!,
]

function getRandomVoiceId() {
  const randomIndex = Math.floor(
    Math.random() * VOICES.length
  )
  const voice = VOICES[randomIndex]
  console.log(voice)
  return voice
}

const API_KEY = process.env.ELEVENLABS_API_KEY!
const voiceId = getRandomVoiceId();

type Flashcard = {
  sentence: string
  correct: string
  wrong1: string
  wrong2: string
}

async function generateSpeech(
  text: string,
  outputPath: string
) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",

        // pause optimization
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
        }
      }),
    }
  )

  if (!response.ok) {
    throw new Error(
      `ElevenLabs failed: ${response.status}`
    )
  }

  const arrayBuffer = await response.arrayBuffer()

  fs.mkdirSync(path.dirname(outputPath), {
    recursive: true,
  })

  fs.writeFileSync(
    outputPath,
    Buffer.from(arrayBuffer)
  )
}

function buildPauseSentence(sentence: string) {
  // SSML-like natural pause
  return sentence.replace(
    "___",
    "... "
  )
}

function buildAnswerSentence(
  sentence: string,
  answer: string
) {
  return sentence.replace("___", answer)
}

async function run() {
  const inputFile = process.argv[2]

  if (!inputFile) {
    console.error(
      "Usage: npx tsx scripts/generateNarrations.ts lesson1.json"
    )
    process.exit(1)
  }

  const raw = fs.readFileSync(inputFile, "utf-8")

  const cards: Flashcard[] = JSON.parse(raw)

  // lesson1.json -> lesson-1
  const lessonName =
    path.basename(inputFile, ".json")
      .replace("lesson", "lesson-")

  const outputDir = path.join(
    process.cwd(),
    "public",
    "audio",
    lessonName
  )

  for (const card of cards) {
    const safeCorrect = card.correct
      .toLowerCase()
      .replace(/\s+/g, "-")

    // AUDIO A
    const pauseSentence =
      buildPauseSentence(card.sentence)

    const output1 = path.join(
      outputDir,
      `flashcard-${safeCorrect}1.mp3`
    )

    // AUDIO B
    const answerSentence =
      buildAnswerSentence(
        card.sentence,
        card.correct
      )

    const output2 = path.join(
      outputDir,
      `flashcard-${safeCorrect}2.mp3`
    )

    if (fs.existsSync(output1)) {
    console.log("Skipping:", output1)
    } else {
    console.log("Generating:", output1)
    await generateSpeech(
        pauseSentence,
        output1
    )
    }
    if (fs.existsSync(output2)) {
    console.log("Skipping:", output2)
    } else {
    console.log("Generating:", output2)
    await generateSpeech(
        answerSentence,
        output2
    )
    }
    console.log(
      `Done: ${card.correct}`
    )
  }

  console.log("All audio generated.")
}

run()