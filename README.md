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

Expo Go is for development and depends on a running Metro server. To log from your phone away from the Mac, deploy the `backend` folder to Vercel from GitHub and create an installable iPhone build with EAS. See [Cloud Deployment](docs/cloud-deployment.md).

## Downloadable iPhone App

For a private iPhone install that does not require Expo Go or your Mac running Metro, use an EAS internal iOS build:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile preview
```

When the build finishes, Expo gives you a private install link. Open that link on your iPhone and install Vital Lens directly.

Requirements and behavior:

- An Apple Developer Program account is required for real iPhone installation.
- The AI backend stays on Vercel, so the app can work away from your Mac.
- Backend-only changes do not require a new iPhone build.
- App UI/code changes require a new EAS build.
- Set `EXPO_PUBLIC_AI_API_URL=https://weight-control-and-body-training.vercel.app` for the build, or keep the app's default backend URL.

## Implementation Notes

- V1 stores all logs locally on-device with AsyncStorage.
- AI calls are routed through Vercel serverless functions in `backend/api/`; the Expo app never stores `OPENAI_API_KEY`.
- Apple Calendar events require calendar permission.
- Google Calendar v1 opens a prefilled event URL instead of using full Google OAuth.
- Notification times use 24-hour `HH:MM` input. Defaults are `08:00` and `20:30`.

## WeChat Mini Program: How To Use And Deploy

The WeChat version is a separate Mini Program project in:

```text
wechat-miniprogram/
```

Think of the system as two pieces:

- `wechat-miniprogram/`: the WeChat frontend that users open inside WeChat.
- `backend/` on Vercel: the AI service that safely holds `OPENAI_API_KEY`.

The Mini Program stores personal logs locally with WeChat storage. It sends only AI requests to the Vercel backend.

### Use It Locally

1. Install WeChat Developer Tools.
2. Import this folder in WeChat Developer Tools:

```text
/Users/chenyixin/Documents/Weight Control and Body Training/wechat-miniprogram
```

3. For local simulator testing, keep the AppID as `touristappid`.
4. Open the Mini Program and use the top tabs:
   - `Home`: see recent logs and backend status.
   - `Activity`: parse text like `跑步 30 分鐘 3 miles easy` or analyze an exercise photo.
   - `Diet`: upload/take meal photos and save meal notes.
   - `Kitchen`: upload ingredients or type ingredients to get meal ideas.
   - `Body`: estimate an educational 體脂率 range from body context/photo.
   - `Sleep`: save sleep and wake timing.
   - `Settings`: switch English/繁體中文, edit backend URL, and run AI tests.

The default backend URL is:

```text
https://weight-control-and-body-training.vercel.app
```

### Deploy Or Share It

1. Register or open your WeChat Mini Program account and get the real Mini Program AppID.
2. Replace `touristappid` in `wechat-miniprogram/project.config.json` with that AppID.
3. In the WeChat Mini Program admin console, add this request legal domain:

```text
https://weight-control-and-body-training.vercel.app
```

4. In WeChat Developer Tools, click `Preview` and scan the QR code with WeChat for your own phone test.
5. To share with friends before public release, add them as project members/testers in the WeChat admin console, then upload a trial version from WeChat Developer Tools.
6. For public access, submit the uploaded version for WeChat review and publish after approval.

Important: people do not download a WeChat Mini Program like an iOS app. They open it through WeChat search, QR code, shared card, preview QR, or trial version.

See [WeChat Mini Program Setup](docs/wechat-miniprogram.md) for the longer checklist.

## OpenAI Backend

Deploy this repo to Vercel with the project root directory set to `backend`, then set these environment variables:

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-5.4-mini
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
