# Formulary Pipeline

The Python pipeline is a local-first evidence layer for onboarding new insurers, states, benefit types, specialties, and medication catalogs without rewriting the Formulary Finder UI.

## Truth model

The pipeline confirms a row only when the source and product identity match exactly. Product identity includes generic or medication name, brand when supplied, strength, dosage form, device, and NDC or RxCUI when available.

Possible states are:

- `confirmed`
- `unconfirmed`
- `source_stale`
- `conflicting`
- `login_required`
- `not_found_in_source`
- `needs_human_review`

No model is allowed to infer coverage from therapeutic similarity, a carrier name, a different strength, a different device, or a missing row in an incomplete source.

## CLI

```bash
python3 -m formulary_pipeline discover --manifest data/formulary-pipeline-manifest.example.json --state NJ
python3 -m formulary_pipeline ingest --input source.json --output ledger.json --source-type json \
  --source-id wellpoint-nj-2026 --insurer Wellpoint --state NJ --benefit-type medicaid \
  --plan-name 'Wellpoint New Jersey FamilyCare PDL' --url https://example.org/source \
  --source-version 2026-08-19
python3 -m formulary_pipeline audit --input ledger.json --output report.json
python3 -m formulary_pipeline match --evidence ledger.json --candidates catalog.json --output matched.json
```

## Adapter policy

- CMS adapters use exact contract, plan, segment, formulary, and product identifiers.
- CSV and JSON adapters preserve source rows and restriction fields.
- PDF ingestion accepts pre-extracted pipe-delimited rows, avoiding unsafe table guesses. A future PDF adapter can use `pdfplumber` only with fixture tests and review output.
- Login-gated, stale, ambiguous, or variant-specific sources remain visibly unresolved.

## Integration path

1. A source adapter emits evidence JSON.
2. The evidence ledger is audited and reviewed.
3. Approved evidence is exported into the existing TypeScript source-data adapters.
4. The UI continues to show source URL, date, exact identity, restrictions, and `unconfirmed, not a denial`.

The current implementation is intentionally a safe foundation. It does not fetch arbitrary websites, send credentials, use PHI, or write to production automatically.
