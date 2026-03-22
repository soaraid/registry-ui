# Release Checklist

Use this checklist before publishing a new `soaraid/registry-ui` release.

## Product

- Confirm the main flows work:
  - login
  - repository catalog
  - repository detail
  - manifest inspector
  - single tag delete preview
  - bulk cleanup preview and execution
  - settings health check
- Confirm shared-digest delete blocking still works
- Confirm Docker runtime instructions still match the code

## Validation

Run:

```bash
npm run typecheck
npm run build
```

If Docker packaging changed, also run:

```bash
docker build -t soaraid/registry-ui:release .
```

## Documentation

- Update `README.md` if setup changed
- Update `docs/USAGE.md` if operator behavior changed
- Update `PRD.md` if scope changed
- Check branding uses `soaraid/registry-ui`

## Release Metadata

- Confirm `LICENSE` exists and is correct
- Confirm `CONTRIBUTING.md` is current
- Confirm issue template still matches the project
- Confirm image name and tags are correct for Docker Hub

## Publish Prep

- Choose version tag
- Build the image
- Tag the image for Docker Hub
- Push the image
- Write release notes with major changes and any migration notes
