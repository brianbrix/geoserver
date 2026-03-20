# GeoServer Data Manager

A Dockerised stack that runs **GeoServer** behind a **Traefik** reverse-proxy (with automatic HTTPS via Let's Encrypt) together with a lightweight **React** front-end for uploading and managing spatial data sources.

```
 ┌──────────────────────────────────────────────────────┐
 │  Traefik  :80  → redirect to HTTPS                   │
 │  Traefik  :443 (TLS – Let's Encrypt)                 │
 │    ├─ /geoserver  ──► GeoServer :8080                │
 │    └─ /           ──► Frontend  :80                  │
 └──────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Prerequisites

- Docker ≥ 24 and Docker Compose v2
- A public domain with an **A record pointing to your server** (required for Let's Encrypt)
- Ports **80** and **443** open on the server firewall

### 2. Configure

Copy and edit the environment file:

```bash
cp .env.example .env
# then edit .env with your domain, email and passwords
```

Key variables (set in `.env` at the project root):

| Variable | Default | Description |
|---|---|---|
| `DOMAIN` | `amp-gis.dgstg.org` | Public domain for the deployment |
| `ACME_EMAIL` | `admin@amp-gis.dgstg.org` | Email for Let's Encrypt notifications |
| `GEOSERVER_ADMIN_USER` | `admin` | GeoServer admin username |
| `GEOSERVER_ADMIN_PASSWORD` | `changeme` | GeoServer admin password – **change this** |
| `GEOSERVER_PROXY_BASE_URL` | `https://amp-gis.dgstg.org/geoserver` | Public URL of GeoServer |
| `GEOSERVER_CSRF_WHITELIST` | `amp-gis.dgstg.org` | Allowed CSRF origins |
| `PROXY_BASE_URL` | `https://amp-gis.dgstg.org` | Top-level public base URL |

### 3. Start the stack

```bash
docker compose up -d --build
```

| Service | URL |
|---|---|
| React front-end | <https://amp-gis.dgstg.org/> |
| GeoServer web UI | <https://amp-gis.dgstg.org/geoserver/web> |
| Traefik dashboard | `http://<server-ip>:8080/` (restrict in production) |

> **First boot:** Traefik will automatically request a TLS certificate from Let's Encrypt  
> using the HTTP-01 challenge over port 80. This takes a few seconds.  
> The certificate is stored in the `letsencrypt` Docker volume and auto-renewed.

> **HTTP → HTTPS redirect:** Any request to `http://amp-gis.dgstg.org` is permanently  
> redirected to `https://amp-gis.dgstg.org` by Traefik.

### 4. Using the front-end

1. Enter your GeoServer credentials in the **credentials bar** at the top (defaults: `admin` / `changeme`).
2. **Workspaces** panel – create or delete workspaces.
3. **Upload Data Source** panel – upload spatial data directly into a workspace:
   - **Shapefile** – upload a `.zip` containing `.shp`, `.dbf`, `.shx`, and (optionally) `.prj` files.
   - **GeoTIFF** – upload a `.tif` / `.tiff` raster file.
   - **CSV** – upload a comma-separated file (requires the GeoServer CSV store extension).
   - **GeoPackage** – upload a `.gpkg` vector/raster package.
4. **Published Layers** panel – browse layers in any workspace and open a quick WMS preview.

---

## Production Checklist

- [ ] Domain DNS A record points to the server IP
- [ ] Ports 80 and 443 are open in the firewall
- [ ] `GEOSERVER_ADMIN_PASSWORD` is set to a strong password in `.env`
- [ ] Port 8080 (Traefik dashboard) is **firewalled** or restricted to trusted IPs

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
├── .env.example            # Copy to .env and configure for your domain
├── docker-compose.yml      # Traefik + GeoServer + React frontend (HTTPS)
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