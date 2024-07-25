"use client";
import React from "react";
import blueprint from "../../flatfile/blueprint";
import { Sheet, useFlatfile } from "@flatfile/react";
import moment from "moment";
import { Beer } from "@/app/types/beer";
type Props = {};

const generateCSVTemplate = (blueprint) => {
  const headers = blueprint.fields.map((field) => field.label).join(",") + "\n";
  const exampleRows = [
    [
      "Example Beer Name",
      "IPA",
      "7.5",
      "70",
      "Hoppy",
      "Malt1 Malt2",
      "Hop1 Hop2",
      "Freshest of the fresh hops",
      "One that was made up buy the great master minds",
      "Double Dry hopped with Citra and Mosaic",
      "2019-03-05",
      "false",
    ],
    [
      "Another Beer Name",
      "Stout",
      "5.6",
      "30",
      "Dark & Malty",
      "Malt1 Malt2",
      "Hop1 Hop2",
      "Dark Chocolatey and Delicious",
      "One that was made up buy the great master minds... again",
      "Collaboration with the brewery down the street",
      "2019-03-05",
      "true",
    ],
  ];
  const rows = exampleRows.map((row) => row.join(",")).join("\n");
  return headers + rows;
};

const downloadCSVTemplate = (template) => {
  const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "beer_template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const FlatfilePortal = () => {
  const { openPortal } = useFlatfile();

  //  Validate and transform records via onRecordHook
  const handleRecordValidation = (record: any) => {
    // Transform malts and hops into arrays
    const malts = record.get("malts");
    if (malts) {
      record.set(
        "malts",
        malts.split(",").map((malt: any) => malt.trim())
      );
    }

    const hops = record.get("hops");
    if (hops) {
      record.set(
        "hops",
        hops.split(",").map((hop: any) => hop.trim())
      );
    }

    // Convert ABV to a number
    const abv = parseFloat(record.get("abv"));
    record.set("abv", isNaN(abv) ? null : abv);

    // Convert IBU to a number
    const ibu = parseFloat(record.get("ibu"));
    record.set("ibu", isNaN(ibu) ? null : ibu);

    // Convert releaseDate to YYYY-MM-DD format using moment.js
    const releaseDate = record.get("release_date");
    if (releaseDate) {
      const formattedDate = moment(releaseDate, [
        "MM/DD/YYYY",
        "M/D/YYYY",
        "M/D/YY",
        "YYYY-MM-DD",
        "MMMM Do, YYYY",
        "MMM D, YYYY",
        "MMMM Do, YYYY",
      ]).format("YYYY-MM-DD");
      record.set("release_date", formattedDate);
    }

    // Convert archived to a boolean
    const archived = record.get("archived");
    record.set("archived", archived.toLowerCase() === "false");

    return record;
  };

  const template = generateCSVTemplate(blueprint);

  const handleDownloadTemplate = () => {
    downloadCSVTemplate(template);
  };

  return (
    <>
      <button className="btn btn-outline" onClick={openPortal}>
        Upload Beers
      </button>
      <button className="btn btn-outline" onClick={handleDownloadTemplate}>
        Download CSV Template
      </button>
      <Sheet
        config={blueprint}
        onSubmit={async ({ sheet }) => {
          const data = await sheet.allData();
          console.log("onSubmit", data);
        }}
        onRecordHook={(record) => handleRecordValidation(record)}
      />
    </>
  );
};

export default FlatfilePortal;

/* records
: 
Array(9)
0
: 
{id: 'us_rc_bf9281d474904d2eaac55ae5a63d74d2', values: {…}, metadata: {…}, config: {…}, valid: false}
1
: 
{id: 'us_rc_ff8585c6e50e4ff582f2337910d0d031', values: {…}, metadata: {…}, config: {…}, valid: false}
2
: 
{id: 'us_rc_bf9e8bc3a04d4814bf64795ff4ba4a83', values: {…}, metadata: {…}, config: {…}, valid: false}
3
: 
{id: 'us_rc_23fd47fb4dcb4b488809aa254a202f42', values: {…}, metadata: {…}, config: {…}, valid: false}
4
: 
{id: 'us_rc_7507e1841b594acdafdb958071a9af6a', values: {…}, metadata: {…}, config: {…}, valid: false}
5
: 
{id: 'us_rc_264bcd323d34434b937ba6dd9d09b829', values: {…}, metadata: {…}, config: {…}, valid: false}
6
: 
{id: 'us_rc_f7a342235f7e4305a5e820c71ab8204c', values: {…}, metadata: {…}, config: {…}, valid: false}
7
: 
{id: 'us_rc_eb29c3214f634709b040df529e4ecbec', values: {…}, metadata: {…}, config: {…}, valid: false}
8
: 
{id: 'us_rc_d921fa0aed2d42ec8642bb53a9908fca', values: {…}, metadata: {…}, config: {…}, valid: false}
length
: 
9
[[Prototype]]
: 
Array(0)
sheetId
: 
"us_sh_HnmAZL5Q"
workbookId
: 
"us_wb_OkCqw1Pq" 
*/
