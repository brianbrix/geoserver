import { useRef, useState } from "react";
import {
  uploadShapefile,
  uploadGeoTiff,
  uploadCSV,
  uploadGeoPackage,
} from "../services/geoserverApi.js";

const FORMAT_OPTIONS = [
  { value: "shapefile", label: "Shapefile (.zip or .shp)", accept: ".zip,.shp,application/zip" },
  { value: "geotiff",   label: "GeoTIFF (.tif/.tiff)", accept: ".tif,.tiff,image/tiff" },
  { value: "csv",       label: "CSV (.csv)", accept: ".csv,text/csv" },
  { value: "gpkg",      label: "GeoPackage (.gpkg)", accept: ".gpkg" },
];

export default function DataUploader({ credentials, workspaces, onUploadDone }) {
  const [workspace, setWorkspace] = useState("");
  const [storeName, setStoreName] = useState("");
  const [format, setFormat] = useState("shapefile");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const currentFormat = FORMAT_OPTIONS.find((f) => f.value === format);

  function handleFileChange(e) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !storeName) setStoreName(f.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_]/g, "_"));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    setFile(f);
    if (f && !storeName) setStoreName(f.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_]/g, "_"));
  }

  const isBareShp = format === "shapefile" && file && file.name.toLowerCase().endsWith(".shp");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!workspace || !storeName || !file) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      switch (format) {
        case "shapefile":
          await uploadShapefile(workspace, storeName, file, credentials);
          break;
        case "geotiff":
          await uploadGeoTiff(workspace, storeName, file, credentials);
          break;
        case "csv":
          await uploadCSV(workspace, storeName, file, credentials);
          break;
        case "gpkg":
          await uploadGeoPackage(workspace, storeName, file, credentials);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      setSuccess(`✅ "${storeName}" uploaded to workspace "${workspace}" as a ${currentFormat.label} layer.`);
      setFile(null);
      setStoreName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onUploadDone) onUploadDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>⬆ Upload Data Source</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {isBareShp && (
        <div className="alert alert-error">
          ⚠️ A bare <strong>.shp</strong> file is missing its required companion files
          (<code>.dbf</code>, <code>.shx</code>). Please ZIP all shapefile components
          together and upload the <strong>.zip</strong> archive instead.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Workspace */}
        <div className="form-group">
          <label>Workspace *</label>
          <select value={workspace} onChange={(e) => setWorkspace(e.target.value)} required>
            <option value="">— select workspace —</option>
            {(workspaces ?? []).map((ws) => (
              <option key={ws.name} value={ws.name}>{ws.name}</option>
            ))}
          </select>
        </div>

        {/* Store name */}
        <div className="form-group">
          <label>Store / Layer Name *</label>
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="e.g. my_shapefile"
            required
          />
        </div>

        {/* Format */}
        <div className="form-group">
          <label>Data Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            {FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Drop-zone / File input */}
        <div
          className={`drop-zone${dragging ? " drag-over" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={currentFormat.accept}
            onChange={handleFileChange}
          />
          {file ? (
            <>
              <div>📄 {file.name}</div>
              <div className="file-selected">{(file.size / 1024).toFixed(1)} KB — click or drag to replace</div>
            </>
          ) : (
            <>
              <div>Drag &amp; drop a file here</div>
              <div style={{ fontSize: ".8rem", marginTop: ".25rem", opacity: .75 }}>
                or click to browse &mdash; {currentFormat.label}
              </div>
            </>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: "1rem", width: "100%" }}
          disabled={loading || !workspace || !storeName || !file || isBareShp}
        >
          {loading ? <><span className="spinner" /> Uploading…</> : "Upload to GeoServer"}
        </button>
      </form>
    </div>
  );
}
