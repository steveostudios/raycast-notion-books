import { getPreferenceValues } from "@raycast/api";
import { Client } from "@notionhq/client";
import { NOTION } from "./constants";
import { success } from "./errors";
import { CreatePageParameters, UpdatePageParameters } from "@notionhq/client/build/src/api-endpoints";

interface Preferences {
  notion_token: string;
  notion_database_id: string;
  dry_run: boolean;
}

let _notion: Client | null = null;

export function getNotionClient(): Client {
  if (!_notion) {
    const { notion_token } = getPreferenceValues<Preferences>();
    _notion = new Client({
      auth: notion_token,
    });
  }
  return _notion;
}

export async function isbnExists(isbn: number) {
  const { notion_database_id } = getPreferenceValues<Preferences>();
  const client = getNotionClient();
  const res = await client.databases.query({
    database_id: notion_database_id,
    filter: {
      property: NOTION.ISBN,
      number: { equals: isbn },
    },
  });

  return res.results.length > 0;
}

export async function createPage(payload: CreatePageParameters) {
  const { dry_run } = getPreferenceValues<Preferences>();
  if (dry_run) {
    console.log("DRY RUN:", JSON.stringify(payload, null, 2));
    success("Dry run complete", "No data written");
    return;
  }

  const client = getNotionClient();
  await client.pages.create(payload);
  success("Success");
}

export async function updatePage(pageId: string, properties: UpdatePageParameters["properties"]) {
  const { dry_run } = getPreferenceValues<Preferences>();
  if (dry_run) {
    console.log("DRY RUN UPDATE:", pageId, properties);
    success("Dry run complete");
    return;
  }

  const client = getNotionClient();
  await client.pages.update({
    page_id: pageId,
    properties,
  });

  success("Updated");
}
