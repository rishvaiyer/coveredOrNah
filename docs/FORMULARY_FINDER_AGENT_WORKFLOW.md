# Formulary Finder agent build workflow

## Status

- State: active execution plan.
- Product owner: Rishva Iyer.
- Manager: Codex or Quinn consulting manager.
- Builder model: GPT-5.4, because a GPT-5.4 mini variant is not exposed in the current agent environment.
- Final reviewer: the strongest available higher-capability model, currently GPT-5.6.
- Production deployment: approval-gated and outside this workflow unless Rishva explicitly requests it.

## Objective

- Finish the PHI-free New Jersey clinic workflow as a tested, source-visible product.
- Finish the matching Kind Workflows consulting offer and reusable template.
- Preserve every existing change and public route.
- Push reviewed code and documentation to GitHub through focused commits and a draft pull request.
- Continue in bounded batches until the completion contract below passes or a listed stop condition requires Rishva.

## Authoritative locations

- Active product repo: `/Users/unevil-warden-scallion-princess-no-rollback/Documents/ChatGPT/Pitch Decks/formulary-finder-pilot`
- Reusable Kind Workflows template: `/Users/unevil-warden-scallion-princess-no-rollback/Documents/New project/Kind Workflows Products/formulary-finder`
- Durable project note: `/Users/unevil-warden-scallion-princess-no-rollback/Documents/Obsidian Vault/01 Projects/Formulary Finder.md`
- Consulting GTM note: `/Users/unevil-warden-scallion-princess-no-rollback/Documents/Obsidian Vault/01 Projects/Kind Workflows Go-To-Market Plan 2026.md`
- Approval queue: `/Users/unevil-warden-scallion-princess-no-rollback/Documents/Obsidian Vault/03 Resources/Kind Workflows Approval Queue 2026-08-16.md`
- Public product app: `https://formulary-finder-pilot-production.up.railway.app/`
- Public product landing page: `https://rishvaiyer.github.io/formulary-finder/`
- Portfolio: `https://rishva.up.railway.app/`
- Separate Kind Workflows preview: `https://kind-workflows-formulary-production.up.railway.app/`
- Kind Workflows site: `https://kindworkflows.com/`

## Non-negotiable boundaries

- Use public, licensed, synthetic, or explicitly approved de-identified data only.
- Never collect member IDs, names, birth dates, claims, diagnoses, prescriptions, or patient files.
- Never infer eligibility, payment, approval, denial, or clinical advice.
- Missing or ambiguous evidence must remain `Unconfirmed, not a denial`.
- Preserve source URL, source date, exact plan scope, product identifier, restriction flags, freshness, and review status.
- Do not scrape authenticated portals or evade access controls.
- Do not commit downloaded payer documents, temporary extracts, secrets, generated build folders, or patient data.
- Do not deploy, publish new public copy, contact a clinic, send outreach, spend money, or make a client commitment without fresh approval.
- Never let two agents edit the same checkout.

## Completion contract

The program is complete only when every applicable gate passes.

### Product gates

- The active branch builds from a clean install.
- All repository test scripts pass.
- The app supports the defined NJ pulmonary workflow: insurer, coverage type, exact plan or plan family, exact medication product, source evidence, restrictions, and PA route when available.
- Every result family has a source date, scope statement, freshness state, review state, and safe unconfirmed explanation.
- The clinician review queue covers source, plan identity, product ambiguity, freshness, and correction status.
- The PHI-free intake path validates inputs, retains no file contents, and clearly states its limits.
- PHI-free workflow metrics exist for lookup completion, elapsed time, unconfirmed frequency, correction frequency, and source freshness exceptions.
- Accessibility, desktop, and 390 px mobile checks pass for changed views.
- No known critical or high-severity security finding remains open.

### Data gates

- The 85-medication catalog and active NJ plan-family set are represented in the deterministic audit.
- Every audited cell is either source-confirmed or explicitly unconfirmed with a reason.
- A source absence is never silently converted into noncoverage.
- Every baseline appears in `data/formulary-source-manifest.json` with scope, URL, cadence, completeness class, and absence rule.
- Exact connectors have fixture-backed tests for success, no match, malformed upstream data, timeout or source failure, and stale data.
- Static mappings have a second-review record and a reproducible extraction note.
- Data completion means complete disposition and provenance for the supported scope. It does not mean inventing a positive result for every cell.

