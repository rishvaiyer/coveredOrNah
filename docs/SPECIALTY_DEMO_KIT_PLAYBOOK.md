# Specialty Demo Kit Playbook

Draft-only, PHI-free workflow for standing up a tailored medication-access demo for one specialty and one prospect without mapping every US clinic, insurer, or drug first.

## The loop

1. **Pick the specialty from evidence, not vibes.** Compare candidate specialties on visit volume, prior-authorization burden, public-source availability, and demo-ability. Current research verdict (2026-08-22): dermatology first (broadest documented PA burden: AAD survey found PA even on cheap generics like clobetasol and tretinoin; nearly all derm drugs sit in the pharmacy benefit we already parse). Rheumatology second (highest severity per prescriber but needs a medical-benefit policy layer first). Cardiology last (real pain is narrow: PCSK9, ARNI, SGLT2i).
2. **Seed the catalog.** Copy `data/specialty-demo-template.example.json`, fill 15 to 20 medications with scoring fields (specialty relevance, service-line match, source readiness, therapy friction). See `data/specialty-demo-dermatology-starter-v1.json` as the filled reference.
3. **List plan families** the prospect's region actually touches. Reuse the NJ registry sources already verified in `data/payer-universe.json`. Mark anything not yet verified as `public_needs_review`.
4. **Generate the brief.**

   ```bash
   python3 scripts/generate-specialty-demo-brief.py \
     --input data/specialty-demo-dermatology-starter-v1.json \
     --output output/demo-kits/<slug>-brief.md
   ```

   The tool ranks medications algorithmically, dedupes clinical buckets, caps families at `max_medication_families` (default 10), emits a bounded plan-x-medication research matrix, and refuses PHI-like keys.
5. **Evidence pass (agent loop).** For each cell in the matrix, extract exact rows from the linked official source using the same subagent extraction pattern used for pulmonary plans. Promote only exact ingredient/product matches with page-level evidence into an evidence manifest under `data/`.
6. **Demo posture.** Show the honest three-state UI story: exact source-listed rows with tier/restrictions, `unconfirmed, not a denial` rows, and `plan-match-required` boundaries. The pitch line is "this is a scoped research preview; bring your clinic's real medication and plan list and we map it under a governed process."
7. **Outreach stays human-gated.** Everything generated here is draft-only. No email is sent by tooling. Outreach drafts remain blocked pending verified recipient route, compliant mailbox/DNS, postal address, suppression, opt-out handling, and owner approval, consistent with the existing Kind Workflows outreach boundary.

## Why this shape

- "Who bites first" beats mapping the whole market: each seeded demo costs hours of agent looping, not weeks of national data entry.
- Every displayed row stays traceable through the standard chain (region -> coverage type -> carrier/plan -> formulary -> product -> official source -> restrictions -> evidence state), so a tailored demo never becomes an overclaim.
- The same seed file doubles as the intake contract when a prospect converts: swap synthetic clinic fields for their approved deidentified list and promote the starter cells to source-confirmed evidence.
