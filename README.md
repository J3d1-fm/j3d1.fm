# J3D1.FM

Personal brand site for `j3d1.fm`: a static Next.js page published through GitHub Pages.

Requires Node.js 24.12+ (below 26).

## Local development

```bash
npm ci
npm run dev
```

## Validation

```bash
npm test
npm run check
```

## Deployment

Every push to `main` runs the GitHub Pages deployment workflow. The custom domain is declared in `public/CNAME`.

The private DZO / GTR section lives at `/dzo-gtr/`. Only its login interface is hosted on Pages; report delivery is protected by the finance reader API. See TECHNICAL_DOCUMENTATION.txt.
