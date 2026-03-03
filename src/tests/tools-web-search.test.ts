import { test, expect, describe } from "bun:test";
import { searchWeb } from "../tools/web-search";

describe("searchWeb", () => {
  test("returns a string", async () => {
    const result = await searchWeb("bun javascript runtime");
    expect(typeof result).toBe("string");
  });

  test("returns search results or search empty for valid query", async () => {
    const result = await searchWeb("javascript");
    expect(
      result.startsWith("SEARCH RESULTS") || result === "SEARCH_EMPTY"
    ).toBe(true);
  });

  test("result contains title and snippet for successful search", async () => {
    const result = await searchWeb("javascript programming language");
    if (result.startsWith("SEARCH RESULTS")) {
      expect(result).toContain("Title:");
      expect(result).toContain("Snippet:");
    }
  });

  test("includes the query in the result for successful search", async () => {
    const query = "typescript programming";
    const result = await searchWeb(query);
    if (result.startsWith("SEARCH RESULTS")) {
      expect(result).toContain(query);
    }
  });

  test("snippet is truncated to 300 chars max", async () => {
    const result = await searchWeb("wikipedia history");
    if (result.startsWith("SEARCH RESULTS")) {
      const snippetMatch = result.match(/Snippet: (.*)/s);
      if (snippetMatch) {
        expect(snippetMatch[1]!.length).toBeLessThanOrEqual(300);
      }
    }
  });

  test("handles empty query gracefully", async () => {
    const result = await searchWeb("");
    expect(typeof result).toBe("string");
  });
});
