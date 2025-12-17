import {
  Action,
  ActionPanel,
  Form,
  useNavigation,
  closeMainWindow,
  popToRoot,
  getPreferenceValues,
} from "@raycast/api";
import { useState } from "react";
import { fetchBookByISBN, fetchAuthors, coverUrl } from "./lib/openlibrary";
import { normalizeISBN } from "./lib/isbn";
import { normalizeName, toTitleCase } from "./lib/normalize";
import { createPage, isbnExists } from "./lib/notion";
import { NOTION } from "./lib/constants";
import { fail } from "./lib/errors";
import { BookNewLookupValues, BookNewConfirmValues, BookNewInitialData } from "./lib/types";

export default function BookNew() {
  const { push } = useNavigation();

  async function lookup(values: BookNewLookupValues) {
    try {
      const isbn = normalizeISBN(values.isbn);
      const data = (await fetchBookByISBN(isbn)) as {
        title?: string;
        subtitle?: string;
        authors?: string[];
        publishers?: string[];
        number_of_pages?: number;
      };
      const authors = await fetchAuthors(data.authors || []);

      push(
        <Confirm
          initial={{
            isbn,
            title: toTitleCase(data.title ?? ""),
            subtitle: data.subtitle ? toTitleCase(data.subtitle) : "",
            authors,
            publishers: data.publishers ?? [],
            pageTotal: data.number_of_pages ?? 0,
            hours: 0,
            minutes: 0,
            fiction: false,
            format: values.format,
          }}
        />,
      );
    } catch (e) {
      const error = e as Error;
      fail("Lookup failed", error.message);
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Lookup ISBN" onSubmit={lookup} />
        </ActionPanel>
      }
    >
      <Form.TextField id="isbn" title="ISBN" autoFocus />
      <Form.Dropdown id="format" title="Format">
        <Form.Dropdown.Item value="HARDCOVER" title="Hardcover" />
        <Form.Dropdown.Item value="PAPERBACK" title="Paperback" />
        <Form.Dropdown.Item value="EBOOK" title="Ebook" />
        <Form.Dropdown.Item value="AUDIO" title="Audiobook" />
      </Form.Dropdown>
    </Form>
  );
}

interface ConfirmProps {
  initial: BookNewInitialData;
}

function Confirm({ initial }: ConfirmProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { notion_database_id } = getPreferenceValues<Preferences>();
  async function submit(values: BookNewConfirmValues) {
    setIsLoading(true);
    try {
      const isbn = Number(values.isbn);
      if (await isbnExists(isbn)) {
        fail("ISBN already exists");
        setIsLoading(false);
        return;
      }

      const properties: Record<string, unknown> = {
        Title: { title: [{ text: { content: toTitleCase(values.title) } }] },
        Subtitle: {
          rich_text: values.subtitle ? [{ text: { content: toTitleCase(values.subtitle) } }] : [],
        },
        ISBN: { number: isbn },
        Fiction: { checkbox: values.fiction },
        "Author(s)": {
          multi_select: values.authors
            .split(",")
            .map(normalizeName)
            .filter(Boolean)
            .map((a: string) => ({ name: a })),
        },
        Publishers: {
          multi_select: values.publishers
            .split(",")
            .map(normalizeName)
            .filter(Boolean)
            .map((p: string) => ({ name: p })),
        },
        Cover: {
          files: [
            {
              name: "Cover",
              external: { url: coverUrl(isbn) },
            },
          ],
        },
        Format: { select: { name: values.format } },
        "Page Total": { number: Number(values.pageTotal) || 0 },
      };

      // Add format-specific fields
      if (values.format === "AUDIO") {
        const hours = Number(values.hours) || 0;
        const minutes = Number(values.minutes) || 0;
        const minutesTotal = hours * 60 + minutes;
        properties[NOTION.MINUTES_TOTAL] = { number: minutesTotal };
      }

      const payload = {
        parent: { database_id: notion_database_id },
        properties,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createPage(payload as any);
      await closeMainWindow();
    } catch (e) {
      const error = e as Error;
      fail("Create failed", error.message);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      popToRoot({ clearSearchBar: true });
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Book" onSubmit={submit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title" defaultValue={initial.title} />
      <Form.TextField id="subtitle" title="Subtitle" defaultValue={initial.subtitle} />
      <Form.TextField id="authors" title="Authors" defaultValue={initial.authors.join(", ")} />
      <Form.TextField id="publishers" title="Publishers" defaultValue={initial.publishers.join(", ")} />
      <Form.TextField id="isbn" title="ISBN" defaultValue={String(initial.isbn)} />
      {initial.format === "AUDIO" && (
        <>
          <Form.TextField id="hours" title="Hours" defaultValue={String(initial.hours)} />
          <Form.TextField id="minutes" title="Minutes" defaultValue={String(initial.minutes)} />
        </>
      )}
      <Form.TextField id="pageTotal" title="Page Count" defaultValue={String(initial.pageTotal)} />
      <Form.TextField id="format" title="Format" defaultValue={initial.format} />
      <Form.Checkbox id="fiction" label="Fiction" />
    </Form>
  );
}
