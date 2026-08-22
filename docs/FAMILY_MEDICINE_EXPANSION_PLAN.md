# Family Medicine Expansion Plan

As of 2026-08-19, Family Medicine is the right default primary-care expansion path for Formulary Finder, but it is substantially broader than the current pulmonary catalog.

## How big is Family Medicine?

- Family physicians provide first-contact, continuous, comprehensive care across ages, genders, conditions, and communities. [AAFP family medicine overview](https://www.aafp.org/about/family-medicine)
- The 2024 NRMP Match offered 5,231 family-medicine positions and filled 4,595, across nearly 800 programs. [AAFP Match Day 2024](https://www.aafp.org/about/news/2024-match-day)
- CDC reports roughly 1.0 billion US physician-office visits in the 2019 NAMCS summary, with 50.3% involving primary-care physicians. This is primary-care volume, not a family-medicine-only count. [CDC FastStats](https://www.cdc.gov/nchs/fastats/physician-visits.htm)
- New Jersey reported 37 primary-care HPSA designations covering 163,027 residents, with 69.24% of estimated need met and 19 practitioners needed to meet the full need. [NJ HNJAC slides](https://www.nj.gov/health/healthynj/2030/documents/hnjac/HNJAC_Meeting_Slides_2025-09-25.pdf)
- New Jersey's 2026 health-landscape reporting says primary-care spending is below the national average and utilization was declining in the period studied. [NJDOH health landscape report](https://www.nj.gov/health/news/2026/approved/20260109c.shtml)

The product implication is simple: family medicine is not one more specialty catalog. It is a cross-lifespan operating layer that needs sub-practice and medication-cluster expansion.

## Sub-practice graph

```text
Family Medicine
├── Preventive and wellness
├── Chronic cardiometabolic
├── Pediatrics and adolescent care
├── Women's health, contraception, prenatal and postpartum
├── Mental and behavioral health
├── Respiratory and allergy
├── GI and endocrine
├── Musculoskeletal and dermatology
├── Geriatrics and polypharmacy
├── Substance-use care
└── In-office procedures and medical benefit
```

The spreadsheet's `Subpractice Graph` and `Graph Data` tabs turn this into an editable operating map with P0, P1, and P2 priorities.

## What the product must add

### Data model

Beyond medication name, the family-medicine workflow needs:

- age band and minimum age
- pregnancy relevance and indication context
- device type and route
- normalized strength and concentration
- dosage form and package size
- NDC and RxCUI identifiers
- pharmacy, medical, or both benefit type
- PA, QL, ST, specialty, limited-distribution, and controlled-substance flags
- source URL, source version, effective date, and freshness state

### Source stack

Every new row should pass through four evidence layers:

1. Clinical scope or guideline source.
2. Official payer formulary or PDL.
3. Official utilization-management or benefit-policy source.
4. FDA or standardized medication reference for exact product normalization.

Vaccines and in-office injectables require a separate medical-benefit layer. A pharmacy PDL alone is not enough.

## Current gaps

- The app has a 20-medication Family Medicine starter catalog, but it is explicitly labeled `starter`, not source-confirmed coverage.
- The current formulary audit is pulmonary-focused: 85 medications across 17 NJ plan-family baselines, with 1,144 confirmed and 301 unconfirmed cells.
- NJ Medicaid has five participating managed-care plans: Aetna Better Health, Fidelis Care, Horizon NJ Health, UnitedHealthcare Community Plan, and Wellpoint. [NJ DMAHS](https://www.nj.gov/humanservices/dmahs/providers-stakeholders/provider-resources/medicaid/)
- Public NJ payer categories are manageable for a first release: Medicaid MCOs, Marketplace/QHP, commercial employer PDLs, Medicare Advantage, and standalone Part D.
- Hard gaps remain in medical-benefit products, vaccine schedules, authenticated portals, employer-specific formulary variants, controlled-substance policy, pediatric liquid normalization, contraceptive brand/pack rules, and insulin/GLP-1 device and indication matching.

### Public payer source map, NJ-first

The fastest safe branch is NJ Medicaid, then Marketplace, then Medicare at exact plan level:

- Medicaid: [NJ FamilyCare roster](https://njfamilycare.dhs.state.nj.us/choos.aspx), [NJ DMAHS managed-care resources](https://www.nj.gov/humanservices/dmahs/providers-stakeholders/provider-resources/medicaid/), [Horizon NJ Health](https://www.horizonnjhealth.com/covered_drugs), [Aetna Better Health NJ](https://www.aetnabetterhealth.com/newjersey/drug-formulary.html), [Wellpoint NJ](https://www.wellpoint.com/nj/medicaid/pharmacy), and [UHC NJ FamilyCare](https://www.uhc.com/communityplan/new-jersey/plans/medicaid/familycare).
- Marketplace: [Horizon individual and family drug lists](https://www.horizonblue.com/members/plans/horizon-pharmacy/prescription-drug-lists), [AmeriHealth value formulary](https://www.amerihealth.com/resources/for-providers/policies-and-guidelines/value-formulary.html), and [Ambetter NJ pharmacy resources](https://www.ambetterhealth.com/en/nj/provider-resources/pharmacy/).
- Medicare: [Medicare Plan Finder](https://www.medicare.gov/plan-compare/) and [NJ SHIP comparison resources](https://www.nj.gov/humanservices/doas/services/q-z/ship/). Medicare results must remain plan-specific, never carrier-wide.

The first high-variance benchmark set is semaglutide and tirzepatide products, SGLT2 agents, CGM supplies, insulin variants, ADHD stimulants, testosterone, migraine CGRP agents, newer dermatology products, inhaler devices, constipation products, branded GERD products, and brand-specific contraception. These are research priorities, not blanket denials.

## Roadmap to broad public coverage

### Phase 0: starter catalog

Already complete. Family Medicine API exposes 20 PHI-free medication records and a clear `starter` status.

### Phase 1: top-20 NJ plan mapping

Target: exact product rows for the starter catalog across the 17 existing NJ plan-family baselines.

Required deliverables:

- exact-plan and exact-formulary identity
- source manifest entry
- normalized product rows
- restriction mapping
- source evidence ledger
- deterministic regression tests
- live smoke test

Expected effort: 1 to 2 weeks for a focused top-20 slice, assuming public sources and no credential-gated work.

### Phase 2: 100 to 150 medication keys

Add pediatric, women's health, diabetes, behavioral health, GI, dermatology, and geriatric clusters. Expected effort: 3 to 6 weeks with parallel source research and adapter work.

### Phase 3: public NJ payer completeness

Map every publicly reachable NJ payer source across Medicaid, Marketplace, commercial, Medicare Advantage, and Part D. Every row must end in a truthful state: confirmed, stale, blocked, conflicting, not found in source, or needs human review.

Expected effort: 4 to 8 weeks for a first public-source pass, followed by recurring refresh work. Authenticated portals and incomplete payer PDFs are not a one-time engineering problem.

### Phase 4: clinic operations

Add clinic intake, source-refresh ownership, exception queues, audit exports, and user roles. No PHI is required for this phase.

Expected effort: 2 to 4 weeks.

### Phase 5: multi-specialty platform

Promote the catalog contract and payer adapter contract into an SDK-like internal platform. A new specialty should then require:

- catalog module
- source manifest rows
- adapter or existing adapter reuse
- normalization fixtures
- exact-product tests
- live smoke test
- clinical and product acceptance review

Expected effort: 4 to 8 weeks for production hardening, security review, monitoring, and role controls.

## Definition of done

“Coverage for every insurer and every medicine” is not a single finish line. It is a maintained evidence program. The defensible definition is:

- every in-scope public payer/source is represented
- every medication row has exact identity fields or an explicit unresolved state
- source date and URL are visible
- missing rows are never shown as denials
- stale, blocked, conflicting, and login-required states are first-class
- refresh cadence and ownership are documented
- the clinic can export the evidence trail without PHI

## Coverage governance from the reconciliation pass

A Family Medicine cell may be labeled `confirmed` only when all of the following are present:

- exact payer and plan or formulary identity, including CMS contract, plan, and segment for Medicare
- exact medication identity, strength, route, formulation, device or package, and NDC or RxCUI where available
- pharmacy versus medical benefit type
- current official source URL, version, and effective or observed date
- cited source row or search result with normalized tier and PA, ST, QL, age, and benefit constraints
- no contradictory source row

Use first-class unresolved states: `source_stale`, `conflicting`, `login_required`, `not_found_in_source`, and `needs_human_review`. A missing row is never a denial.

The current 20-record Family Medicine API is a useful starter catalog, but its compact schema does not by itself support confirmed coverage. The next implementation gate is a 20-product fixture set with exact identity and source fields, followed by adapter fixtures and a freshness test. The current source manifest also needs its `asOf` date reconciled with the latest evidence run before additional promotion.

The reconciled sequence is:

1. P0: product fixtures and data-contract guard, 1 to 2 weeks.
2. P1: NJ Medicaid public-source adapters, Wellpoint first, then Horizon, Aetna, UHC, and the currently applicable state-roster plans, 1 to 3 weeks after P0.
3. P2: Marketplace exact plan-family variants, 2 to 4 weeks.
4. P3: Medicare exact plan-level mapping, never carrier-wide inference, 2 to 6 weeks.
5. P4: medical-benefit products, vaccines, clinic queues, ownership, and refresh operations, 2 to 4 weeks.

This is a maintained evidence program, not a claim that every insurer and medicine can be completed once and remain current forever.

## Working artifacts

- [Family Medicine Expansion Map spreadsheet](https://docs.google.com/spreadsheets/d/1M1eiJZiz4IGES5rANZJeR4rf0lDhOWVJTSWPXx0dOKI/edit?usp=drivesdk)
- [Family Medicine catalog API](https://formulary-finder-pilot-production.up.railway.app/api/catalogs/family-medicine/medications)
- [Clinic catalog implementation guide](./CLINIC_CATALOGS.md)
