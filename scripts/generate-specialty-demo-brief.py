#!/usr/bin/env python3
"""Compile a bounded, PHI-free Formulary Finder specialty demo research brief.

This tool deliberately does not fetch sources, contact a prospect, send email, or
process patient data. It ranks an operator-provided, versioned specialty catalog
and creates a research queue plus a draft-only outreach message for human review.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


FORBIDDEN_KEY_STEMS = (
    "patient",
    "member",
    "subscriber",
    "medicalrecord",
    "mrn",
    "dateofbirth",
    "dob",
    "claim",
    "chartnote",
    "ssn",
)


def _normalized_key(key: str) -> str:
    return re.sub(r"[^a-z0-9]", "", key.lower())


def is_forbidden_key(key: str) -> bool:
    normalized = _normalized_key(key)
    return any(stem in normalized for stem in FORBIDDEN_KEY_STEMS)


SOURCE_STATUSES = {"public_current", "public_needs_review", "unavailable"}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def contains_forbidden_key(value: Any) -> str | None:
    if isinstance(value, dict):
        for key, nested_value in value.items():
            if is_forbidden_key(key):
                return key
            nested = contains_forbidden_key(nested_value)
            if nested:
                return nested
    if isinstance(value, list):
        for item in value:
            nested = contains_forbidden_key(item)
            if nested:
                return nested
    return None


def validate_config(config: dict[str, Any]) -> None:
    forbidden = contains_forbidden_key(config)
    require(not forbidden, f"PHI-like or prohibited input key: {forbidden}")

    for key in ("clinic_display_name", "clinic_website_url", "specialty", "region", "plan_families", "medications"):
        require(bool(config.get(key)), f"Missing required field: {key}")
    require(isinstance(config["region"], dict) and config["region"].get("state"), "region.state is required")
    require(config.get("outbound_mode", "draft_only") == "draft_only", "Only draft_only outreach is supported")
    require(config.get("privacy_mode", "phi_free_only") == "phi_free_only", "Only phi_free_only mode is supported")

    maximum = config.get("max_medication_families", 15)
    require(isinstance(maximum, int) and 10 <= maximum <= 20, "max_medication_families must be 10 through 20")
    require(isinstance(config["plan_families"], list) and 1 <= len(config["plan_families"]) <= 8, "Use 1 through 8 plan families")
    require(isinstance(config["medications"], list) and len(config["medications"]) >= 10, "Provide at least 10 medication candidates")

    for plan in config["plan_families"]:
        for key in ("id", "display_name", "coverage_type", "local_relevance", "source_status"):
            require(key in plan, f"Plan missing {key}")
        require(plan["source_status"] in SOURCE_STATUSES, f"Unsupported plan source_status: {plan['source_status']}")
        require(1 <= plan["local_relevance"] <= 5, "plan local_relevance must be 1 through 5")

    for medication in config["medications"]:
        for key in ("id", "display_name", "clinical_bucket", "specialty_relevance", "service_line_match", "public_condition_match", "source_readiness", "therapy_friction"):
            require(key in medication, f"Medication missing {key}")
        for key in ("specialty_relevance", "service_line_match", "public_condition_match", "source_readiness", "therapy_friction"):
            require(0 <= medication[key] <= 5, f"medication {key} must be 0 through 5")


def plan_signal(plan_families: list[dict[str, Any]]) -> float:
    score_by_status = {"public_current": 1.0, "public_needs_review": 0.5, "unavailable": 0.0}
    weighted = [plan["local_relevance"] * score_by_status[plan["source_status"]] for plan in plan_families]
    return sum(weighted) / len(weighted)


def medication_score(medication: dict[str, Any], payer_signal: float) -> float:
    # Documented selection heuristic. It prioritizes demo relevance, not presumed revenue or volume.
    return round(
        5 * medication["specialty_relevance"]
        + 3 * medication["service_line_match"]
        + 2 * medication["public_condition_match"]
        + 2 * medication["source_readiness"]
        + 1 * medication["therapy_friction"]
        + payer_signal,
        2,
    )


def select_medications(config: dict[str, Any]) -> list[dict[str, Any]]:
    payer_signal = plan_signal(config["plan_families"])
    ranked = [dict(medication, demo_priority=medication_score(medication, payer_signal)) for medication in config["medications"]]
    ranked.sort(key=lambda item: (-item["demo_priority"], item["display_name"].lower()))

    maximum = config.get("max_medication_families", 15)
    selected: list[dict[str, Any]] = []
    buckets: set[str] = set()
    for medication in ranked:
        if medication["clinical_bucket"] not in buckets:
            selected.append(medication)
            buckets.add(medication["clinical_bucket"])
        if len(selected) == maximum:
            return selected
    for medication in ranked:
        if medication["id"] not in {item["id"] for item in selected}:
            selected.append(medication)
        if len(selected) == maximum:
            break
    return selected


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def markdown_brief(config: dict[str, Any], selected: list[dict[str, Any]], generated_at: str) -> str:
    plan_rows = "\n".join(
        f"| {plan['display_name']} | {plan['coverage_type']} | {plan['source_status']} | {plan.get('source_url', 'Research required')} |"
        for plan in config["plan_families"]
    )
    medication_rows = "\n".join(
        f"| {index} | {medication['display_name']} | {medication['clinical_bucket']} | {medication['demo_priority']} | {medication.get('requires_exact_product', True)} |"
        for index, medication in enumerate(selected, start=1)
    )
    queue_rows = "\n".join(
        f"| {plan['display_name']} | {medication['display_name']} | official current payer or CMS source | plan-product-source evidence record |"
        for plan in config["plan_families"]
        for medication in selected
    )
    contact = config.get("prospect", {}).get("role", "medication-access workflow owner")
    return f"""---
