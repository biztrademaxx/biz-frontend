"use client";

import { useMemo, useState } from "react";
import { adminApi } from "@/lib/admin-api";

type ImportResponse = {
  success?: boolean;
  processed?: number;
  successCount?: number;
  errorCount?: number;
  errors?: { row: number; message: string }[];
  message?: string;
  error?: string;
};

export default function EntityBulkImport({
  title,
  description,
  endpoint,
  templateHeaders,
  sampleRow,
}: {
  title: string;
  description: string;
  endpoint: string;
  templateHeaders: string[];
  sampleRow: string[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [message, setMessage] = useState("");

  const templateTsv = useMemo(() => [templateHeaders.join("\t"), sampleRow.join("\t")].join("\n"), [templateHeaders, sampleRow]);
  const templateCsv = useMemo(() => {
    const escape = (v: string) => {
      if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`;
      return v;
    };
    return [templateHeaders.map(escape).join(","), sampleRow.map(escape).join(",")].join("\r\n");
  }, [templateHeaders, sampleRow]);

  const download = (content: string, fileName: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a CSV/TSV/XLSX file first.");
      return;
    }
    setLoading(true);
    setResult(null);
    setMessage("Uploading and importing...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await adminApi<ImportResponse>(endpoint, { method: "POST", body: formData });
      if (!res.success) {
        setMessage(res.error || "Import failed");
      } else {
        setMessage(res.message || "Import completed");
      }
      setResult(res);
    } catch (e: any) {
      setMessage(e?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-sm border bg-white p-5">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => download(templateTsv, `${title.toLowerCase().replace(/\s+/g, "-")}-template.tsv`, "text/tab-separated-values")}
        >
          Download TSV Template
        </button>
        <button
          type="button"
          className="rounded-sm bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          onClick={() => download(templateCsv, `${title.toLowerCase().replace(/\s+/g, "-")}-template.csv`, "text/csv")}
        >
          Download CSV Template
        </button>
      </div>

      <div className="rounded-sm border border-dashed p-4">
        <input
          type="file"
          accept=".csv,.tsv,.xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />
        <p className="mt-2 text-xs text-gray-500">Supported: CSV, TSV, XLSX, XLS</p>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleUpload}
        className="rounded-sm bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Importing..." : "Start Import"}
      </button>

      {message ? <p className="text-sm text-gray-700">{message}</p> : null}

      {result?.success ? (
        <div className="rounded-sm border bg-gray-50 p-3 text-sm">
          <p>Processed: {result.processed ?? 0}</p>
          <p>Success: {result.successCount ?? 0}</p>
          <p>Errors: {result.errorCount ?? 0}</p>
          {Array.isArray(result.errors) && result.errors.length > 0 ? (
            <div className="mt-2 max-h-48 overflow-auto rounded border bg-white p-2">
              {result.errors.map((e, idx) => (
                <p key={`${e.row}-${idx}`} className="text-xs text-red-700">
                  Row {e.row}: {e.message}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
