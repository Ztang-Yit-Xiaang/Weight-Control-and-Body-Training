# Cloud Deployment

This guide is for using Vital Lens away from the Mac. The AI backend should run in Vercel from GitHub, and the iPhone app should be installed through an EAS build or TestFlight when you want it to work without Metro running locally.

## 1. Push To GitHub

Create a GitHub repository, then from this folder run:

```bash
git add .
git commit -m "Build Vital Lens cloud AI backend"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

## 2. Deploy Backend From GitHub To Vercel

1. Open Vercel and choose `Add New Project`.
2. Import the GitHub repository.
3. Set the root directory to `backend`.
4. Add environment variables:

```text
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.4-mini
```

5. Deploy.
6. Open this URL to verify:

```text
https://YOUR_PROJECT.vercel.app/api/health
```

Expected response:

```json
{
  "ok": true,
  "service": "vital-lens-ai",
  "openaiConfigured": true,
  "model": "gpt-5.4-mini"
}
```

Vercel's GitHub integration automatically deploys branch pushes and pull requests after the repository is imported.

The Vercel root must be `backend` because the repository root is the Expo iPhone app. This keeps Vercel from trying to parse React Native files such as `src/App.js`.

## 3. Point The iPhone App At The Cloud Backend

For Expo Go testing, open the app and set:

```text
Settings -> AI API URL -> https://YOUR_PROJECT.vercel.app
```

For an installed app build, set `EXPO_PUBLIC_AI_API_URL` in the EAS build environment before building:

```text
EXPO_PUBLIC_AI_API_URL=https://YOUR_PROJECT.vercel.app
```

The app never stores `OPENAI_API_KEY`; only the Vercel backend uses it.

## 4. Installable iPhone App Away From Mac

Expo Go with `npx expo start` depends on your Mac running Metro. To use Vital Lens away from the Mac, make an installable iOS build with EAS.

Install EAS CLI:

```bash
npm install -g eas-cli
eas login
```

Configure the project once:

```bash
eas build:configure
```

Create an internal iOS build:

```bash
eas build --platform ios --profile preview
```

For TestFlight/App Store distribution, use:

```bash
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

iOS installable builds require an Apple Developer Program account.

## 5. Daily Workflow

1. Edit code locally.
2. Push to GitHub.
3. Vercel redeploys the backend automatically.
4. Create a new EAS build only when the app code changes.
5. If only backend prompts or API behavior change, no new iPhone app build is needed.
