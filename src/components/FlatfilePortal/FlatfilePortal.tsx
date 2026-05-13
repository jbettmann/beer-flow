"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBreweryContext } from "@/context/brewery-beer";
import { useToast } from "@/context/toast";
import {
  buildBeerExportCsv,
  createBeerCategoryCache,
  buildBeerImportTemplateCsv,
  createBeerForBrewery,
  normalizeBeerImportRow,
  parseBeerImportCsv,
  resolveBeerCategoryIds,
} from "@/lib/import/beerImport";
import { Download, Loader2, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useRef, useState } from "react";
import type {
  BeerImportFailure,
  BeerImportSummary,
} from "@/lib/import/beerImport";

const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const FlatfilePortal = () => {
  const { data: session } = useSession();
  const { selectedBrewery, selectedBeers, mutateBeers, mutateBrewery, isAdmin } =
    useBreweryContext();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [summary, setSummary] = useState<BeerImportSummary | null>(null);

  const accessToken = session?.user?.accessToken;
  const breweryId = selectedBrewery?._id;
  const canImport = Boolean(isAdmin && breweryId && accessToken);

  const handleDownloadTemplate = () => {
    downloadCsv("beer_template.csv", buildBeerImportTemplateCsv());
  };

  const handleExport = () => {
    downloadCsv(
      `${selectedBrewery?.companyName || "beer"}-export.csv`,
      buildBeerExportCsv(selectedBeers ?? [])
    );
  };

  const pushFailure = (
    failures: BeerImportFailure[],
    failure: BeerImportFailure
  ) => {
    failures.push(failure);
  };

  const handleImportRows = async (csvText: string) => {
    if (!selectedBrewery || !breweryId || !accessToken) {
      throw new Error("Select a brewery and sign in before importing beers.");
    }

    const parsedRows = parseBeerImportCsv(csvText);
    if (parsedRows.length === 0) {
      throw new Error("No rows were found in the CSV file.");
    }

    const categoryCache = createBeerCategoryCache(selectedBrewery.categories);

    const failures: BeerImportFailure[] = [];
    let createdCount = 0;

    for (let index = 0; index < parsedRows.length; index += 1) {
      const rowNumber = index + 2;
      const record = parsedRows[index];
      const rowName =
        record.Name || record.name || record["Beer Name"] || record["beer name"];

      try {
        const normalized = normalizeBeerImportRow(record);

        if (!normalized.value) {
          pushFailure(failures, {
            rowNumber,
            beerName: rowName || undefined,
            message: normalized.errors.join(" "),
          });
          continue;
        }

        const categoryIds = await resolveBeerCategoryIds({
          breweryId,
          accessToken,
          categoryCache,
          categoryNames: normalized.value.category,
        });

        const createdBeer = await createBeerForBrewery({
          breweryId,
          accessToken,
          beer: {
            name: normalized.value.name,
            style: normalized.value.style,
            abv: normalized.value.abv ?? 0,
            ibu: normalized.value.ibu ?? 0,
            category: categoryIds,
            malt: normalized.value.malt,
            hops: normalized.value.hops,
            description: normalized.value.description,
            nameSake: normalized.value.nameSake,
            notes: normalized.value.notes,
            image: "",
            archived: normalized.value.archived,
            releasedOn: normalized.value.releasedOn,
          },
        });

        if (!createdBeer?._id) {
          pushFailure(failures, {
            rowNumber,
            beerName: normalized.value.name,
            message: "Beer created but no record id was returned.",
          });
          continue;
        }

        createdCount += 1;
      } catch (error) {
        pushFailure(failures, {
          rowNumber,
          beerName: rowName || undefined,
          message:
            error instanceof Error ? error.message : "Failed to import row.",
        });
      }
    }

    if (createdCount > 0) {
      await Promise.all([mutateBeers(), mutateBrewery()]);
    }

    const result: BeerImportSummary = {
      createdCount,
      failedCount: failures.length,
      totalCount: parsedRows.length,
      failures,
    };

    setSummary(result);

    if (failures.length > 0) {
      addToast(
        `Imported ${createdCount} beer${createdCount === 1 ? "" : "s"} with ${failures.length} failure${
          failures.length === 1 ? "" : "s"
        }.`,
        "info"
      );
    } else {
      addToast(
        `Imported ${createdCount} beer${createdCount === 1 ? "" : "s"} successfully.`,
        "success"
      );
    }
  };

  const handleFileSelection = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsImporting(true);
    try {
      const csvText = await file.text();
      await handleImportRows(csvText);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to import beers.";
      setSummary({
        createdCount: 0,
        failedCount: 1,
        totalCount: 0,
        failures: [
          {
            rowNumber: 0,
            message,
          },
        ],
      });
      addToast(message, "error");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Template
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={!canImport || isImporting}
        >
          {isImporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Import
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleExport}
          disabled={!selectedBrewery}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileSelection}
      />

      <Dialog
        open={Boolean(summary)}
        onOpenChange={(open) => {
          if (!open) {
            setSummary(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import summary</DialogTitle>
            <DialogDescription>
              Review the created beer count and any rows that need attention.
            </DialogDescription>
          </DialogHeader>

          {summary && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md border p-3">
                  <p className="text-xs uppercase text-muted-foreground">
                    Created
                  </p>
                  <p className="text-2xl font-semibold">
                    {summary.createdCount}
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs uppercase text-muted-foreground">
                    Failed
                  </p>
                  <p className="text-2xl font-semibold">{summary.failedCount}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs uppercase text-muted-foreground">
                    Total
                  </p>
                  <p className="text-2xl font-semibold">{summary.totalCount}</p>
                </div>
              </div>

              {summary.failures.length > 0 ? (
                <ScrollArea className="max-h-[18rem] rounded-md border">
                  <div className="divide-y">
                    {summary.failures.map((failure) => (
                      <div
                        key={`${failure.rowNumber}-${failure.message}`}
                        className="space-y-1 p-3"
                      >
                        <p className="text-sm font-medium">
                          Row {failure.rowNumber}
                          {failure.beerName ? ` - ${failure.beerName}` : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {failure.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No row-level failures were reported.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FlatfilePortal;
