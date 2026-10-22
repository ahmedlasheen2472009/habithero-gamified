# HabitHero ⚔️

A gamified habit tracker I built to make building habits actually fun. Instead of boring checkboxes, you level up, fight bosses, collect achievements, and watch your dragon companion grow — all tied to how consistent you are.

## Why I made this

I tried a bunch of habit apps and they all felt the same — plain lists, maybe a streak counter. I wanted something that felt more like a game. So I built my own.

## Features

- **XP & Leveling** — earn XP every time you complete a habit, level up through 50 ranks
- **Streaks** — individual habit streaks + a global Hero Streak for perfect days
- **Boss Battles** — a weekly monster you chip away at by completing habits
- **Combo Multiplier** — complete habits back-to-back for bonus XP
- **Virtual Pet (Aero)** — a dragon that evolves from egg → hatchling → adult based on your streak
- **Achievements** — 20 badges across 4 rarity tiers
- **Daily Challenge** — a random bonus quest each day
- **Prestige System** — reset at Level 50 for a permanent XP bonus
- **Analytics** — heatmap, bar chart, donut chart, all built with Canvas API
- **Dark / Light theme**, sound effects, confetti, undo action, JSON export/import

## Tech

Pure HTML, CSS, and JavaScript — no frameworks, no libraries, no build tools. Just open `index.html` in a browser and it works.

- Web Audio API for synthesized sounds
- Canvas API for all charts and particle effects
- LocalStorage for data persistence

## Structure

```
habithero-gamified/
├── index.html      # markup
├── app.js          # all logic
└── css/
    └── style.css   # all styles
```

## Live demo

👉 [ahmedlasheen2472009.github.io/habithero-gamified](https://ahmedlasheen2472009.github.io/habithero-gamified/)
