import { useEffect, useState } from "react";
import { List, ActionPanel, Action, Form, closeMainWindow, popToRoot, getPreferenceValues } from "@raycast/api";
import { getNotionClient, updatePage } from "./lib/notion";
import { NOTION } from "./lib/constants";
import { NotionPage, NotionSelect, NotionNumber, FinishFormValues } from "./lib/types";

export default function BookFinish() {
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
        const subtitle = format ? `Format: ${format}` : "";

        return (
          <List.Item
            key={b.id}
            title={b.properties.Title.title[0]?.plain_text}
            subtitle={subtitle}
            actions={
              <ActionPanel>
                <Action.Push title="Finish Book" target={<FinishForm page={b} />} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

interface FinishFormProps {
  page: NotionPage;
}

function FinishForm({ page }: FinishFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatProp = page.properties[NOTION.FORMAT] as NotionSelect | undefined;
  const format = formatProp?.select?.name;
  const isAudio = format === "AUDIO";

  async function submit(values: FinishFormValues) {
    setIsLoading(true);
    try {
      const properties: Record<string, unknown> = {
        [NOTION.END_DATE]: { date: { start: values.date } },
        [NOTION.STARS]: { select: { name: values.stars } },
      };

      // Set progress to 100% based on format
      if (isAudio) {
        const minutesTotalProp = page.properties[NOTION.MINUTES_TOTAL] as NotionNumber | undefined;
        const minutesTotal = minutesTotalProp?.number ?? 0;
        properties[NOTION.MINUTES_READ] = { number: minutesTotal };
      } else {
        const pageTotalProp = page.properties[NOTION.PAGE_TOTAL] as NotionNumber | undefined;
        const pageTotal = pageTotalProp?.number ?? 0;
        properties[NOTION.PAGES_READ] = { number: pageTotal };
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

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Finish" onSubmit={submit} />
        </ActionPanel>
      }
    >
      <Form.DatePicker id="date" title="Finish Date" />
      <Form.Dropdown id="stars" title="Stars">
        <Form.Dropdown.Item value="⭐" title="⭐" />
        <Form.Dropdown.Item value="⭐⭐" title="⭐⭐" />
        <Form.Dropdown.Item value="⭐⭐⭐" title="⭐⭐⭐" />
        <Form.Dropdown.Item value="⭐⭐⭐⭐" title="⭐⭐⭐⭐" />
        <Form.Dropdown.Item value="⭐⭐⭐⭐⭐" title="⭐⭐⭐⭐⭐" />
      </Form.Dropdown>
    </Form>
  );
}