### Consulting gates

- The offer is consistently described as a PHI-free medication-access evidence workflow for NJ clinics.
- Buyer, user, deliverables, exclusions, price hypotheses, proof scope, conversion gate, and success measures are consistent across the brief, landing page, demo package, and Kind Workflows materials.
- The current hypothesis remains: $500 for a 60-day design-partner proof, then $149 Clinic Core or $249 Clinic Plus per location monthly.
- Pricing remains labeled a hypothesis until five qualified NJ clinic conversations validate it.
- No public claim states complete plan coverage, real-time member coverage, guaranteed coverage, clinical advice, or completed prior authorization.
- The reusable Kind Workflows template contains no client-specific or patient data.

### Public-surface gates

- Portfolio root returns HTTP 200 and its Formulary Finder card opens the intended live product.
- Product app root and `/api/health` return HTTP 200 and report the expected medication and plan counts.
- Product landing page returns HTTP 200, has no broken internal links, and opens the intended product app.
- Separate Kind Workflows preview returns HTTP 200 and remains clearly synthetic or template-oriented.
- Kind Workflows site returns HTTP 200 and any Formulary Finder link reaches the intended surface.
- Browser checks confirm page identity and primary interactions. HTTP 200 alone is not enough.

### GitHub gates

- The branch contains only intended Formulary Finder changes.
- Generated output and temporary payer files are excluded unless a reviewed deliverable is intentionally versioned.
- A higher-model review has no unresolved blocking finding.
- Focused commits are pushed to `rishvaiyer/formulary-finder`.
- A draft pull request targets `main` and lists the exact verification evidence.

## Agent roles

### 1. Manager and integrator

- Owns the active branch and shared files.
- Creates one task packet at a time.
- Assigns isolated worktrees to builders.
- Reproduces evidence before merging or cherry-picking.
- Updates the durable project note and handoff.

### 2. GPT-5.4 product builder

- Works on one bounded UI, API, accessibility, security, or instrumentation task.
- Adds or updates tests before handing back code.
- Does not change formulary facts unless the task packet includes reviewed source evidence.

### 3. GPT-5.4 data builder

- Works on one payer source or one bounded medication batch.
- Records provenance and uncertainty.
- Produces fixtures, parser or mapping changes, tests, and an audit delta.
- Does not treat a search miss as a denial.

### 4. GPT-5.4 consulting builder

- Keeps the offer, product language, template, and sales artifacts consistent.
- Uses facts already verified in the repo or durable note.
- Labels prices, outcomes, and buyer assumptions as hypotheses where required.

### 5. GPT-5.6 reviewer

- Reviews the full diff read-only after each milestone.
- Checks correctness, privacy, security, medical-claim discipline, source integrity, tests, UX, and release risk.
- Returns blocking findings first, with exact file and line evidence.
- Does not approve based only on a passing build.

## Worktree rule

- Manager begins with `git status -sb`, `git diff --stat`, and `git diff --check`.
- Existing dirty work is checkpointed only after tests and review.
- Each builder gets a dedicated branch and worktree from the latest reviewed checkpoint.
- Builders never edit the manager checkout.
- Shared-file tasks run sequentially.
- The manager cherry-picks one reviewed commit at a time.
- If a builder finds unrelated or conflicting work, it stops and reports the exact files.

## Standard task packet

Every agent receives all fields below.

```md
Task ID:
Role:
Repository and worktree:
Base commit:
Allowed files:
Problem:
Evidence:
Required change:
Required tests:
Acceptance criteria:
Forbidden actions:
Deliverables:
Stop conditions:
```

## Required agent instructions

- Inspect `git status -sb` and the relevant diff before editing.
- Read only the named files and their direct dependencies.
- Change only allowed files.
- Preserve existing behavior outside the task.
- Add deterministic tests for the changed behavior.
- Run the named focused tests once, then run `git diff --check`.
- Report files changed, test output, remaining risk, exact commit, and any unsupported claim.
- Do not deploy, contact anyone, use credentials, or process sensitive data.

## Execution loop

### Step 1. Reconcile

