# Formulary Finder: Claude Code Implementation Handoff

## Goal

Finish a fast, PHI-free formulary dashboard for Summit Health NJ pulmonary teams.

- Staff search a medication and select the patient’s insurer plus exact plan/formulary.
- The app shows plan-specific tier, PA, quantity limit, step therapy, source date, official source, and source-listed alternatives.
- Do not store patient names, member IDs, claims, pricing, or prescriptions.
- Do not call a carrier-level result exact coverage. Exactness requires plan/formulary plus product/device/strength matching.

## Current state

- Live: https://formulary-finder-pilot-production.up.railway.app/
- Repo: https://github.com/rishvaiyer/coveredOrNah
- Stack: React/Vite client, Express server, Railway Postgres.
- 85 searchable pulmonary/common-clinic products and 13 source-backed plan-family baselines.
- Exact Medicare plans are already imported from CMS and selectable, but the selected Medicare plan does **not yet** change the coverage detail.
- Commercial finder cards exist for Horizon, UHC/Oxford, Aetna, Cigna, AmeriHealth, and Oscar. They give the staff member the exact plan/formulary selection route and official lookup link.

## Primary files

| Purpose | File |
| --- | --- |
| React dashboard, catalog, plan cards, static coverage, alternatives, UI | `src/components/generated/PulmonaryFormularyDashboard.tsx` |
| API routes | `server.ts` |
| PostgreSQL connection | `db.ts` |
| Medicare schema | `sql/001_medicare_formulary.sql` |
| CMS import pipeline | `scripts/import-cms-medicare.ts` |
| Medication gap tracker | `MEDICATION_CATALOG.md` and `MISSING_PULMONARY_MEDICINES.txt` |
| Existing project docs | `README.md` |

## Canonical user flows

### 1. Medication-first flow

1. Type generic, brand, drug class, or condition in medication search.
2. Choose the autocomplete suggestion or medication row.
3. App scrolls the selected medication detail into view.
4. Choose a sourced plan baseline or exact plan.
5. Read status: Plan preferred/Tier, PA, QL, ST, specialty/limited distribution, source date.
6. If restricted or not listed, show source-listed alternatives in the same therapeutic area.
7. Open/download the official PA form or payer PA route.

### 2. Medicare flow

1. Staff hears “I have Medicare.”
2. UI explains that Original Medicare requires the separate Part D card, while Medicare Advantage requires carrier + plan name/ID.
3. Search carrier, plan name, or contract-plan ID in the Medicare picker.
4. Select exactly one plan.
5. Medication detail must fetch `GET /api/medicare/coverage` for that plan and render results instead of using any insurer-family baseline.
6. Include plan name, contract-plan-segment, formulary ID, CMS source version/date, product/NDC/RxCUI notes, tier, PA, QL, ST.
7. If product matching is ambiguous, show `Unconfirmed - not a denial` and direct the user to the official plan lookup.

### 3. Commercial flow

1. Staff selects commercial carrier.
2. UI asks for the drug-list/formulary or pharmacy-benefit name from the card/SBC, never the member ID.
3. Select a public plan-family baseline only if the card matches its scope.
4. Otherwise open the carrier’s official public or authenticated exact-plan lookup.
5. Show `Public plan-family source` versus `Member-confirmed required` as the exactness label.

### 4. Horizon BCBSNJ Direct Access POS flow

1. Never reuse Horizon Marketplace results for Direct Access POS.
2. Ask for the card’s pharmacy-benefit/drug-list name.
3. Route to MyPrime for exact plan lookup.
4. Horizon Classic is a separately sourced commercial baseline, not a safe answer for every Direct Access card.
5. For Arnuity Ellipta, do not display a tier until the exact card pharmacy formulary has been mapped.

## Current insurer routing rules

| Carrier | What staff needs | MVP route | Exactness |
| --- | --- | --- | --- |
| Horizon BCBSNJ | Pharmacy benefit/drug-list name | MyPrime | Member/plan confirmation required |
| UHC/Oxford | PDL variant: Access, Traditional, Advantage, etc. | UHC/Oxford drug list hub | Public PDL baseline; confirm benefit |
| Aetna | Pharmacy plan and year | Aetna medication finder | Public plan lookup; authenticated site confirms benefit |
| Cigna | Drug-list family: Standard, Value, Performance, Advantage | Cigna drug-list hub | Public family baseline; myCigna confirms benefit |
| AmeriHealth NJ | Value, Select, or Individual & Family | AmeriHealth formulary | Public plan family; group benefits can differ |
| Oscar NJ | Product/HIOS/plan name | Oscar/Get Covered NJ drug list | Public plan documents; member account confirms cost/benefit |
| Medicare | Carrier + exact plan ID | CMS-imported exact plan picker | Exact CMS formulary, subject to product mapping |

## Implementation priorities

### P0: Connect exact Medicare selection to coverage detail

