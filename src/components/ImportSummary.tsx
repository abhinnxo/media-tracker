
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ImportResult = {
  success: number;
  fail: number;
  warnings: string[];
  fileName?: string;
  details: {
    row: number;
    title: string;
    status: "success" | "fail";
    errors?: string[];
  }[];
};

const ImportSummary: React.FC<{ results: ImportResult; fileName?: string }> = ({
  results,
  fileName,
}) => {
  return (
    <Card className="p-6 mt-2">
      <h2 className="text-2xl font-semibold mb-2">📊 Import Summary</h2>
      <div>
        <div>
          <strong>File:</strong> <Badge>{fileName || "N/A"}</Badge>
        </div>
        <div className="flex gap-5 my-3">
          <div className="text-green-700">
            ✅ Imported: <b>{results.success}</b>
          </div>
          <div className="text-red-700">
            ❌ Failed: <b>{results.fail}</b>
          </div>
        </div>
        {results.warnings.length > 0 && (
          <div className="mb-2">
            <div className="text-yellow-700 font-bold">⚠️ Validation Warnings:</div>
            <ul className="list-disc ml-6 text-sm">
              {results.warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h3 className="mt-4 text-lg font-semibold mb-2">📋 Details</h3>
          <ul className="space-y-1 text-sm">
            {results.details.map((d, i) => (
              <li key={i}>
                {d.status === "success" ? (
                  <span>
                    ✅ <b>{d.title}</b> (Row {d.row}) imported successfully
                  </span>
                ) : (
                  <span className="text-red-700">
                    ❌ <b>{d.title}</b> (Row {d.row}) failed
                    {d.errors && (
                      <ul className="list-disc ml-6">
                        {d.errors.map((e, j) => (
                          <li key={j} className="text-xs">{e}</li>
                        ))}
                      </ul>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default ImportSummary;
