import { useEffect, useState } from "react";
import { List, ActionPanel, Action, Form, closeMainWindow, popToRoot, getPreferenceValues } from "@raycast/api";
import { getNotionClient, updatePage } from "./lib/notion";
import { NOTION } from "./lib/constants";
import { NotionPage, NotionSelect, NotionNumber, StartFormValues } from "./lib/types";

export default function BookStart() {
  const [books, setBooks] = useState<NotionPage[]>([]);

  useEffect(() => {
    const notion = getNotionClient();
    const { notion_database_id } = getPreferenceValues<Preferences>();
    notion.databases
      .query({
        database_id: notion_database_id,
        filter: {
          property: NOTION.START_DATE,
          date: { is_empty: true },
        },
      })
      .then((res) => setBooks(res.results as unknown as NotionPage[]));
  }, []);

  return (
    <List>
      {books.map((b) => {
        const formatProp = b.properties[NOTION.FORMAT] as NotionSelect | undefined;
        const format = formatProp?.select?.name;
        const subtitle = format ? `Format: ${format}` : "";

        return (
          <List.Item
            key={b.id}
            title={b.properties.Title.title[0]?.plain_text}
            subtitle={subtitle}
            actions={
              <ActionPanel>
                <Action.Push title="Start Reading" target={<StartForm page={b} />} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

interface StartFormProps {
  page: NotionPage;
}

function StartForm({ page }: StartFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatProp = page.properties[NOTION.FORMAT] as NotionSelect | undefined;
  const format = formatProp?.select?.name;
  const isAudio = format === "AUDIO";

  async function submit(values: StartFormValues) {
    setIsLoading(true);
    try {
      const properties: Record<string, unknown> = {
        [NOTION.START_DATE]: { date: { start: values.date } },
      };

      if (isAudio) {
        // Calculate minutes read from hours and minutes left
        const minutesTotalProp = page.properties[NOTION.MINUTES_TOTAL] as NotionNumber | undefined;
        const minutesTotal = minutesTotalProp?.number ?? 0;
        const hoursLeft = Number(values.hoursLeft) || 0;
        const minutesLeft = Number(values.minutesLeft) || 0;
        const totalMinutesLeft = hoursLeft * 60 + minutesLeft;
        const minutesRead = minutesTotal - totalMinutesLeft;

        properties[NOTION.MINUTES_READ] = { number: Math.max(0, minutesRead) };
      } else {
        properties[NOTION.PAGES_READ] = { number: Number(values.page) };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updatePage(page.id, properties as any);
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
    const minutesTotal = minutesTotalProp?.number ?? 0;
    defaultHoursLeft = Math.floor(minutesTotal / 60);
    defaultMinutesLeft = minutesTotal % 60;
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Start" onSubmit={submit} />
        </ActionPanel>
      }
    >
      <Form.DatePicker id="date" title="Start Date" />
      {isAudio ? (
        <>
          <Form.TextField id="hoursLeft" title="Hours Left" defaultValue={String(defaultHoursLeft)} />
          <Form.TextField id="minutesLeft" title="Minutes Left" defaultValue={String(defaultMinutesLeft)} />
        </>
      ) : (
        <Form.TextField id="page" title="Current Page" defaultValue="0" />
      )}
    </Form>
  );
}