- Read the latest project note and handoff.
- Inspect product and template repository status and diffs.
- Check GitHub branch and pull-request state.
- Refresh the public surfaces when their evidence is older than six hours.

### Step 2. Select one batch

- Rank open work by safety, user value, source availability, and reversibility.
- Prefer one payer, one feature, or one cross-surface defect per batch.
- Keep each builder to five focused source files where practical.
- Define the expected audit delta before work begins.

### Step 3. Build

- Assign one isolated worktree to one GPT-5.4 builder.
- Require tests and a focused commit.
- Keep downloaded source material outside Git and delete nothing from the user's original workspace.

### Step 4. Verify locally

- Run the task-specific tests.
- Run the full verification matrix when shared product code changes.
- Inspect the UI at desktop and 390 px when the UI changes.
- Compare the gap audit before and after data changes.

### Step 5. Review

- Send the commit and evidence packet to the GPT-5.6 reviewer.
- Fix every blocking finding.
- Rerun only the affected focused test set, then the final full matrix.

### Step 6. Integrate and push

- Cherry-pick or merge the reviewed commit into the manager branch.
- Stage only intended files.
- Push the branch to GitHub.
- Update the draft pull request with exact evidence and known limitations.

### Step 7. Reassess

- Regenerate the gap audit and backlog.
- Continue automatically if another safe, source-supported batch exists.
- Stop only at the completion contract or a stop condition.

## Prioritized build backlog

### Milestone 0. Preserve and checkpoint current work

- Review the existing uncommitted Ambetter, data-gap, intake, clinic-package, and pricing changes.
- Exclude `tmp/`, `dist/`, raw payer downloads, and incidental generated files.
- Confirm whether `output/` deliverables are intentionally versioned or remain release artifacts.
- Run all current tests.
- Obtain GPT-5.6 review.
- Commit and push the checkpoint before new feature batches.

### Milestone 1. Evidence model and QA

- Add a machine-readable unconfirmed reason for every result family.
- Validate source URL, source date, plan scope, completeness class, freshness, and review status.
- Add a source-drift report with fail-closed states.
- Add deterministic audit outputs suitable for pull-request review.
- Add security tests for file intake limits, type checks, filename handling, memory use, and error responses.

### Milestone 2. Highest-value data gaps

- Prioritize actual clinic demand when available.
- Until demand data exists, review in this order:
  - Braven NJ Medicare, 76 unconfirmed cells.
  - Wellpoint NJ FamilyCare static catalog, 63 unconfirmed cells, while preserving its exact feed connector.
  - Oscar NJ Individual, 54 unconfirmed cells.
  - Cigna National Preferred, 38 unconfirmed cells.
  - Humana, Wellcare, UHC Commercial, Oxford, Clover, HealthSpring, and remaining specialty-product gaps.
- Treat Guaifenesin ER and Reslizumab zero-confirmed rows as source-review tasks, not assumed defects.
- Prefer full official machine-readable sources over hand-maintained static rows.
- Preserve legitimately unconfirmed outcomes when the source cannot answer exactly.

### Milestone 3. Clinic workflow

- Finish the clinician review queue and clear status transitions.
- Add a PHI-free correction request record with no external send.
- Add source-freshness and stale-data warnings to every result type.
- Add local or aggregate-only metrics for lookup completion, elapsed time, unconfirmed frequency, correction frequency, and freshness exceptions.
- Add exportable, de-identified implementation summaries.

### Milestone 4. Consulting productization

- Reconcile the product brief, demo package, landing page, pricing document, and scaling plan.
- Add a one-page Medication Access Workflow Brief template.
- Add a 60-day proof checklist, weekly review checklist, source-owner handoff, and end-of-proof report template.
- Keep the initial buyer hypothesis: NJ specialty-clinic practice administrator or clinical operations lead.
- Keep users: nurses, medication-access or PA staff, pharmacists, and physicians.
- Keep deliverables: supported plan-family configuration, intake template, review queue, source-refresh process, false-match log, onboarding, and measured report.
- Keep exclusions: eligibility, payment, prescribing advice, PA submission, EHR integration, and patient-specific adjudication.

### Milestone 5. Separate Kind Workflows template

- Port only reviewed, reusable, synthetic-safe changes.
- Remove product-specific secrets, deployment IDs, temporary artifacts, and client assumptions.
- Run the template build and smoke tests from a clean install.
- Verify the separate Kind Workflows preview independently from the main product app.
- Push the template repo through its own focused branch and review.

