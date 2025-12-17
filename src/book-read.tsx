import { useEffect, useState } from "react";
import { List, ActionPanel, Action, Form, closeMainWindow, popToRoot, getPreferenceValues } from "@raycast/api";
import { getNotionClient, updatePage } from "./lib/notion";
import { NOTION } from "./lib/constants";
import { NotionPage, NotionNumber, NotionSelect } from "./lib/types";

export default function BookRead() {
  const [books, setBooks] = useState<NotionPage[]>([]);

  useEffect(() => {
    const notion = getNotionClient();
    const { notion_database_id } = getPreferenceValues<Preferences>();
    notion.databases
      .query({
        database_id: notion_database_id,
        filter: {
          and: [
            { property: NOTION.START_DATE, date: { is_not_empty: true } },
            { property: NOTION.END_DATE, date: { is_empty: true } },
          ],
        },
      })
      .then((res) => setBooks(res.results as unknown as NotionPage[]));
  }, []);

  return (
    <List>
      {books.map((b) => {
        const formatProp = b.properties[NOTION.FORMAT] as NotionSelect | undefined;
        const format = formatProp?.select?.name;
        const isAudio = format === "AUDIO";

        let subtitle = "";
        if (isAudio) {
          const minutesReadProp = b.properties[NOTION.MINUTES_READ] as NotionNumber | undefined;
          const minutesRead = minutesReadProp?.number ?? 0;
          const hours = Math.floor(minutesRead / 60);
          const minutes = minutesRead % 60;
          subtitle = `${hours}h ${minutes}m`;
        } else {
          const pagesReadProp = b.properties[NOTION.PAGES_READ] as NotionNumber | undefined;
          subtitle = `Page ${pagesReadProp?.number ?? 0}`;
        }

        return (
          <List.Item
            key={b.id}
            title={b.properties.Title.title[0]?.plain_text}
            subtitle={subtitle}
            actions={
              <ActionPanel>
                <Action.Push title="Update Progress" target={<ReadForm page={b} />} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

interface ReadFormProps {
  page: NotionPage;
}

interface FormValues {
  page?: string;
  hoursLeft?: string;
  minutesLeft?: string;
}

function ReadForm({ page }: ReadFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatProp = page.properties[NOTION.FORMAT] as NotionSelect | undefined;
  const format = formatProp?.select?.name;
  const isAudio = format === "AUDIO";

  async function submit(values: FormValues) {
    setIsLoading(true);
    try {
      if (isAudio) {
        // Calculate minutes read from hours and minutes left
        const minutesTotalProp = page.properties[NOTION.MINUTES_TOTAL] as NotionNumber | undefined;
        const minutesTotal = minutesTotalProp?.number ?? 0;
        const hoursLeft = Number(values.hoursLeft) || 0;
        const minutesLeft = Number(values.minutesLeft) || 0;
        const totalMinutesLeft = hoursLeft * 60 + minutesLeft;
        const minutesRead = minutesTotal - totalMinutesLeft;

        await updatePage(page.id, {
          [NOTION.MINUTES_READ]: { number: Math.max(0, minutesRead) },
        });
      } else {
        await updatePage(page.id, {
          [NOTION.PAGES_READ]: { number: Number(values.page) },
        });
      }
      await closeMainWindow();
    } catch {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      popToRoot({ clearSearchBar: true });
    }
  }

  // Calculate default values for audio books
  let defaultHoursLeft = 0;
  let defaultMinutesLeft = 0;
  if (isAudio) {
    const minutesTotalProp = page.properties[NOTION.MINUTES_TOTAL] as NotionNumber | undefined;
    const minutesReadProp = page.properties[NOTION.MINUTES_READ] as NotionNumber | undefined;
    const minutesTotal = minutesTotalProp?.number ?? 0;
    const minutesRead = minutesReadProp?.number ?? 0;
    const minutesLeft = minutesTotal - minutesRead;
    defaultHoursLeft = Math.floor(minutesLeft / 60);
    defaultMinutesLeft = minutesLeft % 60;
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Update" onSubmit={submit} />
        </ActionPanel>
      }
    >
      {isAudio ? (
        <>
          <Form.TextField id="hoursLeft" title="Hours Left" defaultValue={String(defaultHoursLeft)} />
          <Form.TextField id="minutesLeft" title="Minutes Left" defaultValue={String(defaultMinutesLeft)} />
        </>
      ) : (
        <Form.TextField
          id="page"
          title="Page"
          defaultValue={String((page.properties[NOTION.PAGES_READ] as NotionNumber | undefined)?.number ?? 0)}
        />
      )}
    </Form>
  );
}
