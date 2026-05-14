# English Vocabualry Trainer

Interactive language learning app for learning English vocabulary

## Live Demo

https://vocabulary-learning-app-silk.vercel.app/

Enter "ahoai" to get started.

## Features

- Structured lesson-based learning
- Audio playback support
- Vocabulary highlighting
- Responsive mobile-friendly UI
- Fast static deployment via Vercel

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Vercel Hosting

## Lesson Architecture

Lessons are stored as static JSON/content files inside the project.

Example:

/content
    /user
        /lesson1.json
        /lesson2.json
    /user.json

This keeps deployment simple and removes the need for a backend/database.

## Local Development

```bash
npm install
npm run dev
```

App runs at http://localhost:3000

## Motivation

- Memrise, Quizlets... require premium membership, no AI-integration/generation options available.
- Used for actual teaching.
- Built to experiment with language learning workflows and lightweight educational app architecture using static content delivery.

## Content Workflow

Flashcards are generated and refined using `generate-vocab-lessons.mjs` into reusable JSON lesson formats, then manually reviewed.

## Related Projects

This project generates flashcards from lessons at this project:
https://github.com/hungdoan160796/teaching-project-1