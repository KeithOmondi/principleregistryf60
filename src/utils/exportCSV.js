// client/src/utils/exportCSV.js
export function exportToCSV(data, filename = "data.csv") {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0] || {});
  const csvRows = [
    headers.join(","), // header row
    ...data.map(row =>
      headers.map(field => JSON.stringify(row[field] ?? "")).join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
