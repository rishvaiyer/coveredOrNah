#!/usr/bin/env python3
"""Generate the PHI-free PA tracker research preview at public/pa-tracker/index.html.

Deterministic and offline: reads the canonical lifecycle and the synthetic case
seed from data/ and emits one static HTML page. The page is a six-beat
storyboard whose Radar section is computed live from the synthetic case dates.
It is a research preview, not a coverage determination, and contains no PHI,
no outbound capability, and no fake interactivity.

Usage:
    python3 scripts/generate_pa_tracker_demo.py            # generate
    python3 scripts/generate_pa_tracker_demo.py --check    # verify byte-identical
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_LIFECYCLE = ROOT / "data" / "pa-tracker-lifecycle.json"
DEFAULT_CASES = ROOT / "data" / "pa-tracker-cases.synthetic.json"
DEFAULT_OUT = ROOT / "public" / "pa-tracker" / "index.html"

FORBIDDEN_STEMS = (
    "patient",
    "member",
    "subscriber",
    "mrn",
    "dob",
    "dateofbirth",
    "claim",
    "chartnote",
    "ssn",
)

RENEWAL_WALL_WINDOW_DAYS = 75
TERMINAL_STAGES = {"approved", "denied", "appeal_p2p", "filled", "renewal_due"}

PAGE_TMPL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>PA tracker research preview | Formulary Finder</title>
<meta name="description" content="A synthetic, PHI-free prior authorization tracker storyboard: canonical lifecycle, follow-up radar, and renewal loop." />
<style>
:root {{ color-scheme: light; }}
body {{ font-family: Georgia, 'Times New Roman', serif; margin: 0; background: #f6f1e7; color: #14213d; }}
main {{ max-width: 62rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }}
h1 {{ font-size: 2rem; margin: 0 0 .35rem; }}
h2 {{ font-size: 1.2rem; margin-top: 2.25rem; }}
h3 {{ font-size: 1rem; margin: 0 0 .5rem; }}
.badge {{ display: inline-block; font-family: ui-monospace, monospace; font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; background: #14213d; color: #f6f1e7; padding: .25rem .55rem; border-radius: 3px; }}
.note {{ background: #fffaf0; border: 1px solid #d8c4a0; padding: .9rem 1rem; border-radius: 6px; font-size: .95rem; }}
.beat {{ border-left: 4px solid #d8c4a0; padding-left: 1rem; }}
table {{ border-collapse: collapse; width: 100%; margin-top: 1rem; background: #fffdf8; }}
th, td {{ border: 1px solid #e0d5bd; padding: .45rem .55rem; text-align: left; vertical-align: top; font-size: .88rem; }}
th {{ background: #efe6d2; font-family: ui-monospace, monospace; font-size: .75rem; text-transform: uppercase; letter-spacing: .05em; }}
td.num, th.num {{ text-align: center; font-family: ui-monospace, monospace; }}
.radar-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); gap: 1rem; margin-top: 1rem; }}
.radar-card {{ background: #fffdf8; border: 1px solid #d8c4a0; border-radius: 6px; padding: 1rem; }}
.radar-card ul {{ list-style: none; margin: 0; padding: 0; font-size: .92rem; }}
.radar-card li {{ padding: .45rem 0; border-bottom: 1px dashed #e0d5bd; }}
.radar-card li:last-child {{ border-bottom: none; }}
.radar-empty {{ color: #5a5347; font-style: italic; }}
.unassigned {{ font-family: ui-monospace, monospace; font-weight: bold; color: #8c2f00; }}
.late {{ font-family: ui-monospace, monospace; font-weight: bold; color: #8c2f00; }}
.soon {{ font-family: ui-monospace, monospace; color: #7a5b00; }}
footer {{ margin-top: 3rem; font-size: .85rem; color: #5a5347; border-top: 1px solid #d8c4a0; padding-top: 1rem; }}
</style>
</head>
<body>
<main>
<h1>PA tracker research preview</h1>
<p><span class="badge">synthetic data</span> <span class="badge">research preview</span></p>
<p>A storyboard for a prior authorization case-and-follow-up layer at {clinic_name}, a fictional three-provider New Jersey clinic mixing pulmonology and dermatology. Every case on this page is invented. Nothing here is a coverage determination, a benefit check, or medical advice.</p>
<div class="note">
<strong>Truth language.</strong> All rows are synthetic. Unconfirmed is not a denial. Words like approved or denied below appear only as lifecycle stage labels of invented cases; this preview never states anything about any real person's benefits.
</div>

<h2 id="beat-wall">Beat 1: The wall today</h2>
<div class="beat">
<p>The whole board at a glance: every open synthetic PA case, its lifecycle stage, and who owns the next move.</p>
<table>
<tr><th>Case</th><th>Medication family</th><th>Plan family</th><th>Stage</th><th>Benefit</th><th>Payer ref</th><th class="num">Decision due</th><th class="num">Pend response due</th><th class="num">Auth expires</th><th>Owner</th></tr>
{case_rows}
</table>
</div>

<h2 id="beat-intake">Beat 2: New case intake</h2>
<div class="beat">
<p>In the product, starting a case means capturing three facts first: medication family, plan family, and pharmacy versus medical benefit. The tracker then shows which evidence the plan family is known to request, before anyone touches a chart. Intake stays structured and flat by design, so nothing patient-identifying ever needs to enter the tool.</p>
</div>

<h2 id="beat-evidence">Beat 3: Evidence assembly</h2>
<div class="beat">
<p>The product organizes chart-supported clinical justification against the payer's documented requests, and marks each item confirmed only when an official source is attached. Items without exact evidence stay marked unconfirmed, and unconfirmed is not a denial. Staff see what is missing instead of guessing.</p>
</div>

<h2 id="beat-submit">Beat 4: Submit and acknowledge</h2>
<div class="beat">
<p>On submission the tracker starts the payer clock: seven calendar days standard, seventy-two hours expedited, per CMS-0057-F timeframes effective starting 2026. When an acknowledgment and reference number arrive they are attached to the case. If the payer stays silent past the clock, the case surfaces on the radar below instead of quietly aging in an inbox.</p>
</div>

<h2 id="beat-radar">Beat 5: Radar</h2>
<div class="beat">
<p>Three card groups, computed directly from the synthetic case dates as of {today_iso}. This is the persuasive moment: nothing here requires anyone to remember a deadline.</p>
<div class="radar-grid">
{radar_cards}
</div>
</div>

<h2 id="beat-renewal">Beat 6: Outcome and renewal loop</h2>
<div class="beat">
<p>An outcome is not the end. Authorizations expire, renewals need runway, and a denied case opens a bounded appeal window. The product keeps those dates visible so the clinic acts before a gap between visits, and records why each denial happened so the next packet is stronger. Renewal runway default in this synthetic model: {renewal_runway} days before expiry.</p>
{renewal_table}
</div>

<footer>
Formulary Finder is an evidence layer for medication access: AI should not make coverage decisions; it should make the evidence inspectable. This page is a static, deterministic research preview built entirely from synthetic seed data under privacy mode {privacy_mode}. It is not a coverage determination and it describes no real benefits. <a href="/specialty/">All specialty previews</a>.
</footer>
</main>
</body>
</html>
"""


