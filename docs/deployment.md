# Demo Deployment

This repo is intended to use the existing Neon PostgreSQL database for demos. Do not bake `.env` files or secrets into container images.

## Local Container Smoke Test

Build and start all services:

```bash
docker compose up --build
```

Open:

- Website: `http://localhost:3000`
- Investor portal: `http://localhost:3001`
- Startup portal: `http://localhost:3002`
- Admin portal: `http://localhost:3003`

The compose file reads the existing local `.env` files and overrides app-to-app URLs for containers.

## Azure Container Apps Path

Use Azure Container Apps rather than AKS for a teammate showcase. It keeps the container model but avoids Kubernetes node costs and cluster operations.

Recommended order:

1. Create the Container Apps environment.
2. Deploy the three API containers first with external ingress enabled.
3. Note the public API URLs.
4. Build the four Next.js containers with the final public `NEXT_PUBLIC_*` URLs.
5. Deploy the four Next.js containers with external ingress enabled.
6. Update website portal URLs if the portal URLs changed.

The `NEXT_PUBLIC_*` values are compiled into browser bundles during `next build`, so the public demo URLs should be known before the final Next.js image build.

All seven services must share the same `AUTH_SECRET`. The website and all three APIs need `DATABASE_URL`.
