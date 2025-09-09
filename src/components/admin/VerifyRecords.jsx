import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearMatchesDB, uploadFiles } from "../../store/slices/matchSlice";
import { exportToCSV } from "../../utils/exportCSV";

const ROWS_PER_PAGE = 50;

export default function VerifyRecords() {
  const dispatch = useDispatch();
  const { matches, stats, loading, error } = useSelector((state) => state.match);

  const [pdfFile, setPdfFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const [mode, setMode] = useState("tokens");
  const [threshold, setThreshold] = useState(0.85);

  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date_published", dir: "desc" });
  const [expandedGroups, setExpandedGroups] = useState({});
  const [pagePerGroup, setPagePerGroup] = useState({});

  // ---------------- Auto-expand groups when matches change ----------------
  const groupedMatches = useMemo(() => {
    return matches.reduce((acc, rec) => {
      const groupKey = rec.volume_no || "Unknown Volume";
      (acc[groupKey] ||= []).push(rec);
      return acc;
    }, {});
  }, [matches]);

  useEffect(() => {
    const groups = Object.keys(groupedMatches).reduce((acc, g) => ({ ...acc, [g]: true }), {});
    setExpandedGroups(groups);
  }, [groupedMatches]);

  // ---------------- Submit Files ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile || !excelFile) return alert("Upload both PDF & Excel files.");

    setProgress(0);
    const formData = { pdfFile, excelFile, mode, threshold };

    try {
      await dispatch(uploadFiles(formData)).unwrap();
      setPdfFile(null);
      setExcelFile(null);
      setProgress(100);
    } catch {
      setProgress(0);
    } finally {
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // ---------------- Clear DB ----------------
  const handleClear = async () => {
    if (!window.confirm("Clear ALL stored matches?")) return;
    try {
      await dispatch(clearMatchesDB()).unwrap();
      setExpandedGroups({});
      setPagePerGroup({});
    } catch {
      alert("Failed to clear records.");
    }
  };

  // ---------------- Filter & Sort ----------------
  const filteredMatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return matches;
    return matches.filter((r) =>
      ["court_station", "cause_no", "name_of_deceased", "status_at_gp", "volume_no", "date_published"]
        .some((f) => String(r[f] ?? "").toLowerCase().includes(q))
    );
  }, [matches, search]);

  const sortedMatches = useMemo(() => {
    if (!sortConfig.key) return filteredMatches;
    return [...filteredMatches].sort((a, b) => {
      const A = String(a[sortConfig.key] ?? "");
      const B = String(b[sortConfig.key] ?? "");
      return sortConfig.dir === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    });
  }, [filteredMatches, sortConfig]);

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  };

  const renderCell = (value) => {
    if (!value?.trim?.()) return <span className="text-red-500 italic">N/A</span>;
    if (!search) return value;
    const regex = new RegExp(`(${search})`, "gi");
    return <span dangerouslySetInnerHTML={{ __html: String(value).replace(regex, "<mark>$1</mark>") }} />;
  };

  const renderTable = () => {
    const groups = Object.keys(groupedMatches);
    if (!groups.length) return <p className="mt-4 text-gray-500 text-center">No matches found.</p>;

    return groups.map((groupKey) => {
      const rows = groupedMatches[groupKey];
      const page = pagePerGroup[groupKey] || 1;
      const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE);
      const paged = rows.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

      return (
        <div key={groupKey} className="mb-8 border rounded-lg shadow bg-white">
          <h4
            className="bg-gray-100 px-4 py-2 font-semibold cursor-pointer hover:bg-gray-200 rounded-t-lg"
            onClick={() => setExpandedGroups((p) => ({ ...p, [groupKey]: !p[groupKey] }))}
          >
            {groupKey} ({rows.length})
          </h4>
          {expandedGroups[groupKey] && (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="min-w-full border text-sm">
                <thead className="sticky top-0 z-10 bg-blue-600 text-white">
                  <tr>
                    {[
                      { key: "id", label: "No.", sticky: true },
                      { key: "court_station", label: "Court Station" },
                      { key: "cause_no", label: "Cause No." },
                      { key: "name_of_deceased", label: "Name of Deceased" },
                      { key: "status_at_gp", label: "Status at G.P." },
                      { key: "volume_no", label: "Volume No." },
                      { key: "date_published", label: "Date Published" },
                    ].map((c) => (
                      <th
                        key={c.key}
                        onClick={() => requestSort(c.key)}
                        className={`px-3 py-2 border cursor-pointer text-left ${
                          c.sticky ? "sticky left-0 bg-blue-600 z-20" : ""
                        }`}
                      >
                        {c.label} {sortConfig.key === c.key ? (sortConfig.dir === "asc" ? "▲" : "▼") : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r, i) => (
                    <tr key={r.id ?? `${groupKey}-${i}`} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-3 py-2 border sticky left-0 bg-white font-medium">
                        {i + 1 + (page - 1) * ROWS_PER_PAGE}
                      </td>
                      <td className="px-3 py-2 border">{renderCell(r.court_station)}</td>
                      <td className="px-3 py-2 border">{renderCell(r.cause_no)}</td>
                      <td className="px-3 py-2 border">{renderCell(r.name_of_deceased)}</td>
                      <td className="px-3 py-2 border">{renderCell(r.status_at_gp)}</td>
                      <td className="px-3 py-2 border">{renderCell(r.volume_no)}</td>
                      <td className="px-3 py-2 border">{renderCell(r.date_published)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPagePerGroup((p) => ({ ...p, [groupKey]: page - 1 }))}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPagePerGroup((p) => ({ ...p, [groupKey]: idx + 1 }))}
                      className={`px-3 py-1 rounded ${
                        page === idx + 1 ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPagePerGroup((p) => ({ ...p, [groupKey]: page + 1 }))}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans">
      <h2 className="text-3xl font-bold text-center mb-6">Gazette & Registry Matcher</h2>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Gazette PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Registry Excel</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1">Matching Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="exact">Exact</option>
              <option value="tokens">Tokens</option>
              <option value="fuzzy">Fuzzy</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">
              Threshold {mode === "fuzzy" ? `(${threshold.toFixed(2)})` : ""}
            </label>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.01"
              value={threshold}
              disabled={mode !== "fuzzy"}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Start Matching"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 rounded border border-red-600 text-red-600 hover:bg-red-50"
            >
              Clear DB
            </button>
          </div>
        </div>

        {loading && (
          <div className="h-2 bg-gray-200 rounded overflow-hidden">
            <div className="bg-blue-600 h-2 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {stats && (
          <div className="bg-blue-50 p-3 rounded border border-blue-200 space-y-1 text-sm">
            <p>
              <b>Mode:</b> {stats.mode} <b>Threshold:</b> {stats.acceptThreshold}
            </p>
            <p>
              <b>Gazette:</b> {stats.totalGazette} <b>Excel:</b> {stats.totalExcel}
            </p>
            <p>
              <b>Matched:</b> {stats.matchedCount} <b>Inserted:</b> {stats.insertedCount}
            </p>
          </div>
        )}

        {error && <p className="bg-red-100 text-red-700 p-2 rounded">{error}</p>}
      </form>

      {/* Search + Export */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          placeholder="Search matches..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 border rounded px-3 py-2"
        />
        {matches.length > 0 && (
          <button
            onClick={() => exportToCSV(filteredMatches, `matches_${Date.now()}.csv`)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Results Table */}
      {renderTable()}
    </div>
  );
}
