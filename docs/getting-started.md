# Getting Started

## 1. Download This Repo

1. At the top of this page, click the green **Code** button
2. Click **Download ZIP**
3. Find the ZIP file in your Downloads folder
4. Double-click it to unzip — you should get a folder called `bmo-main`
5. Move that folder to your **Desktop** so it's easy to find
6. Rename the folder from `bmo-main` to `bmo`

## 2. Open a Terminal

You'll need to type commands in a terminal. Here's how to open one:

**Mac:** Press `Cmd + Space`, type `Terminal`, and press Enter

**Windows:** Click the Start menu, type `PowerShell`, and click **Windows PowerShell**

Keep this window open — you'll use it for all the following steps.

## 3. Install Node.js

1. Go to [nodejs.org](https://nodejs.org)
2. Click the big green **LTS** button to download
3. Open the downloaded file and install it — just keep clicking **Next** until it's done
4. **Close your terminal and reopen it** (this is important, it won't work otherwise)
5. To check it worked, type this in your terminal and press Enter:
   ```
   node --version
   ```
   You should see something like `v22.x.x`. If you see "command not found", restart your computer and try again.

## 4. Install Bun

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

## 5. Install Dependencies

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