title: Medication Access Research Preview, {config['clinic_display_name']}
generated_at: {generated_at}
status: draft-only, PHI-free research scope
outbound_mode: draft_only
---

# Medication Access Research Preview

## Scope and truth boundary

This is a limited **synthetic demo research scope** for {config['clinic_display_name']}, based on public specialty context and operator-supplied plan-family candidates. It is not a patient-specific benefit check, an assertion about the clinic's actual prescribing or payer mix, a coverage determination, a prior-authorization submission, or a financial claim.

If the preview is useful, Formulary Finder can propose a separately governed process to map an approved, deidentified clinic medication and plan list with source-refresh ownership.

## Intake summary

- Clinic: {config['clinic_display_name']}
- Website: {config['clinic_website_url']}
- Specialty: {config['specialty']}
- Region: {config['region']['state']}
- Public context note: {config.get('public_context_note', 'Not provided. Do not infer workflow or volume.')}
- Selected medication families: {len(selected)}
- Candidate plan families: {len(config['plan_families'])}
- Research matrix: {len(selected) * len(config['plan_families'])} bounded plan-product cells

## Plan-family candidates

| Plan family | Coverage type | Public-source state | Source lead |
| --- | --- | --- | --- |
{plan_rows}

Carrier-only references remain `plan-match-required`. No plan family is an exact member benefit result without exact-plan evidence.

## Algorithmic medication selection

Selection is deterministic from the versioned input catalog, not an LLM guess:

```text
demo priority = 5 x specialty relevance
              + 3 x public service-line match
              + 2 x public condition match
              + 2 x official-source readiness
              + 1 x published therapy-friction marker
              + payer-source signal
```

The score ranks research order. It does not estimate prescription volume, insurer mix, clinical quality, revenue, approval likelihood, or payer cost.

| Rank | Medication family | Clinical bucket | Research priority | Exact product required |
| --- | --- | --- | ---: | --- |
{medication_rows}

## Agent research queue

Every cell must finish as `source_listed`, `unconfirmed_no_exact_product`, `unconfirmed_ambiguous_product`, `plan_match_required`, `source_stale`, or `not_researched`. Absence is not a denial.

| Plan family | Medication product | Required source | Agent deliverable |
| --- | --- | --- | --- |
{queue_rows}

### Bounded agent assignment

1. **Clinic-context agent**: verify only public clinic specialty and public plan-list evidence. Do not infer volumes, payer mix, or prescriptions.
2. **Payer-source agent**: research one plan family at a time from official current public sources. Record scope, effective date, retrieved date, exactness, restrictions, and source URL.
3. **Product-normalization agent**: preserve ingredient, brand/generic, strength, route, dosage form, device, package, RxCUI/NDC where relevant. Ambiguity stays unconfirmed.
4. **Skeptical QA agent**: check source freshness, wrong-state/wrong-lane risk, plan-family overclaims, product-form mismatches, and prohibited claims.

Run at most two evidence loops. Stop and mark a blocker if a source is restricted, stale, ambiguous, or does not identify an exact plan or product.

## Demo path

Show one prevalidated synthetic path only:

1. A source-listed plan-product restriction with source date and scope label.
2. A PA-readiness checklist that exposes missing evidence rather than guessing.
3. A human-reviewed draft marked `NOT SENT`.
4. A simulated receipt and internal `follow_up_due` task. No real call, email, portal action, or submission occurs.

## Draft-only email

**Recipient role:** {contact}

**Subject:** A small medication-access research preview for {config['clinic_display_name']}

Hi [Name],

We prepared a limited, PHI-free preview for {config['clinic_display_name']} based on its public {config['specialty']} context and publicly available plan sources. It maps {len(selected)} medication families across {len(config['plan_families'])} plan-family examples, with source links, dates, and clear unconfirmed states where public evidence is incomplete.

This is not a coverage determination or a claim about your clinic's patients, plans, or workflow. It shows how Formulary Finder could give staff a source-backed starting point before payer calls and prior-authorization work.

If useful, we would be glad to show the five-minute synthetic preview and discuss mapping an approved, deidentified plan and medication list.

[Sender name]\n[Company]\n[Physical mailing address]\n[Reply address and opt-out instruction]

**Do not send automatically.** A human must verify the recipient route, sender identity, postal address, opt-out and suppression handling, and every clinic-specific assertion first.

## Research and demo acceptance gate

- [ ] No PHI, patient identifiers, member identifiers, charts, claims, or real call recordings.
- [ ] Every clinic-specific statement has a public or clinic-supplied citation.
- [ ] Every promoted plan-product cell has an official source URL, scope, effective date, retrieved date, exact product key, and review state.
- [ ] Carrier-only evidence is visible as `plan-match-required`.
- [ ] Unconfirmed, ambiguous, stale, and unavailable states remain visible.
- [ ] Demo uses only synthetic cases and displays `NOT SENT`.
- [ ] Copy contains no savings, revenue, approval, coverage, adoption, or integration claim without evidence.
- [ ] Outreach remains a human-approved draft.
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Compile a draft-only, PHI-free specialty demo research brief.")
    parser.add_argument("--input", type=Path, required=True, help="PHI-free JSON intake file")
    parser.add_argument("--output", type=Path, required=True, help="Markdown brief destination")
    args = parser.parse_args()

    config = json.loads(args.input.read_text())
    validate_config(config)
    selected = select_medications(config)
    generated_at = datetime.now(UTC).replace(microsecond=0).isoformat()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(markdown_brief(config, selected, generated_at))
    print(f"Wrote draft-only research brief: {args.output}")


if __name__ == "__main__":
    main()
