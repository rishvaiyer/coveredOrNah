# Public Formulary Data CLI

Read-only CLI for official public medication and ACA Marketplace coverage data. It prints JSON to stdout so import jobs and Codex can consume it safely.

## Sources and boundaries

- RxNorm API from the U.S. National Library of Medicine normalizes medication names and exposes RxCUI/product identifiers. It does not determine insurance coverage.
- CMS Marketplace API searches ACA Marketplace drug records and checks RxCUIs against Marketplace plan IDs. It does not cover Medicare, Medicaid, employer plans, member eligibility, or patient cost.
- CMS QHP machine-readable `drugs.json` files associate drugs with Marketplace plan IDs, tiers, utilization-management restrictions, and plan years. The CLI validates and normalizes these issuer-hosted files without writing to the application database.
- The existing `scripts/import-cms-medicare.ts` remains the separate bulk-file path for Medicare data.
- A returned coverage value is source evidence, not a guarantee of payment. Official plan documents and payer determinations control.

Run `npm run formulary-data -- sources` for the machine-readable source registry.

## Setup

RxNorm does not require credentials. CMS Marketplace commands require a rate-limited API key:

```bash
export CMS_MARKETPLACE_API_KEY="your-key"
```

Request a key from the [official CMS Marketplace API key form](https://developer.cms.gov/marketplace-api/key-request.html).

Do not put the key in source code, `.env` files committed to Git, command arguments, or output files. The CLI redacts credentials from reported request URLs.

## Commands

```bash
npm run formulary-data -- --help
npm run formulary-data -- doctor
npm run formulary-data -- sources
npm run formulary-data -- demo verify

npm run formulary-data -- rxnorm normalize --name "albuterol sulfate HFA"
npm run formulary-data -- rxnorm normalize --name "Spiriva Respimat" --mode exact-or-normalized
npm run formulary-data -- rxnorm product --rxcui 1649961 --include-ndcs

npm run formulary-data -- marketplace years
npm run formulary-data -- marketplace drugs autocomplete --query albu --year 2026
npm run formulary-data -- marketplace drugs search --query "albuterol sulfate" --year 2026
npm run formulary-data -- marketplace plan --plan-id 12345NJ1234567 --year 2026
npm run formulary-data -- marketplace coverage \
  --rxcui 1649961 \
  --plan-id 12345NJ1234567 \
  --year 2026

npm run formulary-data -- qhp formulary normalize \
  --input ./issuer-drugs.json

npm run formulary-data -- qhp formulary normalize \
  --input https://issuer.example/path/drugs.json \
  --max-bytes 104857600
```

`--rxcui` and `--plan-id` accept comma-separated values or can be repeated.

### QHP formulary normalization

The QHP command accepts a local file path, `file:` URL, or public HTTPS URL. It:

- Requires numeric `rxnorm_id`, non-empty `drug_name`, `HIOS-PLAN-ID`, a 14-character Marketplace `plan_id`, and a valid drug tier.
- Validates `prior_authorization`, `step_therapy`, and `quantity_limit` as JSON booleans.
- Validates current-schema `years` as a non-empty array of four-digit plan years.
- Normalizes safe formatting differences such as identifier casing and spaces in tier names.
- Emits missing optional restrictions as `null`, never as `false`.
- Emits candidate rows, rejected-row counts, gap counts, and bounded issue details as JSON.
- Omits duplicate normalized candidates.
- Performs no database or application writes.

For safety, remote input must use HTTPS and a public hostname. Redirects are validated, URL query parameters are omitted from reported source metadata, and input size defaults to 100 MiB with a configurable 500 MiB ceiling.

The implementation follows the official [CMS QHP provider and formulary schema](https://github.com/CMSgov/QHP-provider-formulary-APIs) and the [CMS 2025 Machine-Readable Data Issuer Guide](https://www.qhpcertification.cms.gov/s/PY25MRIssuerGuide08.05.24_final.pdf). CMS says issuer data is updated over time, so candidate output still requires freshness and source review before clinical display.

## Reliable workflow

1. Normalize the entered medication with RxNorm.
2. Select the exact strength, dose form, and device. Do not automatically choose the first result when multiple concepts match.
3. Confirm the ACA Marketplace plan ID and market year.
4. Query Marketplace coverage with the selected RxCUI and plan ID.
5. Keep the source, retrieval date, and exact identifiers with any imported result.
6. Show an explicit unavailable or unconfirmed state when no authoritative result is returned.

## Verification

```bash
npm run formulary-data:typecheck
npm run formulary-data:test
npm run formulary-data -- doctor
```

The deterministic tests use injected transports and do not consume API quota. `doctor` performs a harmless live RxNorm version check. It only calls CMS Marketplace when `CMS_MARKETPLACE_API_KEY` is configured.

### Offline demo verification

`demo verify` reads only the bundled `fixtures/qhp-valid.json` file. It performs no network or database operations and emits stable JSON containing:

- The fixed fixture source date and SHA-256 content hash.
- Input drug, plan-association, and normalized candidate counts.
- Complete, incomplete, rejected, issue, error, warning, and gap counts.
- A `passed` result only when the fixture yields at least one complete candidate with no issues, gaps, or rejected associations.

This proves the normalization pipeline for bounded demo data. It does not establish that a live issuer source is current or clinically complete.
