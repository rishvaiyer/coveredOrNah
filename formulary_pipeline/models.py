from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


VALID_STATES = {
    "confirmed",
    "unconfirmed",
    "source_stale",
    "conflicting",
    "login_required",
    "not_found_in_source",
    "needs_human_review",
}


@dataclass(frozen=True)
class Source:
    source_id: str
    insurer: str
    state: str
    benefit_type: str
    plan_name: str
    url: str
    source_type: str
    source_version: str
    scope: str = ""
    refresh_days: int = 90
    access: str = "public"


@dataclass(frozen=True)
class Product:
    medication: str
    brand: str = ""
    generic: str = ""
    strength: str = ""
    dosage_form: str = ""
    device: str = ""
    ndc: str = ""
    rxcui: str = ""


@dataclass(frozen=True)
class Evidence:
    source_id: str
    plan_name: str
    product: Product
    state: str
    tier: str = ""
    prior_authorization: str = ""
    step_therapy: str = ""
    quantity_limit: str = ""
    source_row: str = ""
    note: str = ""
    observed_at: str = ""
    source_version: str = ""

    def __post_init__(self):
        if self.state not in VALID_STATES:
            raise ValueError(f"Invalid evidence state: {self.state}")

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class Ledger:
    records: list[Evidence] = field(default_factory=list)

    def add(self, evidence: Evidence) -> None:
        self.records.append(evidence)

    def summary(self) -> dict[str, Any]:
        by_state: dict[str, int] = {}
        by_source: dict[str, dict[str, int]] = {}
        for record in self.records:
            by_state[record.state] = by_state.get(record.state, 0) + 1
            source = by_source.setdefault(record.source_id, {})
            source[record.state] = source.get(record.state, 0) + 1
        return {
            "total": len(self.records),
            "confirmed": by_state.get("confirmed", 0),
            "unconfirmed": sum(value for key, value in by_state.items() if key != "confirmed"),
            "by_state": by_state,
            "by_source": by_source,
        }
