from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Iterable

from .models import Evidence, Product, Source
from .normalize import product_from_row


def read_rows(path: Path) -> list[dict[str, object]]:
    suffix = path.suffix.lower()
    if suffix == ".json":
        value = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(value, dict):
            value = value.get("rows") or value.get("drugs") or value.get("products") or []
        if not isinstance(value, list):
            raise ValueError("JSON source must contain a list or rows/products/drugs list")
        return [dict(row) for row in value if isinstance(row, dict)]
    if suffix in {".csv", ".tsv"}:
        with path.open(newline="", encoding="utf-8-sig") as handle:
            return [dict(row) for row in csv.DictReader(handle, delimiter="\t" if suffix == ".tsv" else ",")]
    raise ValueError(f"Unsupported tabular source: {path.suffix}")


def parse_tabular(source: Source, path: Path, observed_at: str = "") -> list[Evidence]:
    records: list[Evidence] = []
    for row in read_rows(path):
        product = product_from_row(row)
        state = str(row.get("state") or "confirmed").strip().lower()
        if state not in {"confirmed", "unconfirmed", "needs_human_review", "conflicting"}:
            state = "needs_human_review"
        records.append(Evidence(
            source_id=source.source_id,
            plan_name=source.plan_name,
            product=product,
            state=state,
            tier=str(row.get("tier") or ""),
            prior_authorization=str(row.get("prior_authorization") or row.get("pa") or ""),
            step_therapy=str(row.get("step_therapy") or row.get("st") or ""),
            quantity_limit=str(row.get("quantity_limit") or row.get("ql") or ""),
            source_row=str(row.get("source_row") or row.get("row") or ""),
            note=str(row.get("note") or ""),
            observed_at=observed_at,
            source_version=source.source_version,
        ))
    return records


def parse_pdf_text(source: Source, text: str, observed_at: str = "") -> list[Evidence]:
    """Conservative PDF hook: accepts pre-extracted rows, never guesses table structure."""
    records: list[Evidence] = []
    for line_number, line in enumerate(text.splitlines(), start=1):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        fields = [part.strip() for part in line.split("|")]
        if len(fields) < 2:
            continue
        product = product_from_row({"medication": fields[0], "generic": fields[1], "strength": fields[2] if len(fields) > 2 else "", "dosage_form": fields[3] if len(fields) > 3 else "", "device": fields[4] if len(fields) > 4 else ""})
        records.append(Evidence(source_id=source.source_id, plan_name=source.plan_name, product=product, state="confirmed", source_row=str(line_number), observed_at=observed_at, source_version=source.source_version))
    return records


def load_source_manifest(path: Path) -> list[Source]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    rows = payload.get("sources") if isinstance(payload, dict) else payload
    if not isinstance(rows, list):
        raise ValueError("Manifest must contain a sources list")
    return [Source(**row) for row in rows]
