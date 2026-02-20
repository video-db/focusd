<p align="center">
  <img src="assets/icon.png" width="128" height="128" alt="Focusd icon" />
</p>

<h1 align="center">VideoDB Focusd</h1>

<p align="center">
  AI-powered desktop app that records your screen, understands what you're doing, and gives you actionable productivity insights — powered by <a href="https://videodb.io">VideoDB</a>.
</p>

<p align="center">
  <a href="https://drive.google.com/uc?export=download&id=1jVwIsWaV0XgbQ-wREyB7dijLUw_3hkME">Download for macOS</a>
</p>

---

## What it does

Focusd records your screen and system audio using VideoDB's real-time capture SDK. It uses vision models to understand what's on your screen every few seconds — which app you're in, what you're reading, what you're coding — and builds a layered summarization pipeline on top of that.

At any point during the day you can:

- See a **live activity timeline** showing what you've been doing and when
- Get **AI-generated session summaries** that tell you exactly what you worked on
- Drill down into any time range for a **detailed breakdown** with app usage, project time, and context
- View a **dashboard** with tracked time, productive time, top applications, and projects
- Generate an **end-of-day recap** with highlights and actionable improvement suggestions

## How summarization works

Raw screen captures flow through a 5-layer pipeline:

1. **Raw events** — VideoDB indexes your screen every few seconds, extracting app names, page titles, visible content
2. **Activity segments** — Events are grouped into time-based chunks
3. **Micro-summaries** — Each segment is summarized by an LLM (what you did, which app, productive or not)
4. **Session summaries** — Micro-summaries roll up into session overviews with app stats and project breakdown
5. **Daily summary** — Everything consolidates into a headline, highlights, and suggestions

All LLM prompts, pipeline timings, and indexing configs live in a single [`config.yaml`](config.yaml) file.

## Requirements
- A [VideoDB](https://videodb.io) API key

## Configuration

All prompts, timing intervals, and indexing parameters are in [`config.yaml`](config.yaml). Key settings:

- `pipeline.segment_flush_mins` — how often raw events are grouped into segments
- `pipeline.micro_summary_mins` — how often segments get summarized
- `pipeline.session_summary_mins` — how often session-level summaries are generated
- `pipeline.idle_threshold_mins` — inactivity threshold before pausing tracking

These can also be adjusted from the **Settings** page in the app.

## Local development

```bash
# Install dependencies
npm install

# Copy env template and add your VideoDB API key
cp .env.sample .env

# Run in dev mode
npm run dev

# Build macOS DMG
npm run package:mac
```

## Data & privacy

Screen captures are processed through VideoDB's API, and summaries are stored in a local SQLite database at `~/Library/Application Support/VideoDB Focusd/`. Your API key is encrypted using macOS Keychain via Electron's `safeStorage`.

To reset all data:

```
rm -rf ~/Library/Application\ Support/VideoDB\ Focusd/
```
