export async function searchWeb(query: string): Promise<string> {
  console.log(`[SEARCH] Searching for: ${query}`);
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BMO/1.0)" },
    });

    const html = await response.text();

    // Extract first result from DDG HTML
    const titleMatch = html.match(/<a[^>]*class="result__a"[^>]*>(.*?)<\/a>/s);
    const snippetMatch = html.match(/<a[^>]*class="result__snippet"[^>]*>(.*?)<\/a>/s);

    if (titleMatch) {
      const title = titleMatch[1]!.replace(/<[^>]*>/g, "").trim();
      const snippet = snippetMatch
        ? snippetMatch[1]!.replace(/<[^>]*>/g, "").trim().slice(0, 300)
        : "No description.";
      return `SEARCH RESULTS for '${query}':\nTitle: ${title}\nSnippet: ${snippet}`;
    }

    return "SEARCH_EMPTY";
  } catch (e) {
    console.error(`[SEARCH] Error: ${e}`);
    return "SEARCH_ERROR";
  }
}
