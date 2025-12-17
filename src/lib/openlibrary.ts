export async function fetchBookByISBN(isbn: number) {
  const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
  if (!res.ok) throw new Error("No book found for ISBN");
  return res.json();
}

export async function fetchAuthors(authorRefs: any[]) {
  if (!authorRefs?.length) return [];

  return Promise.all(
    authorRefs.map(async (a) => {
      const res = await fetch(`https://openlibrary.org${a.key}.json`);
      const json = await res.json();
      return json.name;
    })
  );
}

export function coverUrl(isbn: number) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

