import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  scanGazette,
  resetScanState,
  fetchGazettes,
  fetchGazetteDetails,
} from "../../store/slices/gazetteScannerSlice";
import { CircularProgress, Button } from "@mui/material";
import {
  IoCloudUpload,
  IoScan,
  IoAlertCircle,
  IoTabletLandscape,
  IoChevronDown,
  IoChevronUp,
  IoSearch,
  IoFilter,
} from "react-icons/io5";

const pageSize = 20;

const GazetteScannerDashboard = () => {
  const dispatch = useDispatch();

  const {
    scanLoading,
    scanError,
    gazettes,
    fetchLoading,
    fetchError,
    gazetteDetails,
    detailsLoadingId,
  } = useSelector((state) => state.gazetteScanner);

  const [file, setFile] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [expandedGazetteId, setExpandedGazetteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStation, setFilterStation] = useState("");
  const [currentPage, setCurrentPage] = useState({});

  // Fetch gazettes on mount
  useEffect(() => {
    dispatch(fetchGazettes());
  }, [dispatch]);

  // File selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    dispatch(resetScanState());
  };

  // Trigger scan
  const handleScan = (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF file to scan.");
    dispatch(scanGazette(file)).then(() => {
      dispatch(fetchGazettes());
      setFile(null);
    });
  };

  // Expand gazette to view all cases
  const handleViewAll = (gazetteId) => {
    const alreadyExpanded = expandedGazetteId === gazetteId;
    setExpandedGazetteId(alreadyExpanded ? null : gazetteId);
    setCurrentPage((prev) => ({ ...prev, [gazetteId]: 1 }));

    const gazette = gazettes.find((g) => g._id === gazetteId);
    if (!alreadyExpanded && !gazette?.fullCases) {
      dispatch(fetchGazetteDetails(gazetteId));
    }
  };

  // Filter + Pagination
  const filterCases = (cases) => {
    const nameTerm = searchTerm.toLowerCase().trim();
    const stationTerm = filterStation.toLowerCase().trim();
    if (!nameTerm && !stationTerm) return cases;
    return cases.filter(
      (c) =>
        (!nameTerm || c.nameOfDeceased?.toLowerCase().includes(nameTerm)) &&
        (!stationTerm ||
          (typeof c.courtStation === "string"
            ? c.courtStation.toLowerCase().includes(stationTerm)
            : c.courtStation?.name?.toLowerCase().includes(stationTerm)))
    );
  };

  const paginateCases = (cases, page) => {
    const start = (page - 1) * pageSize;
    return cases.slice(start, start + pageSize);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 rounded-xl shadow-2xl space-y-8">
      {/* Header */}
      <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4 flex items-center">
        <IoScan className="text-blue-600 mr-3" /> Gazette Scanner Dashboard
      </h1>

      {/* File Upload */}
      <form onSubmit={handleScan} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-white border border-gray-200 rounded-lg shadow-inner">
          <label className="flex-grow flex items-center justify-center sm:justify-start space-x-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-150 border border-dashed border-gray-400">
            <IoCloudUpload className="w-5 h-5 text-blue-500" />
            <span className="truncate">
              {file ? file.name : "Choose a Gazette PDF to upload..."}
            </span>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={scanLoading || !file}
            className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold transition duration-300 flex items-center justify-center space-x-2 
          ${
            scanLoading || !file
              ? "bg-blue-300 text-white cursor-not-allowed"
              : "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg"
          }`}
          >
            {scanLoading ? (
              <>
                <CircularProgress size={20} color="inherit" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <IoScan className="w-5 h-5" />
                <span>Scan Gazette</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Feedback */}
      {scanError && (
        <div className="p-3 text-red-700 bg-red-100 border border-red-300 rounded-lg flex items-center space-x-2">
          <IoAlertCircle className="w-5 h-5" />
          <p className="font-medium">{scanError}</p>
        </div>
      )}

      {/* Toggle Table */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={() => setShowTable((prev) => !prev)}
          className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition duration-150 flex items-center space-x-2 shadow-md"
        >
          <IoTabletLandscape className="w-5 h-5" />
          <span>
            {showTable ? "Hide Scanned Gazettes" : "View Scanned Gazettes"}
          </span>
        </button>
      </div>

      {/* Scanned Gazettes */}
      {showTable && (
        <div className="mt-6 space-y-6">
          {fetchLoading && gazettes.length === 0 ? (
            <div className="flex justify-center py-12">
              <CircularProgress className="text-blue-600" />
            </div>
          ) : fetchError ? (
            <p className="text-red-600 font-medium text-center mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              {fetchError}
            </p>
          ) : gazettes.length === 0 ? (
            <p className="text-gray-500 text-center mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              No scanned gazettes found.
            </p>
          ) : (
            gazettes.map((gazette) => {
              const isExpanded = expandedGazetteId === gazette._id;
              const loadingDetails = detailsLoadingId === gazette._id;
              const rawCases = isExpanded
                ? gazette.fullCases || gazetteDetails?.cases || []
                : gazette.casePreview || [];

              const filteredCases = filterCases(rawCases);
              const page = currentPage[gazette._id] || 1;
              const paginatedCases = paginateCases(filteredCases, page);
              const totalPages = Math.ceil(filteredCases.length / pageSize);

              return (
                <div
                  key={gazette._id}
                  className="bg-white shadow-xl rounded-xl p-6 border border-gray-100 transition duration-300 hover:shadow-2xl"
                >
                  {/* Gazette Header */}
                  <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {gazette.volumeNo}
                      </h2>
                      <p className="text-blue-600 font-mono text-xs mt-1">
                        {gazette.fileName}
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        <span className="font-semibold text-gray-700">
                          {gazette.publishedCount}
                        </span>{" "}
                        of {gazette.totalRecords} records published
                      </p>
                    </div>

                    <button
                      onClick={() => handleViewAll(gazette._id)}
                      className={`mt-4 sm:mt-0 px-6 py-2 rounded-full font-semibold transition duration-300 flex items-center justify-center space-x-2
                    ${
                      isExpanded
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } ${loadingDetails ? "opacity-70 cursor-not-allowed" : ""}`}
                      disabled={loadingDetails}
                    >
                      {loadingDetails ? (
                        <>
                          <CircularProgress size={20} color="inherit" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {isExpanded ? "Hide Cases" : "View All Cases"}
                          </span>
                          {isExpanded ? (
                            <IoChevronUp className="w-4 h-4" />
                          ) : (
                            <IoChevronDown className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Filter Bar */}
                  {isExpanded && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <div className="flex items-center flex-1 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2">
                        <IoSearch className="text-gray-500 mr-2" />
                        <input
                          type="text"
                          placeholder="Search by Deceased Name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-transparent outline-none w-full text-gray-700"
                        />
                      </div>
                      <div className="flex items-center flex-1 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2">
                        <IoFilter className="text-gray-500 mr-2" />
                        <input
                          type="text"
                          placeholder="Filter by Court Station..."
                          value={filterStation}
                          onChange={(e) => setFilterStation(e.target.value)}
                          className="bg-transparent outline-none w-full text-gray-700"
                        />
                      </div>
                    </div>
                  )}

                  {/* Cases Table */}
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-gray-700 uppercase tracking-wider">
                          <th className="p-3 text-left font-semibold">
                            Volume No
                          </th>
                          <th className="p-3 text-left font-semibold">
                            Cause No
                          </th>
                          <th className="p-3 text-left font-semibold">
                            Deceased Name
                          </th>
                          <th className="p-3 text-left font-semibold">
                            Date Published
                          </th>
                          <th className="p-3 text-left font-semibold">
                            Court Station
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedCases.length === 0 && !loadingDetails ? (
                          <tr>
                            <td
                              colSpan="5"
                              className="text-center p-4 text-gray-500 italic"
                            >
                              No matching cases found.
                            </td>
                          </tr>
                        ) : (
                          paginatedCases.map((c, i) => (
                            <tr
                              key={i}
                              className="hover:bg-blue-50 transition duration-100"
                            >
                              <td className="p-3 font-medium text-gray-700">
                                {gazette.volumeNo}
                              </td>
                              <td className="p-3">{c.causeNo || "—"}</td>
                              <td className="p-3 font-medium capitalize text-gray-800">
                                {c.nameOfDeceased || "—"}
                              </td>
                              <td className="p-3">
                                {c.datePublished
                                  ? new Date(
                                      c.datePublished
                                    ).toLocaleDateString()
                                  : "—"}
                              </td>
                              <td className="p-3">
                                {c.courtStation?.name ||
                                  c.courtStation ||
                                  "Unknown"}
                              </td>
                            </tr>
                          ))
                        )}
                        {loadingDetails && (
                          <tr>
                            <td
                              colSpan="5"
                              className="text-center p-4 text-blue-500 italic"
                            >
                              <div className="flex justify-center items-center space-x-2">
                                <CircularProgress
                                  size={16}
                                  className="text-blue-500"
                                />
                                <span>Loading all cases...</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {isExpanded && filteredCases.length > pageSize && (
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={page === 1}
                        onClick={() =>
                          setCurrentPage((prev) => ({
                            ...prev,
                            [gazette._id]: page - 1,
                          }))
                        }
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-2">
                        {page} / {totalPages}
                      </span>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={page === totalPages}
                        onClick={() =>
                          setCurrentPage((prev) => ({
                            ...prev,
                            [gazette._id]: page + 1,
                          }))
                        }
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default GazetteScannerDashboard;
