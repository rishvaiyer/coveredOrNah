# Covered or Nah?

Fast, source-linked formulary lookup for nurses and clinicians. The first pilot focuses on pulmonary and common primary-care medications across:

- New York Medicaid NYRx
- UnitedHealthcare New Jersey FamilyCare
- Pennsylvania Medical Assistance statewide PDL

## Important boundary

This tool summarizes public formulary documents. It does not collect patient information, check member eligibility, guarantee payment, or replace the plan's official formulary and prior-authorization criteria.

## How the pilot data works

- Coverage is curated from official, dated formulary documents into static application data.
- Each result retains its plan, status, restrictions, source URL, and source effective date.
- Railway serves the React dashboard and read-only API from one service. There is no patient data.
- "Not listed" means absent from this PDL snapshot, not necessarily excluded from the benefit.
- Product, device, strength, dosage form, and brand or generic status must be verified in the linked source.

## Scale-up path

1. Add major Medicare Part D and regional commercial plan formularies by exact plan.
2. Normalize products to RxNorm RxCUI and NDC identifiers.
3. Store source-versioned records in Postgres with raw source text and review status.
4. Run scheduled importers for CMS machine-readable files and payer documents.
5. Keep a clinician review queue for parser changes and ambiguous rows.

## Local development

```bash
npm install
npm run build
npm start
```

Open `http://localhost:3000`.

## API

- `GET /api/health`
- `GET /api/plans`
- `GET /api/metadata`
- `GET /api/medications?q=trelegy&plan=nyrx`
- `GET /api/alternatives?medication=Levalbuterol&plan=nyrx`

## Verification

```bash
npm test
```

The interface was authored in MagicPath as component `solid-wave-3897`.
