# Deploy to Hardware

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
