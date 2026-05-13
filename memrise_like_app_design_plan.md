# Design Plan – Memrise / Quizlet Style Learning App

## 1. Project Overview

A lightweight learning application inspired by Memrise and Quizlet.

The application focuses on:

- Fast access
- No authentication
- Swipe-based learning
- Markdown-driven content
- Mobile-first interaction
- Offline-friendly learner experience

The app is designed for learners only. There are no admin dashboards, user accounts, or backend authentication systems.

---

# 2. Core User Flow

## Step 1 — User Selection

When opening the app:

- User sees a simple fullscreen page.
- A dropdown allows the learner to select their User ID.
- Example IDs:
  - Student A
  - Student B
  - Student C

After selection:

- The selected ID is cached locally.
- The learner does not need to reselect during future visits on the same device/browser.
- The app immediately navigates to the lesson selection screen.

### Cache Behavior

Use browser local storage:

```ts
localStorage.setItem("learnerId", selectedId)
```

On app load:

```ts
const cached = localStorage.getItem("learnerId")
```

If cached value exists:

- Skip selection screen
- Navigate directly to lesson carousel page

### Reset User

Optional small button:

```text
Change User
```

This clears cache:

```ts
localStorage.removeItem("learnerId")
```

---

# 3. Lesson Selection Screen

## Layout

The learner sees:

- App title/header
- Horizontal lesson carousel
- Each carousel item represents one lesson

The uploaded `LessonCarousel.tsx` component can be used as the visual foundation.

## Carousel Requirements

Each lesson card should display:

- Lesson title
- Optional lesson icon/image
- Progress indicator (optional future feature)
- Number of cards

### Interaction

When learner taps a lesson:

```text
Navigate to:
/lesson/:lessonId
```

### Recommended UX

- Snap scrolling
- Mobile swipe gestures
- Large touch targets
- Smooth animations
- Lazy loading for large lesson sets

---

# 4. Lesson Card Experience

## Layout

The uploaded `LessonCard.tsx` component can be used as the base UI.

Each card contains:

- Sentence prompt
- Multiple choice answers
- Swipe navigation

Example:

| Sentence                                    | Correct option | Wrong option 1 | Wrong option 2 |
| ------------------------------------------- | -------------- | -------------- | -------------- |
| Before I analyze data, I need to \_\_\_ it. | sanitize       | sample         | save           |

Rendered as:

```text
Before I analyze data, I need to ___ it.

[ sanitize ]
[ sample ]
[ save ]
```

---

# 5. Answer Selection Logic

## Interaction Rules

### When learner selects wrong option

- Selected option becomes red
- Correct answer remains hidden until selected
- Prevent duplicate taps

### When learner selects correct option

- Selected option becomes green
- Card considered completed

### State Rules

Each card maintains temporary local state:

```ts
selectedOption
isCorrect
```

Example:

```ts
const [selectedOption, setSelectedOption] = useState<string | null>(null)
```

---

# 6. Swipe Navigation

## Navigation Requirements

Learners can:

- Swipe left → next card
- Swipe right → previous card

Supported on:

- Mobile touch gestures
- Desktop drag gestures

Recommended libraries:

```bash
framer-motion
```

or

```bash
swiper.js
```

---

# 7. Card Reset Behavior

## Important Requirement

When learner leaves a card:

- The card state resets completely
- Returning to the card shows fresh options
- Previous answers are NOT preserved

### Example

1. User selects wrong answer
2. Swipes next
3. Swipes back
4. Card appears untouched again

### Recommended Implementation

Do NOT persist answer state globally.

Instead:

- Each card component owns its own temporary state
- Component remount resets state automatically

Example:

```tsx
<Card key={currentCardIndex} />
```

Or:

```tsx
useEffect(() => {
  resetState()
}, [currentCardIndex])
```

---

# 8. Markdown Content System

## Goal

All lesson content is stored as markdown files.

This allows:

- Easy editing
- Version control
- Static hosting
- Non-technical content creation

---

# 9. Folder Structure

Recommended structure:

```text
/content
  /lesson-1
    lesson.md
  /lesson-2
    lesson.md
```

Alternative flat structure:

```text
/content
  greetings.md
  business.md
  grammar.md
```

---

# 10. Markdown Format

Use markdown tables.

Example:

```md
| Sentence | Correct option | Wrong option 1 | Wrong option 2 |
| -- | -- | -- | -- |
| Before I analyze data, I need to ___ it. | sanitize | sample | save |
```

---

# 11. Markdown Parsing

## Recommended Parser

Use:

```bash
remark
remark-gfm
```

or lightweight custom parser.

## Parsing Output Shape

Transform markdown into:

```ts
interface LessonCard {
  sentence: string
  correct: string
  wrong1: string
  wrong2: string
}
```

Then randomize answer order:

```ts
options = shuffle([
  correct,
  wrong1,
  wrong2,
])
```

---

# 12. Frontend Architecture

## Recommended Stack

### Framework

```text
Next.js
```

or

```text
Vite + React
```

### Styling

```text
Tailwind CSS
```

### Animation

```text
Framer Motion
```

### Gesture Handling

```text
Swiper.js
```

or

```text
react-swipeable
```

---

# 13. Suggested App Structure

```text
/src
  /components
    LessonCarousel.tsx
    LessonCard.tsx
    OptionButton.tsx
    SwipeContainer.tsx

  /pages
    Home.tsx
    LessonPage.tsx

  /hooks
    useLessons.ts
    useLocalUser.ts

  /lib
    markdownParser.ts
    shuffle.ts

/content
  lesson1.md
  lesson2.md
```

---

# 14. State Management

## Recommended Approach

Use local component state only.

Global state is unnecessary for current requirements.

Example:

```ts
useState
useEffect
```

Avoid:

- Redux
- MobX
- Complex persistence

---

# 15. Routing

## Suggested Routes

### Home

```text
/
```

Contains:

- User dropdown
- Auto redirect if cached

### Lesson Selection

```text
/lessons
```

Contains:

- Carousel list

### Lesson Page

```text
/lesson/:id
```

Contains:

- Swipeable cards

---

# 16. Performance Recommendations

## Keep App Lightweight

Recommended:

- Static markdown loading
- Client-side rendering
- Lazy load lessons
- Minimal dependencies

Avoid:

- Backend database
- Authentication providers
- Heavy analytics

---

# 17. Mobile UX Priorities

This app should prioritize mobile usage.

Important behaviors:

- Full-width cards
- Thumb-friendly buttons
- Swipe responsiveness
- Fast transitions
- Large readable text
- Minimal clutter

---

# 18. Recommended Development Phases

## Phase 1 — MVP

Build:

- User dropdown
- Cache selected user
- Lesson carousel
- Markdown parser
- Card interaction
- Swipe navigation
- Reset behavior

## Phase 2 — UX Polish

Add:

- Animations
- Loading states
- Card transitions
- Responsive layouts

## Phase 3 — Advanced Learning

Add:

- Progress tracking
- Spaced repetition
- Offline mode
- Audio

---

# 20. Final MVP Summary

The MVP should:

- Require no login
- Cache learner selection locally
- Display lesson carousel
- Load lessons from markdown files
- Present swipeable multiple-choice cards
- Color answers red/green
- Reset answers when navigating between cards
- Work smoothly on mobile devices

This architecture keeps the application:

- Simple
- Fast
- Maintainable
- Scalable for future learning features
- Easy to host as a static frontend application