def esc(value: str) -> str:
    return (
        str(value)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def load_seeds(lifecycle_path: Path, cases_path: Path) -> tuple[dict, dict]:
    lifecycle = json.loads(lifecycle_path.read_text())
    cases_doc = json.loads(cases_path.read_text())
    return lifecycle, cases_doc


def normalize_key(key: str) -> str:
    return re.sub(r"[^a-z0-9]", "", key.lower())


def validate_no_forbidden_keys(mapping: dict, context: str) -> None:
    for key in mapping:
        normalized = normalize_key(key)
        for stem in FORBIDDEN_STEMS:
            if stem in normalized:
                raise ValueError(
                    f"forbidden key '{key}' in {context}: normalized form "
                    f"'{normalized}' contains PHI stem '{stem}'"
                )


def validate_cases(lifecycle: dict, cases_doc: dict) -> list[dict]:
    if cases_doc.get("schemaVersion") != 1:
        raise ValueError("cases document must declare schemaVersion 1")
    if cases_doc.get("synthetic") is not True:
        raise ValueError("cases document must set synthetic: true")
    if cases_doc.get("privacy_mode") != "phi_free_only":
        raise ValueError("cases document must set privacy_mode to phi_free_only")

    validate_no_forbidden_keys(cases_doc, "top level of cases document")

    stage_ids = {stage["id"] for stage in lifecycle["stages"]}
    seen_ids = set()
    for case in cases_doc["cases"]:
        validate_no_forbidden_keys(case, f"case {case.get('caseId', '?')}")
        if case["stage"] not in stage_ids:
            raise ValueError(
                f"case {case['caseId']} has unknown stage '{case['stage']}'; "
                f"valid stages: {sorted(stage_ids)}"
            )
        if case["caseId"] in seen_ids:
            raise ValueError(f"duplicate caseId {case['caseId']}")
        seen_ids.add(case["caseId"])
    return cases_doc["cases"]


def parse_date(value: str | None) -> date | None:
    if value is None:
        return None
    return date.fromisoformat(value)


def build_radar(cases: list[dict], today: date | None = None) -> dict:
    """Compute the three radar card groups from case data only."""
    if today is None:
        today = date.today()

    pend_deadlines = []
    silent_past_tat = []
    renewal_wall = []

    for case in cases:
        stage = case["stage"]

        if stage == "pended_more_info":
            due = parse_date(case["pendResponseDueAt"])
            if due is not None:
                days_left = (due - today).days
                owner = case["followUpOwner"]
                pend_deadlines.append(
                    {
                        "caseId": case["caseId"],
                        "medicationFamily": case["medicationFamily"],
                        "pendResponseDueAt": due,
                        "daysLeft": days_left,
                        "owner": owner,
                    }
                )

        if stage not in TERMINAL_STAGES:
            due = parse_date(case["decisionDueAt"])
            if due is not None and today > due:
                silent_past_tat.append(
                    {
                        "caseId": case["caseId"],
                        "medicationFamily": case["medicationFamily"],
                        "planFamily": case["planFamily"],
                        "decisionDueAt": due,
                        "daysOverdue": (today - due).days,
                    }
                )

        if stage == "approved":
            expiry = parse_date(case["authExpiresAt"])
            if expiry is not None:
                days_left = (expiry - today).days
                if 0 <= days_left <= RENEWAL_WALL_WINDOW_DAYS:
                    renewal_wall.append(
                        {
                            "caseId": case["caseId"],
                            "medicationFamily": case["medicationFamily"],
                            "authExpiresAt": expiry,
                            "daysLeft": days_left,
                        }
                    )

    pend_deadlines.sort(key=lambda item: item["pendResponseDueAt"])
    silent_past_tat.sort(key=lambda item: -item["daysOverdue"])
    renewal_wall.sort(key=lambda item: item["authExpiresAt"])

    return {
        "pend_deadlines": pend_deadlines,
        "silent_past_tat": silent_past_tat,
        "renewal_wall": renewal_wall,
    }


def render_case_row(case: dict, stage_labels: dict) -> str:
    def fmt(value: str | None) -> str:
        return esc(value) if value else "<span class=\"radar-empty\">none</span>"

    owner = case["followUpOwner"]
    owner_cell = (
        f'<span class="unassigned">UNASSIGNED</span>'
        if owner is None
        else esc(owner)
    )
    return (
        "<tr>"
        f"<td>{esc(case['caseId'])}</td>"
        f"<td>{esc(case['medicationFamily'])}</td>"
        f"<td>{esc(case['planFamily'])}</td>"
        f"<td>{esc(stage_labels[case['stage']])}</td>"
        f"<td>{esc(case['benefitType'])}</td>"
        f"<td>{fmt(case['payerReference'])}</td>"
        f"<td class=\"num\">{fmt(case['decisionDueAt'])}</td>"
        f"<td class=\"num\">{fmt(case['pendResponseDueAt'])}</td>"
        f"<td class=\"num\">{fmt(case['authExpiresAt'])}</td>"
        f"<td>{owner_cell}</td>"
        "</tr>"
    )


def render_radar_cards(radar: dict) -> str:
    cards = []

    cards.append('<div class="radar-card"><h3>Pend deadlines</h3><ul>')
    if radar["pend_deadlines"]:
        for item in radar["pend_deadlines"]:
            owner_html = (
                '<span class="unassigned">UNASSIGNED</span>'
                if item["owner"] is None
                else esc(item["owner"])
            )
            cards.append(
                f'<li data-radar-kind="pend">'
                f"{esc(item['caseId'])} {esc(item['medicationFamily'])}: "
                f"response due {item['pendResponseDueAt'].isoformat()} "
                f'(<span class="soon">{item["daysLeft"]} days left</span>), '
                f"owner {owner_html}</li>"
            )
    else:
        cards.append('<li class="radar-empty">No open pend responses.</li>')
    cards.append("</ul></div>")

    cards.append('<div class="radar-card"><h3>Silent past turnaround</h3><ul>')
    if radar["silent_past_tat"]:
        for item in radar["silent_past_tat"]:
            cards.append(
                f'<li data-radar-kind="silent">'
                f"{esc(item['caseId'])} {esc(item['medicationFamily'])} "
                f"({esc(item['planFamily'])}): no decision, due "
                f"{item['decisionDueAt'].isoformat()}, "
                f'<span class="late">{item["daysOverdue"]} days overdue</span>. '
                f"Silence is tracked, but unconfirmed is not a denial.</li>"
            )
    else:
        cards.append(
            '<li class="radar-empty">No case is past its decision clock.</li>'
        )
    cards.append("</ul></div>")

    cards.append('<div class="radar-card"><h3>Renewal wall</h3><ul>')
    if radar["renewal_wall"]:
        for item in radar["renewal_wall"]:
            cards.append(
                f'<li data-radar-kind="renewal">'
                f"{esc(item['caseId'])} {esc(item['medicationFamily'])}: "
                f"authorization ends {item['authExpiresAt'].isoformat()} "
                f'(<span class="soon">{item["daysLeft"]} days left</span>). '
                f"Renewal work should start before this date.</li>"
            )
    else:
        cards.append(
            '<li class="radar-empty">Nothing inside the renewal window yet.</li>'
        )
    cards.append("</ul></div>")

    return "\n".join(cards)


def render_renewal_table(cases: list[dict]) -> str:
    rows = []
    for case in cases:
        if case["authExpiresAt"]:
            reason = (
                esc(case["denialReason"])
                if case["denialReason"]
                else "<span class=\"radar-empty\">none</span>"
            )
            rows.append(
                "<tr>"
                f"<td>{esc(case['caseId'])}</td>"
                f"<td>{esc(case['medicationFamily'])}</td>"
                f"<td class=\"num\">{esc(case['authExpiresAt'])}</td>"
                f"<td>{reason}</td>"
                "</tr>"
            )
    if not rows:
        return ""
    return (
        "<table>"
        "<tr><th>Case</th><th>Medication family</th>"
        '<th class="num">Authorization ends</th>'
        "<th>Recorded denial reason, where one exists</th></tr>"
        + "".join(rows)
        + "</table>"
    )


def render_page(lifecycle: dict, cases_doc: dict, today: date) -> str:
    stage_labels = {stage["id"]: stage["label"] for stage in lifecycle["stages"]}
    cases = cases_doc["cases"]
    radar = build_radar(cases, today=today)

    clocks = lifecycle["clocks"]
    case_rows = "\n".join(render_case_row(case, stage_labels) for case in cases)

    return PAGE_TMPL.format(
        clinic_name=esc(cases_doc["clinic"]["displayName"]),
        privacy_mode=cases_doc["privacy_mode"],
        today_iso=today.isoformat(),
        case_rows=case_rows,
        radar_cards=render_radar_cards(radar),
        renewal_table=render_renewal_table(cases),
        renewal_runway=clocks["renewal_runway_days"],
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="verify byte-identical regeneration")
    parser.add_argument("--lifecycle", type=Path, default=DEFAULT_LIFECYCLE)
    parser.add_argument("--cases", type=Path, default=DEFAULT_CASES)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args(argv)

    lifecycle, cases_doc = load_seeds(args.lifecycle, args.cases)
    validate_cases(lifecycle, cases_doc)
    html = render_page(lifecycle, cases_doc, today=date.today())

    if args.check:
        if not args.out.exists():
            print(f"STALE: {args.out} does not exist; run the generator first", file=sys.stderr)
            return 1
        existing = args.out.read_bytes()
        if existing != html.encode("utf-8"):
            print(f"STALE: {args.out} does not match regenerated output", file=sys.stderr)
            return 1
        print(f"OK: {args.out} is current")
        return 0

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(html)
    print(f"wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
