# Switching on AI Assist (free)

AI Assist needs at least one free key. Keys go into Vercel only. Never paste a key into
chat, into code, or into a file in this project.

Website screens change from time to time, so button names below are approximate.

## 1. Get a Groq key (main provider, free, no card)

1. Go to https://console.groq.com and sign up.
2. Open **API Keys** and create a key. Copy it once; it is shown only once.

## 2. Get a Gemini key (backup, free)

1. Go to https://aistudio.google.com and sign in with a Google account.
2. Choose **Get API key** and create one.

You can start with only one of the two. Having both means that if one runs out of free
quota for the day, the other answers automatically.

## 3. Add them in Vercel

1. Open the Vercel dashboard, then the `invytory` project, then **Settings**, then
   **Environment Variables**.
2. Add `GROQ_API_KEY` with the Groq key, for Production, Preview and Development.
3. Add `GEMINI_API_KEY` with the Gemini key, the same way (if you made one).
4. Do NOT put `VITE_` in front of these names. A `VITE_` name would be sent to every
   visitor's browser.
5. Go to **Deployments**, open the latest one's menu, and choose **Redeploy**. Settings
   only apply to new deployments.

## 4. Optional settings

These have working defaults. Add them only if a model is retired or you want another one.

- `GROQ_MODEL` (default `llama-3.3-70b-versatile`)
- `GEMINI_MODEL` (default `gemini-3.5-flash-lite`)

After changing a setting, redeploy again.

## 5. Check it works (on the live site only)

AI Assist cannot run on `npm run dev`, because the `/api` folder only exists on Vercel.

1. Open `/create`, fill in both names, and continue to **Your story**.
2. Click **AI Assist** under "Our story", add a detail or two, and press **Write it for us**.
3. If you see "AI Assist is not switched on yet", Vercel has no key yet (or you have not
   redeployed). If you see "busy", both free quotas are used up for now; it recovers
   by itself.

## Free limits

Both services publish their own free limits and can change them. Check them in your
Groq console (Settings, Limits) and Google AI Studio (rate limits page). If invitations
grow popular, AI Assist is the first thing to watch.

## Privacy

What a couple types into AI Assist, plus their names and ceremony dates, is sent to the AI
service to write the suggestion. The panel says so. Groq states it does not retain
inference data by default. Google's free tier says content may be used to improve its
products. Mention this in your privacy policy.
