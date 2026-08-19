# SellFormularyFinder: sales and marketing plan

## Executive position

Sell Formulary Finder as a source-visible medication formulary workflow for New Jersey clinics. The product helps nurses, physicians, pharmacists, and benefits staff move from an insurance card to the correct plan and exact medication product without starting on multiple payer websites.

Pulmonary is the proven entry point. The commercial story should be broader: the same exact-plan and exact-product engine can support other clinic specialties as validated medication data is added.

## Product promise

> Find the right formulary path faster, see the source evidence, and know when the answer is unconfirmed.

### What the buyer gains

- One repeatable workflow for insurer, coverage type, exact plan, and medication product.
- Fewer carrier-level assumptions and fewer wrong-plan lookups.
- Source date, tier, and published restriction details in the same view.
- Clear handling for missing data: **unconfirmed, not a denial**.
- A PHI-free starting point that can be evaluated before sensitive integrations are considered.

### What the product does not promise

- Eligibility, member cost, payment, approval, or guaranteed coverage.
- Prior-authorization submission or appeals.
- EHR integration or member-ID processing.
- Complete coverage for every payer or every plan.

## Best first customers

### Primary buyer

- Practice administrator or clinical operations leader at a New Jersey specialty clinic.

### Champions

- Pulmonologist, nurse, pharmacist, prior-authorization specialist, or benefits-verification lead.

### Economic buyer

- Medical group leadership, revenue-cycle leadership, or an operations executive who owns staff time and prescription access workflows.

### Ideal customer profile

- Five or more clinicians.
- Repeated formulary or prior-authorization questions.
- High mix of Medicare, Medicaid, Marketplace, or multiple commercial plans.
- Staff currently use payer websites, PDFs, phone calls, or spreadsheets.
- Willingness to provide de-identified plan and medication scenarios.

## Initial offer

### Clinic implementation package

- 30-day supervised implementation.
- Five to ten named staff users.
- PHI-free scenarios only.
- Configuration around the clinic’s highest-volume plan families and medication products.
- Weekly review of unconfirmed results, source freshness, and workflow friction.
- End-of-period report with time-to-answer, exact-plan selection, correction rate, and expansion recommendations.

### Launch pricing hypothesis

- **60-day design-partner proof:** $500 total, credited toward an annual subscription.
- **Clinic Core:** $149 per location per month for up to 10 prescribers, unlimited support staff, and 10 supported plan families.
- **Clinic Plus:** $249 per location per month for up to 25 prescribers, unlimited support staff, 20 supported plan families, and two feasible standard source additions per year.
- **Multi-site:** from $599 per month for up to five locations using a shared payer configuration.
- **Unsupported payer-source onboarding:** $250 to $750 one time, only after source feasibility and deliverables are confirmed.
- **Annual option:** 10% discount and a 12-month price lock.

Charge by location rather than staff seat. The clinic provides its insurer and plan-family priority list; Formulary Finder configures the supported workflows and turns missing sources into a transparent backlog. Full pricing evidence and commercial rules are in `docs/MARKET_PRICING_AND_PACKAGING.md`.

## Core messaging

### One-line pitch

Formulary Finder gives NJ clinic teams one clear path from the insurance card to the exact plan and medication product, with source evidence and safe unconfirmed handling.

### Operations message

Reduce repeated payer-site searching and make the correct next step obvious to staff.

### Clinical message

See the exact product, strength, dosage form, tier, and published restrictions before deciding what needs verification.

### Leadership message

Turn scattered formulary work into a measurable workflow with source freshness, correction tracking, and a prioritized expansion roadmap.

## Sales motion

### Step 1: warm introduction

Target New Jersey pulmonary practices, independent specialty groups, medical-group operations leaders, and pharmacy or benefits teams. Lead with workflow friction and a live demonstration, not a generic software pitch.

### Step 2: five-minute demonstration

Show this sequence:

1. Start with **By plan**.
2. Choose insurer and coverage type.
3. Select the exact plan or formulary detail.
4. Search the exact medication product with autocomplete.
5. Review source date, tier, restrictions, or **unconfirmed, not a denial**.

