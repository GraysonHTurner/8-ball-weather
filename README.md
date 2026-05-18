# 8-Ball Weather 🎱☁️

A playful web application where you can ask natural-language weather questions and receive a Magic 8-Ball-style response intelligently based on real weather conditions.

## Features

- **Natural Language Parsing**: Ask questions like "Will it rain tomorrow?" or "Should I wear shorts today?"
- **Real Weather Data**: Powered by Open-Meteo, which provides fast and reliable weather forecasting without the need for an API key.
- **Magic 8-Ball Logic**: Maps weather conditions (rain chance, temperature, wind) to one of 20 classic Magic 8-Ball responses.
- **Geolocation**: Can automatically fetch weather based on your current location.
- **Smooth Animations**: High-quality CSS and Framer Motion animations for a polished, whimsical experience.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Library**: React, Framer Motion
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repo-url>
   cd 8-ball-weather
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Variables (Optional):
   The app uses Open-Meteo API by default which doesn't require an API key.
   However, you can copy `.env.example` to `.env.local` to define any custom fallbacks if needed.
   ```bash
   cp .env.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The easiest way to deploy this Next.js app is using the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Deploy! No special configuration is needed since we use standard Next.js features and an API that requires no secret keys.

## Architecture & Scoring Logic

1. **Frontend**: The `WeatherForm` accepts a question and requests coordinates via the browser's Geolocation API.
2. **Backend**: The `/api/weather` route receives the request.
3. **Intent Parsing**: `src/lib/intent.ts` uses lightweight keyword matching to figure out the timeframe (today/tomorrow/weekend) and intent (rain, temperature, beach, event, general).
4. **Weather Fetching**: `src/lib/weather.ts` calls Open-Meteo.
5. **Scoring Engine**: Evaluates max temperature, wind speed, and precipitation probability against the intent. It generates a score from `-1.0` to `1.0`.
6. **Response Mapping**: The score selects a positive, negative, or ambiguous response from `src/lib/8ball.ts`.

---

Created with Next.js and Tailwind CSS.
