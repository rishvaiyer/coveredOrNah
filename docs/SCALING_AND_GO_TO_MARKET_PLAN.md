# Formulary Finder: Scaling and Go-to-Market Plan

## Executive decision

The fastest defensible path is a paid New Jersey pulmonary pilot, followed by adjacent specialty packs and one neighboring market. Formulary Finder should be sold as a source-visible medication-access evidence layer, not as an eligibility, cost, coverage-adjudication, or prior-authorization submission product.

## Why this wedge

- The 2026 New Jersey Marketplace has five carriers: Ambetter from WellCare, AmeriHealth, Horizon BCBSNJ, Oscar, and UnitedHealthcare.
- The current product already has a PHI-free NJ workflow, 85 medication catalog entries, 17 plan-family baselines, source links, restriction flags, prior-authorization routes, and explicit unconfirmed states.
- The AMA's 2025 survey reports approximately 40 prior-authorization requests per physician per week, about 13 hours of physician/staff time weekly, and nearly one-third of physicians reporting requests are often or always denied.
- CMS is requiring more standardized payer interoperability and prior-authorization APIs, creating a long-term data and integration tailwind.

Sources: [NJ Get Covered](https://www.nj.gov/getcoverednj/findanswers/updates/), [AMA prior-authorization survey summary](https://www.ama-assn.org/about/leadership/latest-prior-auth-survey-shows-promised-reform-remains-elusive), [CMS interoperability and prior authorization rule](https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-and-prior-authorization-final-rule).

## Fastest product scale: next 30-60 days

1. Get Summit's top 10-20 plans by lookup volume and mark them as the official product backlog.
2. Expand from 85 to approximately 150 high-volume pulmonary products, modeling NDC, strength, device, route, benefit, tier, PA, step therapy, quantity limits, and specialty distribution separately.
3. Make every payer source refreshable through one connector template: source URL, effective date, cadence, parser, mapping audit, absence rule, and live smoke test.
4. Add PHI-free product telemetry: lookup completion, time-to-answer, unconfirmed rate, correction rate, and most-requested missing plan/product combinations.
5. Publish a monthly source-refresh report and a confidence dashboard.

Do not close a gap by inference. If a source does not contain the exact product, strength, device, or benefit row, keep it unconfirmed.

## Fastest specialty expansion

1. Allergy/immunology: highest overlap with the existing pulmonary catalog and payer workflows.
2. Rheumatology and dermatology: biologics, specialty pharmacy, PA, and step-therapy-heavy workflows.
3. Endocrinology and primary care: high-volume maintenance medications and broad clinic demand.
4. Only then add a second state, prioritizing a market where the same NJ payer families recur.

Package each expansion as a specialty pack, not as an unlimited national drug promise.

## Fastest sales motion

### Ideal first customer

- Independent specialty group with 5-20 prescribers.
- Practice administrator or COO as economic buyer.
- Nurse, authorization specialist, or practice manager as daily champion.
- One-week onboarding with no EHR integration required.

### Paid proof and launch offer

- 60-day, PHI-free design-partner proof for $500, credited toward annual conversion.
- Clinic Core at $149 per location per month or Clinic Plus at $249 per location per month.
- No per-seat fees for nurses, medical assistants, or authorization staff.
- The clinic provides its insurer and plan-family priority list; already-supported workflows are configured first and missing sources receive a documented feasibility review.
- Deliver the clinic's top plan/product pack, staff training, source-refresh owner, false-match log, and a before/after time-to-answer report.
- Keep custom licensing, integrations, and high-maintenance sources outside the base subscription.

### Sales channels

- Summit reference and warm introductions to NJ pulmonary and allergy groups.
- NJ specialty societies and practice-management networks.
- Billing/RCM consultants and EHR implementation partners.
- Short monthly product demonstrations and one-page case studies.

Avoid paid advertising until two or three pilots show repeatable conversion and measurable time savings.

## Competitive positioning

- CoverMyMeds is the incumbent ePA workflow and supports broad payer/medication submission workflows with extensive EHR connectivity. [Provider platform](https://marketingbuilder.covermymeds.com/solutions/provider/)
- Surescripts provides formulary, real-time prescription benefit, alternatives, and electronic PA infrastructure. [Real-time prescription benefit](https://surescripts.com/products/real-time-prescription-benefit)
- DrFirst and licensed data vendors such as Medi-Span occupy adjacent prescribing and drug-data infrastructure.

Do not compete head-on with these platforms on ePA submission. Win on fast, inspectable, plan-specific evidence for smaller specialty clinics before prescribing.

## 30/60/90-day execution

### Days 0-30

- Confirm Summit's top plans and products from real lookup counts.
- Add missing high-volume product rows and automated source-drift checks.
- Recruit two paid design partners.
- Instrument PHI-free time-to-answer and unconfirmed feedback.

### Days 31-60

- Publish a case study with measured workflow improvement.
- Standardize the payer connector SDK and source manifest.
- Launch the allergy/immunology pack.
- Run 5-10 targeted clinic demonstrations.

### Days 61-90

- Convert pilots to annual contracts.
- Add one neighboring state or specialty only if refresh ownership and exact-match QA are working.
- Pursue one EHR, RCM, or specialty-network referral partnership.
- Decide whether licensed F&B/RTPB data is justified by pilot demand.

## Go/no-go gates

Do not claim “any insurer” or “any state” until the sold pack has:

- A named source owner and refresh SLA.
- Effective-date and source-drift monitoring.
- Exact product/strength/device QA above 90% for the sold plan pack.
- Legal review of source rights and any licensed data requirement.
- Measured pilot evidence showing improved staff workflow.

## Immediate next action

Ask Summit for a de-identified export of plan names and lookup volume, or have staff record the top 20 plan/product combinations for two weeks. That list becomes the highest-value connector backlog and the foundation for the first paid pilot.
