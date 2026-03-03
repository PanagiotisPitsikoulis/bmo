# BMO Talking Robot

## What is this

A budget friendly, real-life BMO from Adventure Time. It's a small physical robot you can talk to, powered by a Raspberry Pi and an LED matrix screen for the face. You speak to it, it listens, thinks using AI, and talks back with a real voice. It can also search the web, tell you the time, and see things through a camera. Is very lightweight and is build using the Typescript language and Bun runtime, to be able to execute on very budget friendly hardware.

## Features

- Animated pixel face on a 64x32 RGB LED matrix (different expressions for idle, listening, thinking, speaking, and errors)
- Wake word detection — say a keyword and BMO wakes up
- Push-to-talk as an alternative to the wake word
- Speech-to-text using Whisper (runs locally, offline)
- AI conversation powered by Claude
- Text-to-speech using Fish Audio (BMO talks back out loud)
- Web search — ask BMO to look things up
- Camera vision — ask "what do you see?" and BMO takes a photo and describes it
- Tells the time
- Persistent chat memory across sessions
- Memory reset ("forget everything")
- Interrupt BMO mid-sentence by pressing space
- Interactive dev mode — try it in your browser before buying any hardware

## Instructions

### 1. Download This Repo

1. At the top of this page, click the green **Code** button
2. Click **Download ZIP**
3. Find the ZIP file in your Downloads folder
4. Double-click it to unzip — you should get a folder called `bmo-main`
5. Move that folder to your **Desktop** so it's easy to find
6. Rename the folder from `bmo-main` to `bmo`

### 2. Open a Terminal

You'll need to type commands in a terminal. Here's how to open one:

**Mac:** Press `Cmd + Space`, type `Terminal`, and press Enter

**Windows:** Click the Start menu, type `PowerShell`, and click **Windows PowerShell**

Keep this window open — you'll use it for all the following steps.

### 3. Install Node.js

1. Go to [nodejs.org](https://nodejs.org)
2. Click the big green **LTS** button to download
3. Open the downloaded file and install it — just keep clicking **Next** until it's done
4. **Close your terminal and reopen it** (this is important, it won't work otherwise)
5. To check it worked, type this in your terminal and press Enter:
   ```
   node --version
   ```
   You should see something like `v22.x.x`. If you see "command not found", restart your computer and try again.

### 4. Install Bun

**Mac:** Paste this into your terminal and press Enter:
```
curl -fsSL https://bun.sh/install | bash
```

**Windows:** Paste this into PowerShell and press Enter:
```
powershell -c "irm bun.sh/install.ps1 | iex"
```

After it finishes, **close your terminal and reopen it** (again, important).

To check it worked:
```
bun --version
```
You should see a version number. If not, close and reopen the terminal one more time.

### 5. Install Dependencies

Now you need to navigate to the BMO folder in your terminal.

Type this and press Enter:
```
cd ~/Desktop/bmo
```

> **Windows users:** If that doesn't work, try `cd C:\Users\YourName\Desktop\bmo` (replace `YourName` with your actual Windows username).

Now install the dependencies:
```
bun install
```

You'll see a bunch of text scrolling — that's normal. Wait until it finishes and you see your cursor again.

### 6. Set Up Your API Keys

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

### 7. Try It (Dev Mode)

This is the fun part. Run this in your terminal:

```
bun run dev
```

A browser window should open with BMO's face. If it doesn't open automatically, look at your terminal — it will show a URL like `http://localhost:3000`. Copy that and paste it into your browser.

> **If you get an error:** Double-check that your `.env` file has the correct API keys and that you saved it. Also make sure you're still in the `bmo` folder in your terminal (run `cd ~/Desktop/bmo` again if you're not sure).

### 8. Hardware Assembly (Optional)

Only needed if you want to build the physical robot. You can skip this if you just want to use BMO in the browser.

1. Solder the GPIO header pins onto the Raspberry Pi Zero 2 W (the Pi comes without them)
2. Plug the RGB Matrix Bonnet onto the Pi's GPIO pins
3. Connect the LED matrix panel to the bonnet using the ribbon cable that comes with the panel
4. Flash Raspberry Pi OS Lite to the MicroSD card using [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
5. Plug the USB OTG adapter into the Pi's micro USB port
6. Connect the speaker and microphone to the OTG adapter
7. Plug the 5V 4A power supply into the LED matrix panel
8. Plug the 5V 2.5A micro USB power supply into the Pi

### 9. Deploy to Hardware

1. Build the executable for Raspberry Pi (this cross-compiles from your computer):
   ```
   bun run build:pi
   ```
   This creates a single file at `dist/bmo` that runs on the Pi without needing Bun or Node.js installed.

2. Copy the executable and your `.env` file to the MicroSD card:
   ```
   cp dist/bmo /path/to/sdcard/
   cp .env /path/to/sdcard/
   ```

3. Insert the MicroSD card into the Pi
4. Put everything inside your BMO enclosure
5. Plug in both power supplies — BMO will boot up and run automatically

## Parts List

Estimated total: **~€105 / ~$115 / ~£90**

| Part | €EUR | $USD | £GBP |
|------|------|------|------|
| Raspberry Pi Zero 2 W | ~€20 | ~$22 | ~£17 |
| Waveshare RGB LED Matrix Panel P3 64×32 | ~€31 | ~$34 | ~£27 |
| Adafruit RGB Matrix Bonnet for Raspberry Pi | ~€33 | ~$36 | ~£28 |
| 5V 4A Power Supply (barrel jack) | ~€10 | ~$11 | ~£9 |
| 5V 2.5A Micro USB Power Supply | ~€9 | ~$10 | ~£8 |
| MicroSD Card (16GB+) | ~€5 | ~$6 | ~£4 |
| USB OTG Adapter (Micro USB to USB-A) | ~€3 | ~$3 | ~£3 |
| Mini USB Speaker | ~€8 | ~$9 | ~£7 |
| Mini USB Microphone | ~€5 | ~$6 | ~£4 |
| GPIO Header Pins 2×20 | ~€2 | ~$2 | ~£2 |

> Prices are approximate and may vary depending on your region and where you buy.

---

## Notes

- This is a DIY project. Use at your own risk.
- No warranty is provided. You are responsible for your own hardware and wiring.
- API usage (Claude, Fish Audio) may incur costs depending on your usage. Check their pricing pages.
- This project is not affiliated with or endorsed by Cartoon Network or the creators of Adventure Time.
- The codebase has full test coverage — 95 tests across 14 test files. If you want to verify everything works, run:
  ```
  bun test
  ```

---

Made with love by **Panos Pitsi**
