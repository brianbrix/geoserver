/**
 * GeoServer REST API helpers.
 *
 * All requests are sent to /geoserver/rest/ which nginx (or the dev-server
 * proxy) forwards to the GeoServer container.
 */

const BASE = "/geoserver/rest";

/**
 * Build a Basic-Auth Authorization header value.
 * @param {string} user
 * @param {string} password
 */
function basicAuth(user, password) {
  return "Basic " + btoa(`${user}:${password}`);
}

/**
 * Low-level fetch wrapper that attaches auth and JSON headers.
 */
async function request(path, options = {}, credentials) {
  const { user, password } = credentials;
  const headers = {
    Authorization: basicAuth(user, password),
    ...options.headers,
  };

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`GeoServer ${response.status}: ${text || response.statusText}`);
  }

  return response;
}

// ─── Workspaces ───────────────────────────────────────────────────────────────

export async function listWorkspaces(credentials) {
  const res = await request("/workspaces.json", {}, credentials);
  const data = await res.json();
  return data?.workspaces?.workspace ?? [];
}

export async function createWorkspace(name, credentials) {
  await request("/workspaces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspace: { name } }),
  }, credentials);
}

export async function deleteWorkspace(name, credentials) {
  await request(`/workspaces/${name}?recurse=true`, {
    method: "DELETE",
  }, credentials);
}

// ─── Layers ───────────────────────────────────────────────────────────────────

export async function listLayers(workspace, credentials) {
  const res = await request(`/workspaces/${workspace}/layers.json`, {}, credentials);
  const data = await res.json();
  return data?.layers?.layer ?? [];
}

// ─── Data Store upload (Shapefile ZIP) ────────────────────────────────────────

/**
 * Upload a shapefile ZIP and publish it as a layer.
 * @param {string} workspace  - target workspace
 * @param {string} storeName  - name for the new datastore
 * @param {File}   file       - the ZIP file containing the shapefile
 * @param {object} credentials
 */
export async function uploadShapefile(workspace, storeName, file, credentials) {
  await request(
    `/workspaces/${workspace}/datastores/${storeName}/file.shp`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/zip" },
      body: file,
    },
    credentials,
  );
}

// ─── Coverage Store upload (GeoTIFF) ─────────────────────────────────────────

/**
 * Upload a GeoTIFF file and publish it as a coverage layer.
 * @param {string} workspace
 * @param {string} storeName
 * @param {File}   file
 * @param {object} credentials
 */
export async function uploadGeoTiff(workspace, storeName, file, credentials) {
  await request(
    `/workspaces/${workspace}/coveragestores/${storeName}/file.geotiff`,
    {
      method: "PUT",
      headers: { "Content-Type": "image/tiff" },
      body: file,
    },
    credentials,
  );
}

// ─── CSV upload via WFS-T (simple approach) ──────────────────────────────────

/**
 * Upload a CSV as a GeoServer-managed property store layer.
 * GeoServer supports "file.csv" through the REST API when the
 * property store extension is available.
 * @param {string} workspace
 * @param {string} storeName
 * @param {File}   file
 * @param {object} credentials
 */
export async function uploadCSV(workspace, storeName, file, credentials) {
  await request(
    `/workspaces/${workspace}/datastores/${storeName}/file.csv`,
    {
      method: "PUT",
      headers: { "Content-Type": "text/csv" },
      body: file,
    },
    credentials,
  );
}

// ─── GeoPackage upload ────────────────────────────────────────────────────────

/**
 * Upload a GeoPackage (.gpkg) file and publish its first vector layer.
 * @param {string} workspace
 * @param {string} storeName
 * @param {File}   file
 * @param {object} credentials
 */
export async function uploadGeoPackage(workspace, storeName, file, credentials) {
  await request(
    `/workspaces/${workspace}/datastores/${storeName}/file.gpkg`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/geopackage+sqlite3" },
      body: file,
    },
    credentials,
  );
}
