# PA Tracker Phase B Spec: the real-data tier (GATED)

Status: design spec only. **Nothing in this file is authorized to be built or deployed until every gate in Section 2 passes with named human approval.** Phase A (the synthetic demo at `public/pa-tracker/`) contains no PHI and has no dependency on this document.

## 1. What Phase B is

The same lifecycle, radar engine, and case model as Phase A, operating on real clinic cases that contain protected health information: patient identifiers, member IDs, clinical documentation references, payer reference numbers tied to individuals.

## 2. Entry gates (all required, all human-signed)

1. Completed security review covering authentication, authorization, session handling, transport, and storage.
2. HIPAA/BAA assessment signed: hosting provider BAA in place, subprocessor list reviewed.
3. Access controls designed: named-user accounts, role separation (admin, PA coordinator, clinician read), no shared logins.
4. Audit logging: every create/read/update/delete on a case emits an immutable audit record (who, what, when).
5. Retention and deletion policy: defined case retention period; verified deletion on request; export path for clinic-owned data.
6. Minimum-necessary review: field list trimmed to what follow-up tracking actually requires; free-text notes discouraged by default.
7. Named owner approval from Rishva Iyer recorded in the vault before any code touching PHI merges.

## 3. Architecture sketch

- Case ledger in PostgreSQL (Railway-managed, BAA-covered) with append-only audit table; no client-side storage of PHI.
- Server-rendered pages behind authenticated sessions; no PHI in URLs, logs, or analytics.
- The evidence layer stays separate and PHI-free: plan/formulary/tier/PA-requirement lookups continue to run exactly as today, joined to cases only by medication family + plan family + internal case ID.
- Follow-up engine runs server-side on the same clocks as Phase A (standard TAT 7 days / expedited 72h per CMS-0057-F, pend windows, renewal runway); notifications are internal tasks first, email/SMS only after a separate messaging compliance review.

## 4. Explicitly out of scope for Phase B v1

- Automatic submission of prior authorizations to payers.
- EHR integration or chart access.
- Voice/phone automation against real payers (the synthetic sandbox pattern extends only under separately approved telephony compliance review).
- Any claim language beyond stage status: the tracker reports where a case stands; it never adjudicates.

## 5. Acceptance tests for Phase B (when unlocked)

- Auth: unauthenticated request to any case route returns redirect; cross-role access denied and audited.
- Audit: any case mutation produces an audit row with actor and timestamp; audit table has no delete path.
- Deletion: a test clinic's data is fully purged on request with verification query results retained.
- Radar correctness: seeded fixture cases produce expected pend/TAT/renewal flags, mirroring the Phase A tests.
- No PHI leakage: URL scan, log scan, and page-source scan show zero identifiers outside authenticated views.
