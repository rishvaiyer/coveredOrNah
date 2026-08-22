#!/usr/bin/env python3
"""Run a local, synthetic-only PA status-call simulation.

No telephony, audio, AI vendor, web request, phone number, recording, transfer,
email, or submission capability exists in this script. It models the safer
pre-production workflow and emits a structured internal follow-up task only.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


FORBIDDEN_TRUE_FLAGS = {
    "external_network",
    "real_calls",
    "inbound_calls",
    "transfers",
    "recording",
    "audio_storage",
}
PHONE_PATTERN = re.compile(r"\+?\d[\d .()\-]{7,}\d")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


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


def contains_forbidden_key(value: Any) -> str | None:
    if isinstance(value, dict):
        for key, nested_value in value.items():
            normalized = _normalized_key(key)
            if any(stem in normalized for stem in FORBIDDEN_KEY_STEMS):
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


def validate_sandbox(case: dict[str, Any]) -> None:
    require(case.get("synthetic") is True, "Only synthetic cases are allowed")
    mode = case.get("mode", "synthetic_local_only")
    require(mode == "synthetic_local_only", "Sandbox mode must be synthetic_local_only")
    settings = case.get("settings", {})
    require(settings.get("provider", "mock") == "mock", "Sandbox provider must be mock")
    for flag in FORBIDDEN_TRUE_FLAGS:
        require(settings.get(flag, False) is False, f"{flag} must be false in sandbox")
    require(settings.get("follow_up_execution", "internal_task_only") == "internal_task_only", "Follow-up must stay internal")
    require(settings.get("require_disclosure", True) is True, "Synthetic disclosure is required")
    require(settings.get("require_human_review", True) is True, "Human review is required")
    require(case.get("human_approved") is True, "Named test operator must approve simulation")
    phi_key = contains_forbidden_key(case)
    require(phi_key is None, f"PHI-like key is prohibited in sandbox input: {phi_key}")
    serialized = json.dumps(case)
    require(not PHONE_PATTERN.search(serialized), "Phone-like value is prohibited in sandbox input")


def run_simulation(case: dict[str, Any], outcome: str) -> dict[str, Any]:
    validate_sandbox(case)
    allowed_outcomes = {"pending", "more_information", "approved", "denied", "unrecognized_question"}
    require(outcome in allowed_outcomes, f"Unsupported outcome: {outcome}")
    now = datetime.now(UTC).replace(microsecond=0).isoformat()
    events = [
        {"event": "simulation_started", "at": now, "external_call_placed": False},
        {
            "event": "synthetic_disclosure_played",
            "text": "This is a synthetic product test. It is not a real prior-authorization or insurance call.",
        },
        {"event": "simulated_status_questions", "questions": ["PA requirement", "documentation categories", "decision timeframe"]},
    ]

    if outcome == "pending":
        events.extend([
            {"event": "simulated_reference_recorded", "reference": "SYN-REF-001"},
            {"event": "follow_up_due", "action": "create_internal_task", "external_action": False},
        ])
        state = "follow_up_due"
    elif outcome == "more_information":
        events.append({"event": "missing_information_review", "action": "create_internal_review_task"})
        state = "missing_information_review"
    elif outcome in {"approved", "denied"}:
        events.append({"event": "simulated_decision_received", "decision": outcome, "follow_up_stopped": True})
        state = "simulated_closed"
    else:
        events.append({"event": "human_escalation_required", "reason": "payer_question_not_in_approved_script", "external_transfer_placed": False})
        state = "human_escalation_required"

    return {
        "case_id": case["case_id"],
        "synthetic": True,
        "final_state": state,
        "events": events,
        "network_requests": 0,
        "real_call_placed": False,
        "recording_created": False,
        "external_follow_up_sent": False,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run a synthetic local-only PA voice simulation.")
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--outcome", choices=["pending", "more_information", "approved", "denied", "unrecognized_question"], required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = run_simulation(json.loads(args.input.read_text()), args.outcome)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + "\n")
    print(f"Wrote synthetic voice simulation result: {args.output}")


if __name__ == "__main__":
    main()
