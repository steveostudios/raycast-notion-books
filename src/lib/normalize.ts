// lib/normalize.ts
export function normalizeName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function toTitleCase(text: string): string {
  // Words that should remain lowercase in titles (unless they're the first word)
  const minorWords = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "but",
    "by",
    "for",
    "from",
    "in",
    "into",
    "nor",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
  ]);

  return text
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      // Always capitalize first word, last word, or words not in minorWords
      if (index === 0 || !minorWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(" ");
}

