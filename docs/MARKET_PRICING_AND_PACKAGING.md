# Formulary Finder: Market Pricing and Commercial Packaging

## Decision

Launch with a low-risk paid proof, then price by clinic location rather than by staff seat.

- **60-day design-partner proof:** $500 total, credited toward an annual subscription.
- **Clinic Core:** $149 per location per month.
- **Clinic Plus:** $249 per location per month.
- **Multi-site:** from $599 per month for up to five locations using a shared configuration.
- **New unsupported payer-source onboarding:** $250-$750 one time, only after source feasibility and deliverables are confirmed.
- **Annual option:** 10% discount and a 12-month price lock.

These are launch prices to validate with the first five New Jersey clinic buyers. They are not evidence of a final willingness-to-pay ceiling.

## Why this price will survive buyer scrutiny

Formulary Finder is not priced as an EHR, e-prescribing system, national licensed formulary database, or prior-authorization submission network. It is priced as a maintained clinic workflow that organizes exact-plan and exact-product evidence from the sources a clinic actually uses.

The clinic is paying for:

- Configuration around its insurer and plan-family list.
- Reusable insurer-specific routing rather than a generic carrier directory.
- Source dates, published tier and restriction details, and direct prior-authorization form or official route access.
- Medication and plan autocomplete that keeps the workflow inside the portal where possible.
- Explicit unresolved handling: **unconfirmed, not a denial**.
- Ongoing source review, corrections, onboarding, and a prioritized missing-source backlog.

The clinic is not paying for the underlying public PDF or payer website.

## Current market anchors

| Product or category | Public price | Relevant capability | Pricing implication |
| --- | ---: | --- | --- |
| CoverMyMeds | $0 for providers and pharmacists | Electronic prior authorization | We cannot sell PA access alone. |
| Surescripts PA Portal | $0 for prescribers using the portal | Electronic PA connection to PBMs | A standalone PA submission claim is not a paid differentiator. |
| DrFirst iPrescribe | $30 per prescriber/month for Mobile; $50 for Practice, billed annually | E-prescribing, real-time benefits; Practice adds PA automation | A focused clinic workflow must stay below the cost of a multi-seat prescribing product unless it proves additional operational value. |
| MDToolbox | $28-$35 per prescriber/month on annual plans | Formulary, pricing, ePA and e-prescribing | Five seats cost roughly $140-$175 monthly. |
| Practice Fusion ePrescribe | $59 per provider/month | E-prescribing, real-time benefit and ePA | Five seats cost $295 monthly and include prescribing. |
| RXNT ePrescribing | $665 per prescriber/year, plus $85/year for EPCS authentication | Full e-prescribing workflow | Establishes an approximate $55 per-provider monthly anchor before EPCS. |
| Prioriq Clinic | $490 monthly or $420 monthly billed annually | Up to 50 PAs, one payer network, one EHR integration | Automation and integration support a higher clinic price than research/navigation alone. |
| Surescripts, MMIT, FDB and Medi-Span | No public unit pricing | Enterprise network, formulary and drug-data infrastructure | These are enterprise/custom-contract reference points, not honest small-clinic price comparisons. |

Primary sources:

