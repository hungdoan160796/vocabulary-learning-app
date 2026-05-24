// convert-homework.mjs

import fs from "fs/promises";

const inputFile = "homework.md";
const outputFile = "homework.json";

const content = await fs.readFile(inputFile, "utf8");

const lines = content
  .split("\n")
  .map(line => line.trim())
  .filter(line => line.length > 0)
  .map(line => line.replace(/^[-*]\s*/, ""));

const result = {};

lines.forEach((line, index) => {
  result[`hw-type-${index + 1}`] = line;
});

await fs.writeFile(outputFile, JSON.stringify(result, null, 2));

console.log(`Converted ${lines.length} homework types to ${outputFile}`);