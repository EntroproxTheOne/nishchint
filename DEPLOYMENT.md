# Nischint - AI-Powered Financial Personality Assessment

A React-based financial personality assessment tool powered by Google's Gemini AI.

## Setup Instructions

### 1. Environment Variables
In your Vercel dashboard, add the following environment variable:
- `GEMINI_API_KEY`: Your Google Gemini API key

### 2. Deployment
The application is configured for Vercel deployment with:
- Client-side React app
- Server-side API routes for Gemini AI integration
- Proper CORS handling

### 3. API Routes
- `/api/generate-questions`: Generates dynamic questions based on user responses
- `/api/summarize-profile`: Creates personalized financial personality summaries

## Local Development
```bash
npm install
npm run dev
```

## Deployment
```bash
npm run build
```

The app will be available at your Vercel domain.
