# Vital Lens

Vital Lens is an Expo iPhone app for camera-first exercise, meals, sleep, kitchen-based meal suggestions, daily reminders, calendar events, and educational 體脂率/body-fat range tracking.

## Core Experience

- Exercise logging: photo upload or camera capture can draft cardio and anaerobic workout logs, with manual correction for duration and intensity.
- Diet logging: meal photos create editable estimates for foods, calories, protein, carbs, fat, and confidence.
- Sleep timing: bedtime, wake time, and subjective sleep quality are tracked as recovery context.
- Kitchen scanner: ingredient photos or typed ingredient lists generate meal ideas that match training load and nutrition gaps.
- Body estimate: progress photo plus height, weight, age, and sex creates an educational 體脂率 range, not a medical measurement.
- Notifications: morning planning and nightly review reminders can be scheduled locally on the iPhone.
- Calendar: workout, meal prep, and sleep target events can be added to Apple Calendar, with Google Calendar opened through a prefilled event link.
- Daily review: the coach combines training, meal, and sleep signals into practical next actions.

## AI Recognition Plan

The prototype uses local simulated AI results. A production version should use:

- Vision model for exercise scene classification, food identification, portion estimation, and ingredient detection.
- Structured output schema for every recognition result so the app can show confidence, uncertainty, and editable fields.
- User correction loop so edits improve future suggestions.
- Safety guardrails for nutrition advice: suggestions should be framed as general wellness support, not medical treatment.

## Suggested Data Model

- `WorkoutLog`: type, activity, duration, intensity, estimated calories, source photo, confidence, user edits.
- `MealLog`: foods, portions, macro estimates, calories, source photo, confidence, user edits.
- `SleepLog`: sleep time, wake time, duration, quality, notes.
- `IngredientScan`: detected ingredients, expiration hints, generated recipes, nutrition fit.
- `CoachInsight`: generated recommendation, evidence, priority, dismissed or accepted state.

## Run On iPhone With Expo Go

1. Install dependencies:

```bash
npm install
```

2. Start Expo:

```bash
npm run start
```

If same-Wi-Fi loading fails, start with tunnel mode:

```bash
npm run start:tunnel
```

3. Install Expo Go on your iPhone.

4. Scan the QR code with the iPhone Camera app. If local Wi-Fi connection fails, press `s` in the Expo terminal to switch modes, or use Expo's tunnel option from the terminal UI.

Note: this project targets Expo SDK 54 for compatibility with the current iOS App Store version of Expo Go.

Expo Go is for development and depends on a running Metro server. To log from your phone away from the Mac, deploy the backend to Vercel from GitHub and create an installable iPhone build with EAS. See [Cloud Deployment](docs/cloud-deployment.md).

## Implementation Notes

- V1 stores all logs locally on-device with AsyncStorage.
- AI calls are routed through Vercel serverless functions in `api/`; the Expo app never stores `OPENAI_API_KEY`.
- Apple Calendar events require calendar permission.
- Google Calendar v1 opens a prefilled event URL instead of using full Google OAuth.
- Notification times use 24-hour `HH:MM` input. Defaults are `08:00` and `20:30`.

## OpenAI Backend

Deploy this repo to Vercel and set these environment variables:

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o
```

The app calls:

- `GET /api/health` to verify the deployed backend is alive and has `OPENAI_API_KEY`.
- `POST /api/parse-activity` for multilingual free-text activity parsing.
- `POST /api/analyze-photo` for exercise, meal, ingredient, and educational body estimate photo analysis.

In the app, open `Settings` and set `AI API URL` to your Vercel project URL, for example:

```text
https://your-project.vercel.app
```

## Static Web Prototype

The earlier static prototype is still present as `index.html`, `styles.css`, and `app.js`. You can serve it separately with:

```bash
python3 -m http.server 8765
```

Then visit `http://localhost:8765`.
