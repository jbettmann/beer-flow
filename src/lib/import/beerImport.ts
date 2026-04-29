import moment from "moment";
import blueprint from "@/flatfile/blueprint";
import { buildApiUrl } from "@/lib/api/base";
import type { Beer, NewBeer } from "@/types/beer";
import type { Category } from "@/types/category";

type BeerImportCsvRow = Record<string, string>;

type BeerImportFieldValue = string | number | boolean | null;

export type BeerImportNormalizedRow = {
  name: string;
  style: string;
  abv: number | null;
  ibu: number | null;
  category: string[];
  malt: string[];
  hops: string[];
  description: string;
  nameSake: string;
  notes: string;
  releasedOn: string | null;
  archived: boolean;
};

export type BeerImportFailure = {
  rowNumber: number;
  message: string;
  beerName?: string;
};

export type BeerImportSummary = {
  createdCount: number;
  failedCount: number;
  totalCount: number;
  failures: BeerImportFailure[];
};

const importFields = blueprint.fields as Array<{ key: string; label: string }>;

const headerLabels = importFields.map((field) => field.label);

const headerLookup = new Map(
  importFields.flatMap((field) => [
    [normalizeBeerImportKey(field.key), field.key],
    [normalizeBeerImportKey(field.label), field.key],
  ])
);

const dateFormats = [
  "MM/DD/YYYY",
  "M/D/YYYY",
  "M/D/YY",
  "YYYY-MM-DD",
  "MMMM Do, YYYY",
  "MMM D, YYYY",
];

export function normalizeBeerImportKey(value: string) {
  return value.trim().toLowerCase().replace(/[\s_]+/g, "");
}

function normalizeCellValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function getRecordValue(record: BeerImportCsvRow, key: string) {
  const normalizedKey = normalizeBeerImportKey(key);
  const directValue = record[key];

  if (directValue !== undefined && directValue !== null) {
    return directValue;
  }

  for (const [recordKey, value] of Object.entries(record)) {
    if (normalizeBeerImportKey(recordKey) === normalizedKey) {
      return value;
    }
  }

  const headerKey = headerLookup.get(normalizedKey);
  if (headerKey) {
    return record[headerKey] ?? "";
  }

  return "";
}

