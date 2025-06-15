
import React, { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { mediaStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import { MediaCategory, MediaStatus, MediaItem } from "@/lib/types";
import ImportSummary from "../components/ImportSummary";

type RawRow = Record<string, string>;
type ImportResult = {
  success: number;
  fail: number;
  warnings: string[];
  details: { row: number; title: string; status: "success" | "fail"; errors?: string[] }[];
};

const REQUIRED = ["title", "category", "status"];
const CATEGORY_ENUM = ["movie", "tv-series", "anime", "book", "manga"];
const STATUS_ENUM = ["to-consume", "in-progress", "completed", "dropped", "on-hold"];

function cleanRow(row: RawRow, rowNum: number, warnings: string[]): [Partial<MediaItem> | null, string[]] {
  const errors: string[] = [];

  // Required validation
  for (const required of REQUIRED) {
    if (!row[required] || row[required].trim() === "") {
      errors.push(`Missing required field "${required}"`);
    }
  }

  // Enum validation (case-sensitive)
  if (row.category && !CATEGORY_ENUM.includes(row.category.trim())) {
    errors.push(
      `Invalid category "${row.category}". Allowed: ${CATEGORY_ENUM.join(", ")}`
    );
  }
  if (row.status && !STATUS_ENUM.includes(row.status.trim())) {
    errors.push(
      `Invalid status "${row.status}". Allowed: ${STATUS_ENUM.join(", ")}`
    );
  }

  // If errors, reject row
  if (errors.length > 0) {
    return [null, errors];
  }

  // Start building the media item payload
  const obj: any = {
    title: row.title.trim(),
    category: row.category.trim(),
    status: row.status.trim(),
  };

  // Optional fields
  const fields = [
    "description",
    "image_url",
    "rating",
    "tags",
    "start_date",
    "end_date",
    "notes",
    "year",
    "creator",
    "genres",
    "total_seasons",
    "current_season",
    "current_episode",
    "overall_progress_percentage",
  ];

  for (const field of fields) {
    let value = row[field];
    if (typeof value !== "undefined" && value !== null && value.trim() !== "") {
      // Handle type conversion:
      switch (field) {
        case "rating":
          let ratingVal = Number(value.trim());
          if (isNaN(ratingVal)) {
            warnings.push(
              `Row ${rowNum}: Rating must be a number, got "${value}". Skipped.`
            );
            continue;
          }
          if (ratingVal > 10) {
            warnings.push(
              `Row ${rowNum}: Rating ${ratingVal} exceeds maximum, capped to 10.`
            );
            ratingVal = 10;
          }
          if (ratingVal < 1) {
            warnings.push(
              `Row ${rowNum}: Rating ${ratingVal} below minimum, raised to 1.`
            );
            ratingVal = 1;
          }
          obj.rating = ratingVal;
          break;
        case "overall_progress_percentage":
          let progressVal = Number(value.trim());
          if (isNaN(progressVal)) {
            warnings.push(`Row ${rowNum}: Progress must be a number, got "${value}". Skipped.`);
            continue;
          }
          if (progressVal > 100) {
            warnings.push(
              `Row ${rowNum}: Progress ${progressVal} exceeds 100. Set to 100.`
            );
            progressVal = 100;
          }
          if (progressVal < 0) {
            warnings.push(
              `Row ${rowNum}: Progress ${progressVal} below 0. Set to 0.`
            );
            progressVal = 0;
          }
          obj.overall_progress_percentage = progressVal;
          break;
        case "total_seasons":
        case "current_season":
        case "current_episode":
          let numVal = Number(value.trim());
          if (isNaN(numVal)) {
            warnings.push(`Row ${rowNum}: ${field} must be a number, got "${value}". Skipped.`);
            continue;
          }
          obj[field] = numVal;
          break;
        case "tags":
        case "genres":
          obj[field] = value
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean);
          break;
        case "image_url":
          try {
            new URL(value.trim());
            obj.image_url = value.trim();
          } catch {
            warnings.push(
              `Row ${rowNum}: image_url "${value}" is not a valid URL`
            );
          }
          break;
        default:
          obj[field] = value.trim();
      }
    }
  }
  return [obj, []];
}

const ImportPage: React.FC = () => {
  const [results, setResults] = useState<ImportResult | null>(null);
  const [isImporting, setImporting] = useState(false);
  const [csvName, setCsvName] = useState("");
  const { user } = useAuth();

  const handleFile = (file: File) => {
    setImporting(true);
    setCsvName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const rows = parsed.data as RawRow[];
        const warnings: string[] = [];
        let success = 0;
        let fail = 0;
        let details: ImportResult["details"] = [];

        for (let i = 0; i < rows.length; i++) {
          // CSV Row numbers are usually i+2 (headers + index)
          const rowNum = i + 2;
          const [clean, errs] = cleanRow(rows[i], rowNum, warnings);
          if (!clean || errs.length) {
            fail++;
            details.push({
              row: rowNum,
              title: rows[i].title || "(No title)",
              status: "fail",
              errors: errs,
            });
            continue;
          }
          try {
            await mediaStore.add({ ...clean, user_id: user?.id });
            success++;
            details.push({
              row: rowNum,
              title: clean.title,
              status: "success",
            });
          } catch (e: any) {
            fail++;
            details.push({
              row: rowNum,
              title: clean.title,
              status: "fail",
              errors: [e.message ?? "Failed to import"],
            });
          }
        }
        setResults({ success, fail, warnings, details });
        setImporting(false);

        toast({
          title: "Import Complete",
          description: `${success} item(s) imported, ${fail} failed.`,
          variant: fail > 0 ? "destructive" : "default"
        });
      },
      error: (error) => {
        setImporting(false);
        toast({
          title: "CSV Read Error",
          description: error.message ?? "Could not parse file",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">
      <Card className="p-8 flex flex-col space-y-5">
        <h1 className="text-3xl font-bold mb-2">Import Library Items</h1>
        <p>
          Upload a CSV file to batch-import items into your library. The CSV must include the columns: <Badge>title</Badge>, <Badge>category</Badge>, <Badge>status</Badge>. 
          Other fields are optional. 
        </p>
        <Input
          type="file"
          accept=".csv"
          disabled={isImporting}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />
        <a
          className="text-blue-700 underline text-sm"
          href="https://gist.githubusercontent.com/lovable-ai/bf4592206135b14e2c03904821436b13/raw/import_sample.csv"
          download="library_import_sample.csv"
          target="_blank"
        >
          Download sample CSV
        </a>
      </Card>
      {results && <ImportSummary results={results} fileName={csvName} />}
    </div>
  );
};

export default ImportPage;
