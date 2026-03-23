# Docker Hub Overview

`soaraid/registry-ui` is a modern Docker Registry UI for operators who want an easier way to browse, inspect, and maintain images in a custom Docker Registry.

Docker Hub:

- https://hub.docker.com/repository/docker/soaraid/registry-ui/general

What it provides:

- searchable repository catalog from `/v2/_catalog`
- tag detail page with manifest inspection
- pull command copy action
- safer delete flow with confirmation and impact preview
- shared-digest delete blocking for plain Docker Registry setups
- safe bulk cleanup for singleton-digest tags
- server-side proxy for registry auth and CORS bypass
- optional single-user login for protecting the UI itself
- adjustable brand name, product name, and hosted logo URL

Container usage model:

- this image runs only the UI
- it does not start `registry:2`
- point it at an existing registry with `REGISTRY_URL`

Main runtime env vars:

```env
REGISTRY_URL=http://registry:5000
REGISTRY_USERNAME=
REGISTRY_PASSWORD=
REGISTRY_BEARER_TOKEN=
APP_AUTH_USERNAME=
APP_AUTH_PASSWORD=
APP_SESSION_SECRET=
APP_BRAND_NAME=Soara
APP_PRODUCT_NAME=Registry UI
APP_LOGO_URL=https://cdn.example.com/brand/registry-ui-logo.png
```

Published-image example:

```yaml
services:
  registry-ui:
    image: soaraid/registry-ui:latest
    restart: unless-stopped
    ports:
      - "8001:3000"
    environment:
      REGISTRY_URL: http://registry:5000
      APP_AUTH_USERNAME: operator
      APP_AUTH_PASSWORD: change-me
      APP_SESSION_SECRET: replace-with-a-long-random-secret
      APP_BRAND_NAME: Soara
      APP_PRODUCT_NAME: Registry UI
      APP_LOGO_URL: https://cdn.example.com/brand/registry-ui-logo.png
```

If you want a simpler full self-hosted registry setup with the UI already included, use the companion project `soaraid/soara-hub`.
