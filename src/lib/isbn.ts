export function normalizeISBN(input: string): number {
  const clean = input.replace(/[^0-9X]/gi, "");

  if (clean.length !== 10 && clean.length !== 13) {
    throw new Error("Invalid ISBN length");
  }

  return Number(clean);
}