function splitListField(value: string) {
  return value
    .split(/[,;\n|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumberField(
  value: string,
  fieldLabel: string,
  required = false
): { value: number | null; error?: string } {
  if (!value) {
    return required
      ? { value: null, error: `${fieldLabel} is required.` }
      : { value: null };
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return { value: null, error: `${fieldLabel} must be a number.` };
  }

  return { value: parsed };
}

function parseBooleanField(
  value: string,
  fieldLabel: string
): { value: boolean; error?: string } {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return { value: false };
  }

  if (["true", "yes", "y", "1"].includes(normalized)) {
    return { value: true };
  }

  if (["false", "no", "n", "0"].includes(normalized)) {
    return { value: false };
  }

  return {
    value: false,
    error: `${fieldLabel} must be a boolean value.`,
  };
}

function parseDateField(value: string) {
  if (!value) {
    return { value: null as string | null };
  }

  const parsed = moment(value, dateFormats, true);

  if (!parsed.isValid()) {
    return {
      value: null as string | null,
      error: "Release Date must be a valid date.",
    };
  }

  return { value: parsed.format("YYYY-MM-DD") };
}

function escapeCsvValue(value: BeerImportFieldValue) {
  const stringValue =
    value === null || value === undefined ? "" : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function toCsv(rows: BeerImportFieldValue[][]) {
  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

export function buildBeerImportTemplateCsv() {
  const exampleRows = [
    [
      "Example Beer Name",
      "IPA",
      "7.5",
      "70",
      "Hoppy",
      "Malt1, Malt2",
      "Hop1, Hop2",
      "Freshest of the fresh hops",
      "One that was made up by the great master minds",
      "Double dry hopped with Citra and Mosaic",
      "2019-03-05",
      "false",
    ],
    [
      "Another Beer Name",
      "Stout",
      "5.6",
      "30",
      "Dark & Malty",
      "Malt1, Malt2",
      "Hop1, Hop2",
      "Dark chocolatey and delicious",
      "One that was made up by the great master minds again",
      "Collaboration with the brewery down the street",
      "2019-03-05",
      "true",
    ],
  ];

  return toCsv([headerLabels, ...exampleRows]);
}

export function buildBeerExportCsv(beers: Beer[]) {
  const rows = beers.map((beer) => [
    beer.name,
    beer.style,
    beer.abv ?? "",
    beer.ibu ?? "",
    beer.category?.map((category) => category.name).join(", ") ?? "",
    beer.malt?.join(", ") ?? "",
    beer.hops?.join(", ") ?? "",
    beer.description ?? "",
    beer.nameSake ?? "",
    beer.notes ?? "",
    beer.releasedOn ? moment(beer.releasedOn).format("YYYY-MM-DD") : "",
    beer.archived ? "true" : "false",
  ]);

  return toCsv([headerLabels, ...rows]);
}

export function createBeerCategoryCache(
  breweryCategories: Array<{ name: string; _id?: string }>
) {
  const cache = new Map<string, string>();

  breweryCategories
    .filter((category): category is { name: string; _id: string } =>
      Boolean(category._id)
    )
    .forEach((category) => {
      cache.set(normalizeBeerImportKey(category.name), category._id);
    });

  return cache;
}

export function parseBeerImportCsv(csvText: string) {
  const normalized = csvText
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const nextChar = normalized[index + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentValue += '"';
        index += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = false;
        continue;
      }

      currentValue += char;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if (char === "\n") {
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  const [rawHeaders = [], ...rawRows] = rows;
  const headers = rawHeaders.map((header) => header.trim());

  return rawRows
    .filter((row) => row.some((cell) => cell.trim().length > 0))
    .map((row) => {
      const record: BeerImportCsvRow = {};
      headers.forEach((header, index) => {
        record[header] = normalizeCellValue(row[index]);
      });
      return record;
    });
}

export function normalizeBeerImportRow(record: BeerImportCsvRow) {
  const errors: string[] = [];

  const name = normalizeCellValue(
    getRecordValue(record, "name") ?? getRecordValue(record, "Name")
  );
  const style = normalizeCellValue(
    getRecordValue(record, "style") ?? getRecordValue(record, "Style")
  );
  const categoryRaw = normalizeCellValue(
    getRecordValue(record, "category") ?? getRecordValue(record, "Category")
  );
  const malt = splitListField(
    normalizeCellValue(getRecordValue(record, "malts") ?? getRecordValue(record, "Malts"))
  );
  const hops = splitListField(
    normalizeCellValue(getRecordValue(record, "hops") ?? getRecordValue(record, "Hops"))
  );
  const description = normalizeCellValue(
    getRecordValue(record, "description") ??
      getRecordValue(record, "Description")
  );
  const nameSake = normalizeCellValue(
    getRecordValue(record, "name_sake") ??
      getRecordValue(record, "nameSake") ??
      getRecordValue(record, "Name Sake")
  );
  const notes = normalizeCellValue(
    getRecordValue(record, "notes") ?? getRecordValue(record, "Notes")
  );
  const releaseDateRaw = normalizeCellValue(
    getRecordValue(record, "release_date") ??
      getRecordValue(record, "releasedOn") ??
      getRecordValue(record, "Release Date")
  );
  const archivedRaw = normalizeCellValue(
    getRecordValue(record, "archived") ?? getRecordValue(record, "Archived")
  );

  if (!name) {
    errors.push("Name is required.");
  }

  if (!style) {
    errors.push("Style is required.");
  }

  const category = splitListField(categoryRaw);
  if (category.length === 0) {
    errors.push("Category is required.");
  }

  const abvField = parseNumberField(
    normalizeCellValue(getRecordValue(record, "abv") ?? getRecordValue(record, "ABV")),
    "ABV",
    true
  );
  if (abvField.error) {
    errors.push(abvField.error);
  }

  const ibuField = parseNumberField(
    normalizeCellValue(getRecordValue(record, "ibu") ?? getRecordValue(record, "IBU")),
    "IBU"
  );
  if (ibuField.error) {
    errors.push(ibuField.error);
  }

  const releaseDateField = parseDateField(releaseDateRaw);
  if (releaseDateField.error) {
    errors.push(releaseDateField.error);
  }

  const archivedField = parseBooleanField(archivedRaw, "Archived");
  if (archivedField.error) {
    errors.push(archivedField.error);
  }

  if (errors.length > 0) {
    return {
      value: null,
      errors,
    };
  }

  return {
    value: {
      name,
      style,
      abv: abvField.value,
      ibu: ibuField.value,
      category,
      malt,
      hops,
      description,
      nameSake,
      notes,
      releasedOn: releaseDateField.value,
      archived: archivedField.value,
    } satisfies BeerImportNormalizedRow,
    errors: [],
  };
}

export async function resolveBeerCategoryIds({
  breweryId,
  accessToken,
  categoryCache,
  categoryNames,
}: {
  breweryId: string;
  accessToken: string;
  categoryCache: Map<string, string>;
  categoryNames: string[];
}) {
  const categoryIds: string[] = [];
  const seenCategoryKeys = new Set<string>();

  for (const categoryName of categoryNames) {
    const normalizedCategoryName = normalizeBeerImportKey(categoryName);
    if (seenCategoryKeys.has(normalizedCategoryName)) {
      continue;
    }

    seenCategoryKeys.add(normalizedCategoryName);
    const existingId = categoryCache.get(normalizedCategoryName);

    if (existingId) {
      categoryIds.push(existingId);
      continue;
    }

    // Best effort: reuse brewery categories when possible, then create missing
    // categories through the existing endpoint instead of inventing ids.
    const createdCategory = await createBeerCategory({
      breweryId,
      accessToken,
      categoryName,
    });

    categoryCache.set(normalizedCategoryName, createdCategory._id);
    categoryIds.push(createdCategory._id);
  }

  return categoryIds;
}

export async function createBeerCategory({
  breweryId,
  accessToken,
  categoryName,
}: {
  breweryId: string;
  accessToken: string;
  categoryName: string;
}) {
  const response = await fetch(
    buildApiUrl(`/breweries/${breweryId}/categories`),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name: categoryName }),
    }
  );

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to create category"));
  }

  return (await response.json()) as Category;
}

export async function createBeerForBrewery({
  breweryId,
  accessToken,
  beer,
}: {
  breweryId: string;
  accessToken: string;
  beer: NewBeer;
}) {
  const response = await fetch(buildApiUrl(`/breweries/${breweryId}/beers`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(beer),
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response, "Failed to create beer"));
  }

  return (await response.json()) as Beer;
}

async function readApiErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const errorData = await response.json();
    if (typeof errorData?.message === "string" && errorData.message.trim()) {
      return errorData.message;
    }
  } catch {
    const text = await response.text().catch(() => "");
    if (text.trim()) {
      return text;
    }
  }

  return fallbackMessage;
}
