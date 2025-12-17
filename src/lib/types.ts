// Notion API types for our book database

export interface NotionTextContent {
  plain_text: string;
}

export interface NotionTitle {
  title: NotionTextContent[];
}

export interface NotionNumber {
  number: number | null;
}

export interface NotionSelect {
  select: {
    name: string;
  } | null;
}

export interface NotionDate {
  date: {
    start: string;
  } | null;
}

// Use a more flexible type for properties
export type BookProperties = Record<string, unknown> & {
  Title: NotionTitle;
  Format?: NotionSelect;
  "Pages Read"?: NotionNumber;
  "Minutes Read"?: NotionNumber;
  "Minutes Total"?: NotionNumber;
  "Page Total"?: NotionNumber;
  "Date Start"?: NotionDate;
  "Date Finish"?: NotionDate;
};

export interface NotionPage {
  id: string;
  properties: BookProperties;
}

export interface NotionQueryResponse {
  results: NotionPage[];
}

// Helper type guards
export function isNotionNumber(prop: unknown): prop is NotionNumber {
  return typeof prop === "object" && prop !== null && "number" in prop;
}

export function isNotionSelect(prop: unknown): prop is NotionSelect {
  return typeof prop === "object" && prop !== null && "select" in prop;
}

// Form value types
export interface StartFormValues {
  date: string;
  page?: string;
  hoursLeft?: string;
  minutesLeft?: string;
}

export interface FinishFormValues {
  date: string;
  stars: string;
}

export interface BookNewLookupValues {
  isbn: string;
  format: string;
}

export interface BookNewConfirmValues {
  isbn: string;
  title: string;
  subtitle: string;
  authors: string;
  publishers: string;
  pageTotal: string;
  hours?: string;
  minutes?: string;
  fiction: boolean;
  format: string;
}

export interface BookNewInitialData {
  isbn: number;
  title: string;
  subtitle: string;
  authors: string[];
  publishers: string[];
  pageTotal: number;
  hours: number;
  minutes: number;
  fiction: boolean;
  format: string;
}
