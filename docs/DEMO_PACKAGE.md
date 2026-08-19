# Formulary Finder Demo Package

**Demo environment:** [formulary-finder-pilot-production.up.railway.app](https://formulary-finder-pilot-production.up.railway.app/)
**Purpose:** Demonstrate a PHI-free, source-backed medication coverage workflow for a New Jersey pulmonary clinic.
**Demo length:** 5 minutes
**Recommended presenter:** Clinical operations lead, practice administrator, or product owner

## Target audience

- Pulmonologists, advanced practice clinicians, nurses, and medical assistants who perform medication coverage checks.
- Prior-authorization and benefits-verification staff who need exact plan and product evidence.
- Practice administrators evaluating a bounded clinic implementation.
- Clinical and IT leaders reviewing workflow safety, source traceability, and implementation scope.

## Client value in one sentence

Formulary Finder moves the first coverage check into one clinical portal, guides staff from the insurance card to the correct plan workflow, and preserves exact source identifiers without collecting patient information.

## Before the demo

- Open the live application in a fresh browser tab.
- Confirm the header shows that the live data service is connected.
- Keep a sample insurance card image or the test identifiers below available. Do not use a real patient's member ID or other protected health information.
- Use the three cases exactly as written so the audience sees a confirmed Medicare result, a standalone Part D workflow, and an explicit product-level public-plan lookup.
- If a source is temporarily unavailable, show the error state and explain that the portal fails closed rather than presenting stale data as confirmed.

## Five-minute demo script

### 0:00 to 0:40 | Frame the problem

Say:

> Coverage work usually begins with an insurance card, but staff must determine whether the card represents commercial coverage, Medicare Advantage, standalone Part D, or Medicaid before using the correct formulary. Formulary Finder keeps that routing and the initial evidence check in one portal. It does not require a member ID, date of birth, or other patient information.

Point out:

- Search begins with insurer and coverage type, not a generic carrier-level assumption.
- Text fields provide suggestions for insurer, plan, formulary, and medication names.
- The portal distinguishes confirmed source evidence from an unconfirmed result.

### 0:40 to 2:00 | Demonstrate exact Medicare Advantage selection

1. Choose **By plan**.
2. Select **Aetna** as the insurer and **Medicare Advantage** as the coverage type.
3. Enter `H3152-098` or the matching Aetna plan name in the Medicare plan search.
4. Select the exact contract, plan, and segment returned by the portal.
5. Search for **Albuterol HFA** and open the medication.
6. Review the exact plan name, formulary ID, RxCUI/NDC candidate rows, tier, and available restriction flags.

Say:

> The result is tied to the selected CMS contract, plan, segment, formulary, and medication products. The clinician still confirms the prescribed device, strength, and NDC before acting.

### 2:00 to 3:05 | Demonstrate standalone Part D

1. Change the coverage type to **Standalone Medicare Part D**.
2. Explain that staff use the separate prescription-drug plan card, not the red-white-blue Medicare card.
3. Search `S4802-078` or **Wellcare Classic**.
4. Select **Wellcare Classic (PDP), S4802-078-000**.
5. Keep **Albuterol HFA** selected and review the returned product candidates and restrictions.

Say:

> Medicare Advantage and standalone Part D are deliberately separated. Original or Railroad Medicare alone does not identify outpatient prescription coverage.

### 3:05 to 4:05 | Demonstrate an exact public-plan connector

Use one of these routes, depending on the audience:

- **UHC NJ Marketplace:** select the 2026 HIOS plan `37777NJ0100002`, search `albuterol`, select RxCUI `435`, and review tier plus PA, ST, and QL flags.
- **Aetna NJ FamilyCare:** search `albuterol`, select the exact product and 11-digit NDC, and review tier plus PA, ST, QL, and OTC flags.

Say:

> These connectors require an exact plan or exact drug product. A carrier name alone is not enough to establish coverage.

### 4:05 to 4:40 | Show the safe failure state

1. Search for a plan or medication combination that has no exact source match.
2. Point to **Unconfirmed, not a denial**.

Say:

> Missing evidence is never displayed as a denial. Staff are directed to verify the exact benefit rather than infer coverage from another plan or an incomplete source.

### 4:40 to 5:00 | Close with the implementation ask

Say:

> The proposed implementation is PHI-free and operationally bounded. We will validate the clinic's most common plans and pulmonary medications, measure lookup speed and agreement with current verification, and use discrepancies to prioritize the next connectors.

Ask for:

- The clinic's top plan families and counties served.
- The 25 to 50 most frequent pulmonary prescriptions, including device and strength.
- Deidentified examples of common and difficult coverage checks.
- A clinical operations owner for weekly review.

## Realistic test cases

### Test case 1: Medicare Advantage rescue inhaler

**Scenario:** A nurse is preparing an albuterol refill for a patient whose card shows Aetna Medicare Advantage.

| Field | Test value |
| --- | --- |
| Coverage type | Medicare Advantage |
| Plan | Aetna `H3152-098-000` |
| Medication | Albuterol HFA |
| Expected workflow | Select the exact CMS plan, then review medication candidate rows |
| Expected evidence | Plan name, formulary ID, source version, RxCUI/NDC candidates, tier and restriction flags when matched |

**Pass condition:** The portal does not show a carrier-wide answer. It requires the exact plan and labels a missing exact product match as unconfirmed.

### Test case 2: Original Medicare with a separate Part D card

**Scenario:** A medical assistant sees Original Medicare plus a separate Wellcare prescription-drug card.

| Field | Test value |
| --- | --- |
| Coverage type | Standalone Medicare Part D |
| Plan | Wellcare Classic `S4802-078-000` |
| Medication | Albuterol HFA |
| Expected workflow | Use the Part D card, select the exact PDP, then review product candidates |
| Expected evidence | Standalone PDP label, contract-plan-segment, formulary ID, source version, RxCUI/NDC candidates and restrictions |

**Pass condition:** The portal keeps this result separate from Medicare Advantage and does not use Original Medicare alone as prescription coverage evidence.

### Test case 3: Aetna NJ FamilyCare product check

**Scenario:** A prior-authorization nurse needs to check a specific albuterol inhaler for an Aetna Better Health of New Jersey FamilyCare member.

| Field | Test value |
| --- | --- |
| Coverage type | Medicaid / public coverage |
| Plan family | Aetna Better Health of New Jersey FamilyCare |
| Medication search | `albuterol` |
| Product requirement | Select the exact product and 11-digit NDC returned by autocomplete |
| Expected evidence | Drug label, exact NDC, tier and PA, ST, QL or OTC flags supplied by the source |

**Pass condition:** The portal clearly limits the result to Aetna NJ FamilyCare and does not apply it to Aetna commercial, Medicare, or Part D plans.

## Supported plan-family scope

### Exact in-portal coverage checks

| Plan family | Current scope | Required identifier |
| --- | --- | --- |
| New Jersey Medicare Advantage | Current CMS-imported NJ plans | Contract, plan, segment and medication product |
| New Jersey standalone Part D | Current CMS PDP region 04 plans | S-contract, plan, segment and medication product |
| UnitedHealthcare NJ Individual and Family Marketplace | 2026 UHC NJ QHP dataset | Exact HIOS plan ID and RxCUI |
| Aetna Better Health of New Jersey FamilyCare | Current public NJ Medicaid formulary | Exact 11-digit NDC |

### Dated reference formularies

The portal includes 13 source-backed baseline references:

- Horizon BCBSNJ Marketplace.
- UnitedHealthcare Commercial PDL baseline.
- Oxford Freedom Network commercial baseline.
- Aetna Medicare HMO baseline.
- AmeriHealth NJ Individual and Family.
- Cigna National Preferred 3-Tier employer baseline.
- Oscar NJ Individual standard formulary.
- Anthem BCBS NY Individual Select 3-Tier.
- Wellcare NJ Medicare H0913-002/021.
- Humana NJ Medicare formulary 26408.
- Braven NJ Medicare H0885.
- HealthSpring NJ Medicare H3949-054/H7849-149.
- Clover NJ Medicare formulary 00026082.

These references help staff identify plan families and inspect dated source evidence. They are not substitutes for an exact member benefit when the employer, product, county, formulary variant, or plan year differs.

### Insurance workflow directory

The accepted-insurance directory provides routing guidance for 33 organizations used by the Summit Health New Jersey workflow. An accepted-insurance entry means network participation or a known routing path. It does not mean every medication is covered or that every subplan has been imported.

## Truthful exclusions

Formulary Finder currently does **not**:

- Determine member eligibility, active enrollment, deductible status, copay, coinsurance, pharmacy price, or payment approval.
- Replace a payer determination, real-time benefit check, electronic prior authorization, pharmacy claim, or clinician judgment.
- Store member IDs, names, dates of birth, diagnoses, claims, or other patient information.
- Guarantee coverage based only on insurer name, network logo, or a general PDL.
- Cover every New Jersey commercial, employer, Medicaid, Marketplace, workers' compensation, VA, TRICARE, or out-of-state plan.
- Treat a missing formulary row, unavailable source, or unmatched RxCUI/NDC as a denial.
- Confirm interchangeability among brands, generics, devices, strengths, dosage forms, or package sizes.
- Establish medical-benefit coverage for infused or clinician-administered medications.
- Submit prescriptions, prior authorizations, exceptions, appeals, or messages to payers.

## Product success metrics

Measure these during the 60-day design-partner proof using deidentified workflow observations:

| Metric | Target | Measurement method |
| --- | ---: | --- |
| Successful in-portal routing | At least 90% of lookups reach the correct plan-family workflow | Compare entered card type with the selected workflow |
| Exact-plan or product selection | At least 95% where the source requires it | Audit contract-plan-segment, HIOS, RxCUI or NDC capture |
| Median first-pass lookup time | 2 minutes or less | Time from insurer selection to interpretable result |
| External-site avoidance | At least 70% of supported-scope lookups completed without starting on another site | Staff workflow observation |
| Evidence agreement | At least 95% agreement across 50 manually verified supported-scope cases | Compare portal evidence with the same dated official source |
| Safety-language compliance | 100% of missing or unavailable matches remain unconfirmed, never denied | Weekly result-state audit |
| Source traceability | 100% of confirmed results retain source and exact identifiers | Weekly record review without patient information |
| Critical false-confirmed results | 0 | Clinical reviewer escalation and root-cause review |
| Staff usability | At least 80% of users rate the workflow 4 out of 5 or better | End-of-implementation survey |

## Product rollout gate

Proceed to a broader clinic rollout only when:

- No critical false-confirmed result remains unresolved.
- The evidence-agreement and safety-language targets are met.
- The clinic's highest-volume plan families have exact connectors or clearly labeled reference-only workflows.
- Source refresh ownership, incident handling, and clinical escalation are documented.
- Staff confirm that the portal reduces, rather than adds to, routine verification work.

If these conditions are not met, keep the product bounded and prioritize the plan families responsible for the highest volume of unconfirmed lookups.