Use one Medicare example and one public NJ payer connector. Do not use real patient information.

### Step 3: workflow discovery

Ask:

- Which plan families generate the most staff work?
- Which medications create the most delays or callbacks?
- Which steps still require another website or phone call?
- Which staff role owns the final verification?
- What would make the workflow safe enough for routine use?

### Step 4: quantified implementation

Request ten to twenty de-identified plan and medication scenarios. Measure the current workflow, run the same scenarios in Formulary Finder, and report the differences.

### Step 5: annual conversion

Convert to an annual subscription when the clinic has a named source-refresh owner, clear escalation process, acceptable correction rate, and agreement on security and contracting work.

## Marketing channels

### Highest-value channels

- Direct outreach to NJ specialty-clinic administrators.
- Introductions through physicians, pharmacists, and practice-management contacts.
- Short product demonstrations for clinical operations groups.
- A polished user guide and pitch deck shared after a qualified conversation.
- Case-study content based only on measured, de-identified workflow results.

### Content to publish

- “Why the carrier name is not enough” explainer.
- Exact-plan versus carrier-level lookup checklist.
- Five-minute clinician workflow video using synthetic data.
- Source and refresh transparency page.
- Specialty expansion notes showing how the same workflow extends beyond pulmonary.

Avoid broad claims such as “all plans covered” or “instant prior authorization.”

## 30-day go-to-market sequence

### Days 1 to 7: package

- Finalize product name and customer-facing language.
- Prepare the pitch deck, user guide, one-page product brief, and demo script.
- Create a target list of 25 New Jersey clinics and medical groups.
- Prepare three synthetic demo scenarios.

### Days 8 to 14: outreach

- Contact five qualified operations leaders per business day.
- Ask for a 20-minute workflow conversation.
- Track contact, role, current process, plan mix, medication volume, and next step.

### Days 15 to 21: demonstrations

- Run live demos for qualified prospects.
- Capture objections and repeated questions.
- Offer a scoped implementation with no PHI and no payer submission.

### Days 22 to 30: close and measure

- Select the first implementation customer.
- Gather de-identified scenarios.
- Establish source-refresh ownership and weekly review.
- Produce the first measured workflow report.

## KPI dashboard

Track these weekly:

- Qualified clinic conversations.
- Demonstrations completed.
- De-identified scenarios received.
- Exact-plan selection rate.
- Percentage of supported lookups completed in-portal.
- Median time from insurer selection to interpretable result.
- Correction rate after manual review.
- Unconfirmed-result rate by payer and medication family.
- Source freshness exceptions.
- Proposals sent, implementations started, and annual conversions.

Do not claim savings or clinical outcomes until they are measured against the clinic’s current process.

## Objection handling

### “Why not just use the payer website?”

Payer sites remain authoritative for final verification. Formulary Finder reduces the routing work first by helping staff identify the exact plan and product and by preserving the source evidence.

### “Can it tell me whether the patient is covered?”

It can show source-listed formulary evidence when the exact source is available. It does not determine eligibility, cost, payment, or guaranteed coverage.

### “What if our plan is missing?”

The portal shows **unconfirmed, not a denial** and records the missing plan family for prioritization. The next connector is chosen from actual clinic volume.

### “Is it ready for sensitive patient data?”

The current product is intentionally PHI-free. Patient-specific workflows require a separate security review, access controls, audit logging, contracting, and HIPAA/BAA assessment.

## Expansion strategy

1. Expand the medication catalog with verified primary-care products.
2. Reuse full machine-readable payer feeds for additional therapeutic areas.
3. Add the clinic’s highest-volume plan families before low-demand insurers.
4. Add additional specialties only when the exact product, source date, and restriction fields are validated.
5. Keep partial or reference-only sources visibly labeled.

## Immediate next actions

- Use the saved pitch deck for the first buyer conversation.
- Use the clinician guide for staff-facing onboarding.
- Build a 25-account NJ clinic target list.
- Run three workflow discovery calls before changing the product roadmap.
- Do not deploy new commercial positioning to Railway until the owner approves the branch.