1. In `PulmonaryFormularyDashboard.tsx`, watch `selectedMedicarePlan` and `activeSelected`.
2. Call `/api/medicare/coverage` with contract ID, plan ID, segment ID, and the selected product’s RxNorm/RxCUI mapping.
3. Add loading, no-match, and ambiguous-product states.
4. Render exact CMS result in the detail panel, above static plan-family cards.
5. Do not treat an ingredient-only match as exact when device/strength/form differs.

### P0: Add a medication-product mapping layer

1. Add a data file or Postgres table for each medication product: canonical name, brand aliases, RxCUI, NDCs, form/device, strength, route, therapeutic area.
2. Keep separate records for inhaler vs nebulizer, DPI vs HFA, solution vs DPI, and brand vs generic when coverage differs.
3. Use RxNorm to resolve alternate names, then query CMS NDC/RxCUI rows.
4. Preserve all matching products in the API response so clinicians can see why a result varies.

### P1: Commercial plan-family variants

1. Add a plan-family selector beneath each commercial carrier.
2. Store `{carrier, plan_family, year, formulary_type, source_url, source_date, exactness}`.
3. Start with UHC/Oxford Access/Traditional/Advantage, AmeriHealth Value/Select/I&F, Cigna Standard/Value/Performance/Advantage, and Horizon Classic/Marketplace.
4. Ingest only official public PDFs/search responses; never scrape authenticated payer portals.
5. Every row requires source date and a direct source link.

### P1: Finish pulmonary product catalog

Use `MEDICATION_CATALOG.md` as the source of truth. Remaining highest-value products:

- Glycopyrrolate inhaler.
- PAH: Opsumit, Opsynvi, Orenitram, inhaled treprostinil DPI as a distinct product.
- CF/bronchiectasis: Kalydeco, Orkambi, Symdeko, Alyftrek, hypertonic saline, acetylcysteine inhalation, Arikayce.
- Review-only scope before adding: indacaterol, Duaklir, flunisolide, infusion/inpatient PAH therapies, ILD immunosuppression, NTM IV regimens, sleep medicines.

### P2: Alternatives and PA

1. Alternatives must share a defined therapeutic subclass, not merely a broad pulmonary category.
2. An alternative only appears when the selected exact plan/source lists it.
3. Show its actual tier and flags.
4. PA action order:
   - drug-specific official PDF/criteria when available;
   - payer general pharmacy PA route otherwise;
   - no auto-submission and no AI-written clinical assertions.

## Data model target

```text
plans
  insurer, plan_name, contract_id, plan_id, segment_id, county/region,
  formulary_id, source_url, source_version, effective_date, exactness

medication_products
  canonical_name, generic_name, brand_aliases, RxCUI, NDC, strength,
  dose_form, device, route, therapeutic_area, subclass

plan_coverage
  plan/formulary_id, medication_product_id, tier, PA, QL, ST, specialty,
  limited_distribution, source_row, source_date

pa_routes
  insurer/plan_family, medication_product_id optional, type (PDF/portal/criteria),
  URL, source_date
```

## API target

```text
GET /api/medications?q=<term>&plan=<baseline>
GET /api/medicare/plans?q=<carrier-or-plan>&state=NJ
GET /api/medicare/coverage?contractId=&planId=&segmentId=&productId=
GET /api/plans?carrier=&planFamily=&state=
GET /api/coverage?planId=&productId=
```

Return structured `exactness` values:

- `exact_cms_plan`
- `public_plan_family`
- `member_confirmation_required`
- `unconfirmed_not_a_denial`

## Test requirements

1. Search Arnuity and select Oxford Freedom: show its current public PDL baseline only.
2. Search Arnuity and Horizon Direct Access POS: do not show Marketplace Tier 2; route to MyPrime/card formulary match.
3. Select two different Medicare plans for the same product: prove different tier/PA/QL results.
4. Verify all alternatives are in the same therapeutic subclass and covered by the selected plan/source.
5. Build: `npm run build`.
6. Check API health: `curl -fsS https://formulary-finder-pilot-production.up.railway.app/api/health`.
7. Deploy only after build passes; verify Railway deployment success and live health response.

## Constraints

- No PHI, eligibility, price quotes, prescription submission, or insurer calls.
- Do not say an unconfirmed combination is not covered.
- Preserve existing dashboard capabilities and sources.
- Use `apply_patch` for source edits.
- Use official sources only and include source dates.
- Keep UI plain-language and compact for nurses and doctors.

## Prompt to paste into Claude Code

```text
Read CLAUDE_CODE_HANDOFF.md first. Work in this repository only. Start with P0: connect selected exact Medicare plan to medication coverage through a product-level RxNorm/RxCUI/NDC mapping layer. Preserve the existing static source-backed plan baselines. Do not collect patient data and do not claim coverage from a carrier name alone. Use official source metadata, label uncertain matches “Unconfirmed - not a denial,” run npm run build, and report exact files changed plus live verification.
```
