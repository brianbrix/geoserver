import { useState } from "react";
import {
  listWorkspaces,
  createWorkspace,
  deleteWorkspace,
} from "../services/geoserverApi.js";

export default function WorkspaceManager({ credentials, onWorkspaceChange }) {
  const [workspaces, setWorkspaces] = useState(null);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const ws = await listWorkspaces(credentials);
      setWorkspaces(ws);
      if (onWorkspaceChange) onWorkspaceChange(ws);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await createWorkspace(newName.trim(), credentials);
      setSuccess(`Workspace "${newName.trim()}" created.`);
      setNewName("");
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(name) {
    if (!confirm(`Delete workspace "${name}" and all its data?`)) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await deleteWorkspace(name, credentials);
      setSuccess(`Workspace "${name}" deleted.`);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>🗂 Workspaces</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleCreate} style={{ display: "flex", gap: ".5rem", marginBottom: "1rem" }}>
        <input
          className="form-group input"
          style={{ flex: 1, border: "1px solid #cbd5e0", borderRadius: 6, padding: ".45rem .65rem", fontSize: ".9rem" }}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New workspace name"
        />
        <button type="submit" className="btn-primary" disabled={loading || !newName.trim()}>
          + Add
        </button>
        <button type="button" className="btn-primary" onClick={load} disabled={loading}>
          {loading ? <span className="spinner" /> : "↻"} Refresh
        </button>
      </form>

      {workspaces === null ? (
        <p className="empty-msg">Click Refresh to load workspaces.</p>
      ) : workspaces.length === 0 ? (
        <p className="empty-msg">No workspaces found.</p>
      ) : (
        <ul className="item-list">
          {workspaces.map((ws) => (
            <li key={ws.name}>
              <span>
                <span className="name">{ws.name}</span>
                <br />
                <span className="href">{ws.href}</span>
              </span>
              <button
                className="btn-danger btn-sm"
                onClick={() => handleDelete(ws.name)}
                disabled={loading}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
