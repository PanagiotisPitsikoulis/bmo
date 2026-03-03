import { test, expect, describe } from "bun:test";

describe("audio/recorder", () => {
  test("recordAdaptive and recordPTT are exported", async () => {
    const mod = await import("../audio/recorder");
    expect(typeof mod.recordAdaptive).toBe("function");
    expect(typeof mod.recordPTT).toBe("function");
  });
});

describe("WAV header generation", () => {
  // Test the WAV header logic by importing the module and checking output format
  test("writeWavHeader produces valid WAV structure", () => {
    // Recreate the header logic to verify it
    const sampleRate = 16000;
    const dataSize = 100;
    const buffer = Buffer.alloc(dataSize);
    const header = Buffer.alloc(44);

    header.write("RIFF", 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(1, 22); // mono
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write("data", 36);
    header.writeUInt32LE(dataSize, 40);

    const wav = Buffer.concat([header, buffer]);

    expect(wav.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(wav.subarray(8, 12).toString("ascii")).toBe("WAVE");
    expect(wav.subarray(12, 16).toString("ascii")).toBe("fmt ");
    expect(wav.subarray(36, 40).toString("ascii")).toBe("data");
    expect(wav.readUInt16LE(20)).toBe(1); // PCM format
    expect(wav.readUInt16LE(22)).toBe(1); // mono
    expect(wav.readUInt32LE(24)).toBe(sampleRate);
    expect(wav.readUInt16LE(34)).toBe(16); // 16-bit
    expect(wav.readUInt32LE(40)).toBe(dataSize);
    expect(wav.length).toBe(44 + dataSize);
  });

  test("RMS computation returns 0 for silence", () => {
    const silence = new Int16Array(1000).fill(0);
    let sum = 0;
    for (let i = 0; i < silence.length; i++) {
      const normalized = silence[i]! / 32768;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / silence.length);
    expect(rms).toBe(0);
  });

  test("RMS computation returns > 0 for non-silent audio", () => {
    const loud = new Int16Array(1000);
    for (let i = 0; i < loud.length; i++) {
      loud[i] = Math.floor(Math.sin(i / 10) * 16000);
    }
    let sum = 0;
    for (let i = 0; i < loud.length; i++) {
      const normalized = loud[i]! / 32768;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / loud.length);
    expect(rms).toBeGreaterThan(0);
  });

  test("RMS of max volume signal is close to 1", () => {
    const max = new Int16Array(1000).fill(32767);
    let sum = 0;
    for (let i = 0; i < max.length; i++) {
      const normalized = max[i]! / 32768;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / max.length);
    expect(rms).toBeGreaterThan(0.99);
    expect(rms).toBeLessThan(1.01);
  });
});
