# Set Up Your API Keys

BMO needs two API keys to work — one for the AI brain (Claude) and one for the voice (Fish Audio).

**First, create your config file:**

**Mac:**
```
cp .env.example .env
```

**Windows:**
```
copy .env.example .env
```

> **Do not skip this step.** If you don't have a `.env` file, BMO will not start.

**Now open the `.env` file to edit it:**

**Mac:**
```
open -e .env
```

**Windows:**
```
notepad .env
```

You'll see three lines. You need to fill in the first two:

**Get your Claude API key:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click **Sign Up** and create a free account
3. Once logged in, click **API Keys** in the sidebar
4. Click **Create Key**
5. Give it any name (like "bmo")
6. Click **Create Key** and copy the key that appears (it starts with `sk-ant-`)
7. Go back to your `.env` file and paste it right after `ANTHROPIC_API_KEY=` with no spaces

**Get your Fish Audio API key:**
1. Go to [fish.audio](https://fish.audio)
2. Click **Sign Up** and create a free account
3. Once logged in, click your profile icon in the top right
4. Go to **API Keys**
5. Create a new key and copy it
6. Go back to your `.env` file and paste it right after `FISH_AUDIO_API_KEY=` with no spaces

**Leave `BMO_VOICE_ID` as it is** — that's the default voice. If you want a different voice, browse voices at [fish.audio](https://fish.audio), pick one you like, and replace the ID with the one from the URL.

**Save the file** (`Cmd + S` on Mac, `Ctrl + S` on Windows) and close it.

Your `.env` file should look like this:
```
ANTHROPIC_API_KEY=sk-ant-abc123your-actual-key-here
FISH_AUDIO_API_KEY=your-actual-fish-key-here
BMO_VOICE_ID=94b4570683534e37993fdffbd47d084b
```

> **Common mistakes:** Make sure there are no spaces before or after the `=` sign. Make sure you didn't accidentally leave the example text in there.
