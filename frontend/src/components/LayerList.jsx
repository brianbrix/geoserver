import { useState } from "react";
import { listLayers } from "../services/geoserverApi.js";

export default function LayerList({ credentials, workspaces }) {
  const [selectedWs, setSelectedWs] = useState("");
  const [layers, setLayers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!selectedWs) return;
    setLoading(true);
    setError("");
    setLayers(null);
    try {
      const ls = await listLayers(selectedWs, credentials);
      setLayers(ls);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>🗺 Published Layers</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: "flex", gap: ".5rem", marginBottom: "1rem" }}>
        <select
          style={{ flex: 1, border: "1px solid #cbd5e0", borderRadius: 6, padding: ".45rem .65rem", fontSize: ".9rem", background: "#f7fafc" }}
          value={selectedWs}
          onChange={(e) => { setSelectedWs(e.target.value); setLayers(null); }}
        >
          <option value="">— select workspace —</option>
          {(workspaces ?? []).map((ws) => (
            <option key={ws.name} value={ws.name}>{ws.name}</option>
          ))}
        </select>
        <button className="btn-primary" onClick={load} disabled={loading || !selectedWs}>
          {loading ? <span className="spinner" /> : "↻"} Load
        </button>
      </div>

      {layers === null ? (
        <p className="empty-msg">Select a workspace and click Load.</p>
      ) : layers.length === 0 ? (
        <p className="empty-msg">No layers in workspace &quot;{selectedWs}&quot;.</p>
      ) : (
        <ul className="item-list">
          {layers.map((l) => (
            <li key={l.name}>
              <span>
                <span className="name">{l.name}</span>
                <br />
                <a
                  className="href"
                  href={`/geoserver/${selectedWs}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${selectedWs}:${l.name}&bbox=-180,-90,180,90&width=256&height=256&srs=EPSG:4326&styles=&format=image/png`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview (WMS)
                </a>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