- [CoverMyMeds provider pricing statement](https://www.covermymeds.com/main/support/general/is-covermymeds-free-to-use/)
- [Surescripts Electronic Prior Authorization](https://surescripts.com/products/electronic-prior-authorization)
- [DrFirst iPrescribe pricing](https://www.iprescribe.com/pricing)
- [MDToolbox pricing](https://mdtoolbox.com/pricing.aspx)
- [Practice Fusion ePrescribe offer](https://info.practicefusion.com/eprescribing-solution-for-quanum-clients)
- [RXNT pricing](https://www.rxnt.com/pricing/)
- [Prioriq pricing](https://www.prioriqo.com/pricing)
- [MMIT API and licensing terms](https://api.mmitnetwork.com/Home/TermsOfService)

## Recommended packages

### 60-day design-partner proof — $500 total

- One New Jersey clinic location.
- Up to 10 prescribers and unlimited support staff.
- Clinic-provided insurer and plan-family priority list.
- PHI-free, de-identified workflow scenarios.
- Configuration of already-supported plan families.
- Two onboarding sessions.
- Weekly missing-source and correction review.
- End-of-proof report covering lookup completion, time-to-answer, unconfirmed results and next-source priorities.
- Entire fee credited toward the first annual subscription.

Do not move a design partner to recurring billing until its highest-volume supported plans are configured and the clinic confirms the workflow is useful.

### Clinic Core — $149 per location/month

- Up to 10 prescribers and unlimited support staff.
- Up to 10 supported plan families selected from the current catalog.
- Pulmonary medication library and exact-product autocomplete.
- Source-visible results and official PA-form or PA-route access where available.
- Monthly source review.
- Standard email correction queue.

### Clinic Plus — $249 per location/month

- Up to 25 prescribers and unlimited support staff.
- Up to 20 supported plan families.
- Two standard payer-source additions per year when a usable public or licensed source exists.
- Monthly source and usage summary.
- Priority correction queue.
- Quarterly workflow review.

### Multi-site — from $599 per month

- Up to five locations using the same payer configuration.
- Centralized plan priorities and source-update summary.
- Additional state, specialty, integration and security work scoped separately.

## Pricing rules

- Do not charge nurses, medical assistants or authorization staff per seat.
- Do not charge separately for an insurer or plan family that is already included in the purchased pack.
- Do not promise an unsupported plan addition until its source, rights, refresh cadence and exactness are assessed.
- Do not bury unlimited manual scraping inside a $149 subscription.
- Keep monthly purchasing available during the first year; offer 10% off annual prepayment.
- Do not use an automatic renewal longer than one year during the design-partner stage.

## Unit economics guardrail

At $149 per month and a 75% gross-margin target, direct recurring service cost must remain below approximately $37 per clinic per month.

That requires:

- Building each payer connector once and reusing it across clinics.
- Automated source-date and drift checks.
- A bounded correction queue rather than ad hoc consulting.
- Separate pricing for genuinely custom sources, licensing and integrations.

If a clinic requires recurring manual work that exceeds this envelope, move it to Clinic Plus or quote a custom source-maintenance addendum.

## ROI test

CMS estimates prior-authorization work costs practices $20-$50 per hour and consumes about 13 hours per week per provider. Formulary Finder should not claim it eliminates that burden, but it can test whether faster plan and product research saves a small part of it.

At a conservative $30 hourly staff cost:

- Clinic Core breaks even after about 5 hours saved per month.
- Clinic Plus breaks even after about 8.3 hours saved per month.
- For 20 business days, those thresholds are approximately 15 and 25 minutes saved per day.

Source: [CMS Electronic Prior Authorization overview](https://www.cms.gov/priorities/electronic-prior-authorization/overview).

Do not publish time-saved, denial-reduction, revenue or clinical-outcome claims until a clinic measures them.

## Sales positioning

### Primary message

> Give us the insurers and plan families your clinic actually sees. We configure and maintain that medication-access workflow for your whole care team, without per-staff fees or an enterprise implementation.

### Competitive response

**“CoverMyMeds is free.”**

Correct. CoverMyMeds is an electronic prior-authorization submission network. Formulary Finder is the earlier plan-navigation and source-evidence workflow. It should work alongside PA tools, not pretend to replace them.

**“Our EHR already checks formularies.”**

Demonstrate exact plan and product selection, source provenance, unresolved handling and immediate PA-form routing. If the clinic's current workflow is faster and clearer, do not force a sale.

**“The payer website is free.”**

The paid value is configuration, normalization, source maintenance and one repeatable workflow across the clinic's actual payer mix.

## Commercial validation plan

### First five buyer conversations

Show two prices without discount theater:

1. $500 for the 60-day proof, credited toward annual conversion.
2. $149 Core or $249 Plus after the proof.

Record:

- Current number of staff involved in formulary and PA research.
- Highest-volume plans and medication families.
- Current time to reach an interpretable answer.
- Whether $149 or $249 needs budget approval.
- Which package they would select and why.
- Required security, contracting and support expectations.

### Pricing decision after five clinics

- Keep the price if at least two qualified clinics accept a paid proof without a special discount.
- Raise the price if buyers value recurring source maintenance more than expected and servicing costs remain low.
- Reduce scope before reducing price if custom-source labor is the objection.
- Pause recurring sales if the sold plan pack cannot meet the clinic's exactness and source-freshness requirements.

## Claims to avoid

- “Cheaper CoverMyMeds.”
- “Real-time patient coverage” without a member-specific transaction.
- “Every insurer,” “every plan,” or “complete national formulary.”
- “Guaranteed coverage,” “approved,” or “not covered” based solely on source absence.
- “Prior authorization completed” when the product only exposes a form or route.

## Immediate build order

1. Add the $500 proof and $149/$249 packages to customer-facing materials.
2. Add a clinic insurer-list intake path that accepts no PHI and creates a source-feasibility backlog.
3. Add source-review timestamps and a correction request path to every result family.
4. Instrument PHI-free lookup completion, time-to-answer and unconfirmed frequency.
5. Run five price-discovery calls before changing the public price.
