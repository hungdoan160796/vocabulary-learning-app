// generate-homework.ts
//
// Usage:
//   npm install openai dotenv
//   npx ts-node generate-homework.ts
//
// Required files:
//   - homework.json
//   - flashcards.json
//
// Environment:
//   OPENAI_API_KEY=your_key
//
// What this script does:
// 1. Reads homework types from homework.json
// 2. Reads flashcards from flashcards.json
// 3. Sends flashcard correct answers to OpenAI
// 4. Groups vocabulary into suitable homework types
// 5. Saves grouping output to grouped-homework.json
// 6. Generates actual homework content for each group
// 7. Saves generated homework to generated-homework.json

import fs from "fs/promises";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const rl = readline.createInterface({ input, output });

let learnerName = "";
let lessonFileName = "";
let lessonBaseName = "";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type HomeworkTypes = Record<string, string>;

type Flashcard = {
  sentence: string;
  correct: string;
  wrong1: string;
  wrong2: string;
};

type HomeworkGroup = {
  words: string[];
  homeworkType: string;
  reason: string;
  homeworkSummary: string;
};

type GeneratedHomework = {
  words: string[];
  homeworkType: string;
  homeworkSummary: string;
  content: any;
};

async function loadHomeworkTypes(): Promise<HomeworkTypes> {
  const raw = await fs.readFile("./homework.json", "utf-8");
  return JSON.parse(raw);
}

async function loadFlashcards(): Promise<Flashcard[]> {
  learnerName = await rl.question("Enter learner name: ");

  lessonFileName = await rl.question(
    "Enter lesson file (example: lesson2.json): "
  );

  lessonBaseName = lessonFileName.replace(".json", "");

  const flashcardPath = path.join(
    "content",
    learnerName,
    lessonFileName
  );

  console.log(`Loading flashcards from: ${flashcardPath}`);

  const raw = await fs.readFile(flashcardPath, "utf-8");

  return JSON.parse(raw);
}
async function groupWordsIntoHomework(
  homeworkTypes: HomeworkTypes,
  flashcards: Flashcard[]
): Promise<HomeworkGroup[]> {
  const words = flashcards.map((f) => f.correct);

const prompt = `
You are an expert ESL curriculum planner.

You are given:
1. A list of homework types
2. A vocabulary list

Your task is to strategically group vocabulary words into small, meaningful learning sets.

IMPORTANT RULES:
- Each group MUST contain AT MOST 7 words.
- Do NOT group words only because they share one surface feature.
- Avoid weak groupings like:
  - all "good" words together
  - all greetings together if they become repetitive
  - random leftovers grouped without learning value
- Every group should feel educationally coherent.
- Group by:
  - communicative purpose
  - real-life usage
  - learner confusion risk
  - grammar pattern
  - conversation context
  - semantic relationship
  - functional language use
- Balance the groups carefully.
- If some words do not fit together naturally, create smaller focused groups.
- Do NOT force all words into equal-sized groups.
- Prioritize high-quality homework opportunities over simple categorization.

For each group:
- Choose the BEST matching homework type
- Explain WHY this homework type is effective
- Summarize the homework activity

Return ONLY valid JSON array.

Homework types:
${JSON.stringify(homeworkTypes, null, 2)}

Vocabulary:
${JSON.stringify(words, null, 2)}

Required JSON format:
[
  {
    "words": ["word1", "word2"],
    "homeworkType": "hw-type-1",
    "homeworkTypeDescription": "description of hw-type-1",
    "reason": "why this homework type fits these words",
    "homeworkSummary": "summary of the learner activity"
  }
]
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content:
          "You are a structured JSON generator for ESL education workflows.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = response.choices[0].message.content || "[]";

  return JSON.parse(text);
}

async function generateHomeworkContent(
  groups: HomeworkGroup[]
): Promise<GeneratedHomework[]> {
  const results: GeneratedHomework[] = [];

  for (const group of groups) {
    const prompt = `
You are an ESL homework creator.

Create actual learner homework based on:

Homework Type:
${group.homeworkType}

Homework Summary:
${group.homeworkSummary}

Vocabulary:
${JSON.stringify(group.words)}

Requirements:
- Create engaging ESL learner homework
- Appropriate for young learners
- Include clear instructions
- Include exercises/questions
- Output valid JSON only
- activity.content MUST always be a markdown string
- DO NOT return nested JSON objects inside activity.content
- Format tables, questions, and exercises as markdown text

Required JSON format:
{
  "title": "Homework title",
  "instructions": "Student instructions",
  "activities": [
    {
      "type": "activity type",
      "content": "activity content"
    }
  ]
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are a structured ESL homework JSON generator.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.choices[0].message.content || "{}";

    results.push({
      words: group.words,
      homeworkType: group.homeworkType,
      homeworkSummary: group.homeworkSummary,
      content: JSON.parse(text),
    });
  }

  return results;
}

async function main() {
  console.log("Loading files...");

  const homeworkTypes = await loadHomeworkTypes();
  const flashcards = await loadFlashcards();

  console.log("Grouping vocabulary into homework...");

  const groups = await groupWordsIntoHomework(
    homeworkTypes,
    flashcards
  );

  // Create homework folder if missing
  const homeworkDir = path.join(
    "homework",
    learnerName
  );

  await fs.mkdir(homeworkDir, { recursive: true });

  // Save brainstorm JSON
  const brainstormPath = path.join(
    homeworkDir,
    `${lessonBaseName}-brainstorm.json`
  );

  await fs.writeFile(
    brainstormPath,
    JSON.stringify(groups, null, 2)
  );

  console.log(`Brainstorm saved to: ${brainstormPath}`);

  // Ask user whether to continue
  const answer = await rl.question(
    "Generate actual homework now? (y/n): "
  );

  if (answer.toLowerCase() !== "y") {
    console.log("Aborted.");

    rl.close();
    return;
  }

  console.log("Reading brainstorm file...");

    const brainstormRaw = await fs.readFile(
    brainstormPath,
    "utf-8"
    );

    const brainstormGroups: HomeworkGroup[] =
    JSON.parse(brainstormRaw);

    console.log("Generating homework content...");

    const generatedHomework =
    await generateHomeworkContent(brainstormGroups);

  // Convert homework to markdown
  let markdown = `# Homework - ${lessonBaseName}\n\n`;

  for (const hw of generatedHomework) {
    markdown += `---\n\n`;

    markdown += `## ${hw.content.title}\n\n`;

    markdown += `### Homework Type\n`;
    markdown += `${hw.homeworkType}\n\n`;

    markdown += `### Vocabulary\n`;
    markdown += `${hw.words.join(", ")}\n\n`;

    markdown += `### Instructions\n`;
    markdown += `${hw.content.instructions}\n\n`;

    markdown += `### Activities\n\n`;

    for (const activity of hw.content.activities) {
        markdown += `#### ${activity.type}\n\n`;

        // If content is a string
        if (typeof activity.content === "string") {
            markdown += `${activity.content}\n\n`;
        }

        // If content is an object or array
        else {
            markdown += "```json\n";
            markdown += JSON.stringify(
            activity.content,
            null,
            2
            );
            markdown += "\n```\n\n";
        }
        }
  }

  // Save markdown homework
  const homeworkPath = path.join(
    homeworkDir,
    `${lessonBaseName}.md`
  );

  await fs.writeFile(homeworkPath, markdown);

  console.log(`Homework saved to: ${homeworkPath}`);

  rl.close();
}

main().catch((err) => {
  console.error(err);
  rl.close();
});

main().catch((err) => {
  console.error(err);
});