import { config } from "../config";

const TMP_WAV = "/tmp/bmo_input.wav";

function writeWavHeader(buffer: Buffer, sampleRate: number): Buffer {
  const dataSize = buffer.length;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, buffer]);
}

function computeRMS(samples: Int16Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    const normalized = samples[i]! / 32768;
    sum += normalized * normalized;
  }
  return Math.sqrt(sum / samples.length);
}

export async function recordAdaptive(): Promise<string | null> {
  console.log("[RECORD] Adaptive recording...");
  const sampleRate = 16000;
  const chunkDuration = 0.05;
  const chunkBytes = Math.floor(sampleRate * chunkDuration) * 2; // 16-bit mono
  const silenceChunksNeeded = Math.floor(config.silenceDuration / chunkDuration);
  const maxChunks = Math.floor(config.maxRecordTime / chunkDuration);

  const proc = Bun.spawn(
    ["arecord", "-D", "default", "-f", "S16_LE", "-r", String(sampleRate), "-c", "1", "-t", "raw", "-q"],
    { stdout: "pipe", stderr: "ignore" }
  );

  const chunks: Buffer[] = [];
  let silentChunks = 0;
  let totalChunks = 0;
  let skipChunks = 5; // skip first 5 chunks to avoid initial noise

  const reader = proc.stdout.getReader();

  try {
    let leftover = Buffer.alloc(0);

    while (totalChunks < maxChunks) {
      const { done, value } = await reader.read();
      if (done) break;

      leftover = Buffer.concat([leftover, Buffer.from(value)]);

      while (leftover.length >= chunkBytes) {
        const chunk = leftover.subarray(0, chunkBytes);
        leftover = Buffer.from(leftover.subarray(chunkBytes));
        chunks.push(Buffer.from(chunk));
        totalChunks++;

        if (skipChunks > 0) {
          skipChunks--;
          continue;
        }

        const samples = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.length / 2);
        const rms = computeRMS(samples);

        if (rms < config.silenceThreshold) {
          silentChunks++;
          if (silentChunks >= silenceChunksNeeded) {
            proc.kill();
            break;
          }
        } else {
          silentChunks = 0;
        }
      }

      if (silentChunks >= silenceChunksNeeded) break;
    }
  } catch {
    // stream closed
  }

  proc.kill();

  if (chunks.length === 0) return null;

  const raw = Buffer.concat(chunks);
  const wav = writeWavHeader(raw, sampleRate);
  await Bun.write(TMP_WAV, wav);
  console.log(`[RECORD] Saved ${(raw.length / sampleRate / 2).toFixed(1)}s to ${TMP_WAV}`);
  return TMP_WAV;
}

export async function recordPTT(stopSignal: { stopped: boolean }): Promise<string | null> {
  console.log("[RECORD] PTT recording...");
  const sampleRate = 16000;

  const proc = Bun.spawn(
    ["arecord", "-D", "default", "-f", "S16_LE", "-r", String(sampleRate), "-c", "1", "-t", "raw", "-q"],
    { stdout: "pipe", stderr: "ignore" }
  );

  const chunks: Buffer[] = [];
  const reader = proc.stdout.getReader();

  try {
    while (!stopSignal.stopped) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
    }
  } catch {
    // stream closed
  }

  proc.kill();

  if (chunks.length === 0) return null;

  const raw = Buffer.concat(chunks);
  const wav = writeWavHeader(raw, sampleRate);
  await Bun.write(TMP_WAV, wav);
  return TMP_WAV;
}
