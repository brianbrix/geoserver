import { useState } from "react";
import WorkspaceManager from "./components/WorkspaceManager.jsx";
import DataUploader from "./components/DataUploader.jsx";
import LayerList from "./components/LayerList.jsx";

const DEFAULT_CREDS = {
  user: import.meta.env.VITE_GS_USER ?? "admin",
  password: import.meta.env.VITE_GS_PASSWORD ?? "admin",
};

export default function App() {
  const [credentials, setCredentials] = useState(DEFAULT_CREDS);
  const [workspaces, setWorkspaces] = useState([]);
  const [layerRefreshKey, setLayerRefreshKey] = useState(0);

  function handleCredChange(field) {
    return (e) => setCredentials((c) => ({ ...c, [field]: e.target.value }));
  }

  return (
    <>
      {/* ── Header ── */}
      <header className="app-header">
        <span style={{ fontSize: "1.6rem" }}>🌍</span>
        <h1>GeoServer Data Manager</h1>
        <span className="subtitle">Upload &amp; manage spatial data</span>
      </header>

      {/* ── Credentials bar ── */}
      <div className="cred-bar">
        <label>
          GeoServer User
          <input
            type="text"
            value={credentials.user}
            onChange={handleCredChange("user")}
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={credentials.password}
            onChange={handleCredChange("password")}
            autoComplete="current-password"
          />
        </label>
        <div className="alert alert-info" style={{ margin: 0, padding: ".4rem .9rem", fontSize: ".8rem" }}>
          Credentials are used only for local REST API requests and are never stored.
        </div>
      </div>

      {/* ── Main grid ── */}
      <main className="app-body">
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <WorkspaceManager
            credentials={credentials}
            onWorkspaceChange={setWorkspaces}
          />
          <LayerList
            credentials={credentials}
            workspaces={workspaces}
            key={layerRefreshKey}
          />
        </div>

        {/* Right column */}
        <DataUploader
          credentials={credentials}
          workspaces={workspaces}
          onUploadDone={() => setLayerRefreshKey((k) => k + 1)}
        />
      </main>
    </>
  );
}
