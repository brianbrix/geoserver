# GeoServer Data Manager

A Dockerised stack that runs **GeoServer** behind a **Traefik** reverse-proxy together with a lightweight **React** front-end for uploading and managing spatial data sources.

```
 ┌────────────────────────────────────┐
 │  Traefik  :80  (reverse proxy)     │
 │  ├─ /geoserver  ──► GeoServer :8080│
 │  └─ /           ──► Frontend  :80  │
 └────────────────────────────────────┘
```

---

## Quick Start

### 1. Prerequisites

- Docker ≥ 24 and Docker Compose v2
- (Optional) a custom domain – defaults work with `localhost`

### 2. Configure

Copy and edit the environment file:

```bash
cp frontend/.env.example frontend/.env.local
```

Key variables in `docker-compose.yml` (override via a `.env` file at the project root):

| Variable | Default | Description |
|---|---|---|
| `GEOSERVER_ADMIN_USER` | `admin` | GeoServer admin username |
| `GEOSERVER_ADMIN_PASSWORD` | `admin` | GeoServer admin password |
| `GEOSERVER_PROXY_BASE_URL` | `http://localhost/geoserver` | Public URL of GeoServer |
| `GEOSERVER_CSRF_WHITELIST` | `localhost` | Allowed CSRF origins |
| `TRAEFIK_PROTO` | `http` | Set to `https` when Traefik terminates TLS |

### 3. Start the stack

```bash
docker compose up -d --build
```

| Service | URL |
|---|---|
| React front-end | <http://localhost/> |
| GeoServer web UI | <http://localhost/geoserver/web> |
| Traefik dashboard | <http://localhost:8080/> |

### 4. Using the front-end

1. Enter your GeoServer credentials in the **credentials bar** at the top (defaults: `admin` / `admin`).
2. **Workspaces** panel – create or delete workspaces.
3. **Upload Data Source** panel – upload spatial data directly into a workspace:
   - **Shapefile** – upload a `.zip` containing `.shp`, `.dbf`, `.shx`, and (optionally) `.prj` files.
   - **GeoTIFF** – upload a `.tif` / `.tiff` raster file.
   - **CSV** – upload a comma-separated file (requires the GeoServer CSV store extension).
   - **GeoPackage** – upload a `.gpkg` vector/raster package.
4. **Published Layers** panel – browse layers in any workspace and open a quick WMS preview.

---

## Development

Run the React app locally against a running GeoServer:

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Vite automatically proxies `/geoserver` requests to `http://localhost:8080` by default.  
Override the target with the `VITE_GS_TARGET` env variable if GeoServer is running elsewhere:

```bash
VITE_GS_TARGET=http://my-geoserver:8080 npm run dev
```

---

## Project Layout

```
.
├── docker-compose.yml      # Traefik + GeoServer + React frontend
└── frontend/               # React application (Vite)
    ├── Dockerfile           # Multi-stage build → nginx image
    ├── nginx.conf           # nginx SPA config
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        │   ├── WorkspaceManager.jsx
        │   ├── DataUploader.jsx
        │   └── LayerList.jsx
        └── services/
            └── geoserverApi.js   # GeoServer REST API helpers
```