### Milestone 6. Public integration verification

- Verify the portfolio card text, product link, GitHub link, and back navigation.
- Verify the GitHub Pages landing page and its download asset.
- Verify the main Railway app and `/api/health` identity and counts.
- Verify the separate Kind Workflows preview identity and synthetic boundary.
- Verify `kindworkflows.com` does not imply member-specific coverage or a live clinical integration.
- Record browser and HTTP evidence with timestamps.

## Data batch protocol

### Source acceptance

- Use an official payer, PBM, CMS, state Medicaid, or licensed source.
- Record the exact URL, effective date, retrieval date, plan geography, benefit type, plan identifier, and format.
- Record whether the source is full, abridged, partial, route-only, or authenticated.
- Reject or quarantine stale, mismatched, unauthenticated, or ambiguous sources.

### Normalization

- Match exact product, strength, dosage form, device, route, brand or generic status, RxCUI, and NDC when the source permits.
- Never widen an exact match based only on a similar medication family.
- Preserve published tier, PA, ST, QL, specialty-pharmacy, age, and other restriction markers.

### Review

- Builder creates the proposed mapping and fixtures.
- A separate reviewer checks a risk-based sample plus every ambiguous row.
- Conflicts remain unresolved until the source and plan identity agree.
- Each accepted batch updates the source manifest, tests, and gap audit.

### Batch stop rules

- Stop after three source failures for the same target.
- Stop when an authenticated portal, license, purchase, legal interpretation, or clinic decision is required.
- Stop when the exact plan scope cannot be established.
- Stop when a change would replace an honest unconfirmed result with a guess.
- Continue to the next source-supported batch when the current target is legitimately unresolved.

## Full local verification matrix

```bash
npm test
npm run cms:test
npm run uhc:qhp:test
npm run aetna:familycare:test
npm run uhc:community:test
npm run fidelis:nj:test
npm run horizon:classic:test
npm run formulary:gaps:test
npm run plan-intake:test
npm run formulary-data:typecheck
npm run formulary-data:test
npm run formulary:gaps
git diff --check
```

## Live verification matrix

- HTTP status and page identity:
  - portfolio root
  - portfolio Formulary Finder destination
  - product app root
  - product `/api/health`
  - GitHub Pages landing page
  - Kind Workflows preview
  - Kind Workflows site
- Browser interaction:
  - insurer to exact-plan to medication path
  - one confirmed result
  - one unconfirmed result
  - source and restriction display
  - PA route where available
  - plan-intake validation without retained contents
  - landing-page download asset
  - desktop and 390 px layout
- Link checks:
  - portfolio to product
  - landing page to product
  - product to official sources
  - Kind Workflows to the correct product or preview

## Consulting validation data still needed

- Five qualified NJ clinic conversations.
- Three completed product demonstrations.
- One paid PHI-free design-partner proof.
- Each clinic's top plan families and high-friction medication products, without patient data.
- Current workflow steps, owner, handoffs, lookup time, correction pattern, and source-refresh process.
- Buyer response to $500 proof and $149 or $249 monthly packages.
- Required security, contracting, support, and source-maintenance expectations.
- These are external validation gates. Agents prepare the materials but do not contact clinics without approval.

## Stop conditions requiring Rishva

- Production deployment or public-copy change.
- External outreach, demo scheduling, proposal delivery, or clinic contact.
- Purchase, license, paid data source, legal review, or contract.
- Patient data, member-specific lookup, EHR integration, BAA, or HIPAA scope change.
- Two materially different product outcomes with no evidence-based winner.
- A dirty checkout whose ownership or intended commit scope cannot be resolved.
- A source whose use rights or plan identity are unclear.

## Handoff format

- State: proposed, in progress, blocked, review-ready, pushed, or complete.
- Base and head commit.
- Files changed.
- Tests run with pass or fail counts.
- Gap audit before and after.
- Live surfaces checked and timestamp.
- Higher-model findings and resolutions.
- Known limitations.
- Exact next safe batch.
- Boundaries: state explicitly that no deployment, contact, payment, or sensitive-data processing occurred unless separately authorized and verified.
