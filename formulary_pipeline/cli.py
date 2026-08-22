from __future__ import annotations

import argparse
import json
from pathlib import Path

from .adapters import load_source_manifest, parse_pdf_text, parse_tabular
from .match import match_products
from .models import Evidence, Ledger, Product, Source


def _source(args) -> Source:
    return Source(source_id=args.source_id, insurer=args.insurer, state=args.state, benefit_type=args.benefit_type, plan_name=args.plan_name, url=args.url, source_type=args.source_type, source_version=args.source_version, scope=args.scope, refresh_days=args.refresh_days)


def cmd_discover(args) -> int:
    for source in load_source_manifest(Path(args.manifest)):
        if args.state and source.state.lower() != args.state.lower():
            continue
        print(json.dumps(source.__dict__, sort_keys=True))
    return 0


def cmd_ingest(args) -> int:
    source = _source(args)
    path = Path(args.input)
    if args.source_type == "pdf-text":
        records = parse_pdf_text(source, path.read_text(encoding="utf-8"), args.observed_at)
    else:
        records = parse_tabular(source, path, args.observed_at)
    Path(args.output).write_text(json.dumps([record.to_dict() for record in records], indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"source_id": source.source_id, "records": len(records), "output": args.output}))
    return 0


def cmd_audit(args) -> int:
    payload = json.loads(Path(args.input).read_text(encoding="utf-8"))
    records = []
    for row in payload:
        record = dict(row)
        record["product"] = Product(**record["product"])
        records.append(Evidence(**record))
    report = Ledger(records).summary()
    if args.output:
        Path(args.output).write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0


def cmd_match(args) -> int:
    evidence_payload = json.loads(Path(args.evidence).read_text(encoding="utf-8"))
    evidence = []
    for row in evidence_payload:
        record = dict(row)
        record["product"] = Product(**record["product"])
        evidence.append(Evidence(**record))
    candidates_payload = json.loads(Path(args.candidates).read_text(encoding="utf-8"))
    candidates_rows = candidates_payload.get("products") if isinstance(candidates_payload, dict) else candidates_payload
    candidates = [Product(**row) for row in candidates_rows]
    ledger = match_products(candidates, evidence)
    Path(args.output).write_text(json.dumps([record.to_dict() for record in ledger.records], indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"candidates": len(candidates), "records": len(ledger.records), "output": args.output}))
    return 0


def parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="formulary-pipeline")
    sub = parser.add_subparsers(dest="command", required=True)
    discover = sub.add_parser("discover", help="List configured sources")
    discover.add_argument("--manifest", required=True)
    discover.add_argument("--state")
    discover.set_defaults(func=cmd_discover)

    ingest = sub.add_parser("ingest", help="Parse one official source artifact")
    ingest.add_argument("--input", required=True)
    ingest.add_argument("--output", required=True)
    ingest.add_argument("--source-type", choices=["csv", "tsv", "json", "pdf-text"], required=True)
    ingest.add_argument("--source-id", required=True)
    ingest.add_argument("--insurer", required=True)
    ingest.add_argument("--state", required=True)
    ingest.add_argument("--benefit-type", required=True)
    ingest.add_argument("--plan-name", required=True)
    ingest.add_argument("--url", required=True)
    ingest.add_argument("--source-version", required=True)
    ingest.add_argument("--scope", default="")
    ingest.add_argument("--refresh-days", type=int, default=90)
    ingest.add_argument("--observed-at", default="")
    ingest.set_defaults(func=cmd_ingest)

    audit = sub.add_parser("audit", help="Summarize an evidence ledger")
    audit.add_argument("--input", required=True)
    audit.add_argument("--output")
    audit.set_defaults(func=cmd_audit)

    match = sub.add_parser("match", help="Match exact product candidates to an evidence ledger")
    match.add_argument("--evidence", required=True)
    match.add_argument("--candidates", required=True)
    match.add_argument("--output", required=True)
    match.set_defaults(func=cmd_match)
    return parser


def main() -> int:
    args = parser().parse_args()
    return args.func(args)
