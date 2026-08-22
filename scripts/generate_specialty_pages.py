#!/usr/bin/env python3
"""Generate static, PHI-free specialty demo subpages under public/specialty/.

Deterministic and offline: reads versioned seed JSON files in data/ and emits
static HTML. The pages are research previews with source-listed language only.
They never claim coverage, eligibility, approval, denial, payment, or advice,
and no outbound capability exists here.

Usage:
    python3 scripts/generate_specialty_pages.py            # build all seeds
    python3 scripts/generate_specialty_pages.py --check    # verify only
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEEDS = [
    {
        "slug": "dermatology",
        "seed": ROOT / "data" / "specialty-demo-dermatology-starter-v1.json",
        "tagline": "A scoped dermatology medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: 20 medication families, exact-row evidence pass complete",
        "evidence": ROOT / "data" / "dermatology-evidence-v1.json",
    },
    {
        "slug": "allergy-immunology",
        "seed": ROOT / "data" / "specialty-demo-allergy-immunology-starter-v1.json",
        "evidence": ROOT / "data" / "allergy-immunology-evidence-v1.json",
        "tagline": "A scoped allergy and immunology medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: committed-mapping evidence matrix complete; remaining families queued",
    },
    {
        "slug": "cardiology",
        "seed": ROOT / "data" / "specialty-demo-cardiology-starter-v1.json",
        "tagline": "A scoped cardiology medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "gastroenterology",
        "seed": ROOT / "data" / "specialty-demo-gastroenterology-starter-v1.json",
        "tagline": "A scoped gastroenterology medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
        {
        "slug": "rheumatology",
        "seed": ROOT / "data" / "specialty-demo-rheumatology-starter-v1.json",
        "tagline": "A scoped rheumatology medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
        {
        "slug": "neurology",
        "seed": ROOT / "data" / "specialty-demo-neurology-starter-v1.json",
        "tagline": "A scoped neurology medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
        {
        "slug": "infectious-disease",
        "seed": ROOT / "data" / "specialty-demo-infectious-disease-starter-v1.json",
        "tagline": "A scoped infectious disease medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
        {
        "slug": "nephrology",
        "seed": ROOT / "data" / "specialty-demo-nephrology-starter-v1.json",
        "tagline": "A scoped nephrology medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
        {
        "slug": "urology",
        "seed": ROOT / "data" / "specialty-demo-urology-starter-v1.json",
        "tagline": "A scoped urology medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
        {
        "slug": "ophthalmology",
        "seed": ROOT / "data" / "specialty-demo-ophthalmology-starter-v1.json",
        "tagline": "A scoped ophthalmology medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
        {
        "slug": "womens-health",
        "seed": ROOT / "data" / "specialty-demo-womens-health-starter-v1.json",
        "tagline": "A scoped women's health medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
        {
        "slug": "behavioral-health",
        "seed": ROOT / "data" / "specialty-demo-behavioral-health-starter-v1.json",
        "tagline": "A scoped behavioral health medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
        {
        "slug": "pain-management",
        "seed": ROOT / "data" / "specialty-demo-pain-management-starter-v1.json",
        "tagline": "A scoped pain management medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
        {
        "slug": "oral-oncology",
        "seed": ROOT / "data" / "specialty-demo-oral-oncology-starter-v1.json",
        "tagline": "A scoped oral oncology medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "endocrinology",
        "seed": ROOT / "data" / "specialty-demo-endocrinology-starter-v1.json",
        "tagline": "A scoped endocrinology and diabetes medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },    {
        "slug": "addiction-medicine",
        "seed": ROOT / "data/specialty-demo-addiction-medicine-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "anticoagulation-management",
        "seed": ROOT / "data/specialty-demo-anticoagulation-management-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "benign-hematology",
        "seed": ROOT / "data/specialty-demo-benign-hematology-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "osteoporosis-bone-health",
        "seed": ROOT / "data/specialty-demo-osteoporosis-bone-health-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "cystic-fibrosis",
        "seed": ROOT / "data/specialty-demo-cystic-fibrosis-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "family-medicine",
        "seed": ROOT / "data/specialty-demo-family-medicine-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "fertility",
        "seed": ROOT / "data/specialty-demo-fertility-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "geriatrics",
        "seed": ROOT / "data/specialty-demo-geriatrics-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "hiv-prep",
        "seed": ROOT / "data/specialty-demo-hiv-prep-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "weight-management",
        "seed": ROOT / "data/specialty-demo-weight-management-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "multiple-sclerosis",
        "seed": ROOT / "data/specialty-demo-multiple-sclerosis-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "otolaryngology",
        "seed": ROOT / "data/specialty-demo-otolaryngology-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "palliative-care",
        "seed": ROOT / "data/specialty-demo-palliative-care-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "pediatrics",
        "seed": ROOT / "data/specialty-demo-pediatrics-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "pmr-rehab",
        "seed": ROOT / "data/specialty-demo-pmr-rehab-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "post-acute-ltc",
        "seed": ROOT / "data/specialty-demo-post-acute-ltc-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "sickle-cell",
        "seed": ROOT / "data/specialty-demo-sickle-cell-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "sleep-medicine",
        "seed": ROOT / "data/specialty-demo-sleep-medicine-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "sports-medicine",
        "seed": ROOT / "data/specialty-demo-sports-medicine-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "transplant",
        "seed": ROOT / "data/specialty-demo-transplant-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
    {
        "slug": "wound-care",
        "seed": ROOT / "data/specialty-demo-wound-care-starter-v1.json",
        "tagline": "A scoped medication-access research preview for New Jersey clinics.",
        "status": "starter catalog: evidence pass not started; rows shown as candidates only",
    },
]

FORBIDDEN_CLAIMS = re.compile(
    r"\b(covered|coverage approved|eligible|eligibility|approved|guaranteed|reimbursed|will pay|denied)\b",
    re.IGNORECASE,
)

PAGE_TMPL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content="{description}" />
<style>
:root {{ color-scheme: light; }}
body {{ font-family: Georgia, 'Times New Roman', serif; margin: 0; background: #f6f1e7; color: #14213d; }}
main {{ max-width: 60rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }}
h1 {{ font-size: 2rem; margin: 0 0 .35rem; }}
h2 {{ font-size: 1.15rem; margin-top: 2rem; }}
.matrix th, .matrix td {{ font-size: .8rem; padding: .35rem .45rem; }}
.matrix td {{ font-family: ui-monospace, monospace; }}
.absent {{ color: #8a7f6a; }}
.badge {{ display: inline-block; font-family: ui-monospace, monospace; font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; background: #14213d; color: #f6f1e7; padding: .25rem .55rem; border-radius: 3px; }}
.note {{ background: #fffaf0; border: 1px solid #d8c4a0; padding: .9rem 1rem; border-radius: 6px; font-size: .95rem; }}
table {{ border-collapse: collapse; width: 100%; margin-top: 1rem; background: #fffdf8; }}
th, td {{ border: 1px solid #e0d5bd; padding: .5rem .65rem; text-align: left; vertical-align: top; font-size: .92rem; }}
th {{ background: #efe6d2; font-family: ui-monospace, monospace; font-size: .78rem; text-transform: uppercase; letter-spacing: .05em; }}
td.num {{ text-align: center; font-family: ui-monospace, monospace; }}
footer {{ margin-top: 3rem; font-size: .85rem; color: #5a5347; border-top: 1px solid #d8c4a0; padding-top: 1rem; }}
a {{ color: #0e366e; }}
</style>
</head>
<body>
<main>
<h1>{name}</h1>
<p><span class="badge">{badge}</span></p>
<p>{tagline}</p>
<div class="note">
<strong>Research preview.</strong> This page shows a bounded, PHI-free demo scope built from public payer sources. It is not a patient-specific benefit check, not a coverage determination, and not medical advice. Rows without exact evidence stay <em>unconfirmed</em>, which is never a denial. Exact-plan results always require the clinic's real plan list.
</div>
<h2>Plan families in scope</h2>
<table>
<tr><th>Plan family</th><th>Coverage type</th><th>Source state</th><th>Official source</th></tr>
{plan_rows}
</table>
<h2>Starter medication families ({med_count})</h2>
<table>
<tr><th>#</th><th>Medication family</th><th>Clinical bucket</th><th>Evidence posture</th></tr>
{med_rows}
</table>
{evidence_matrix}
<footer>
Formulary Finder is an evidence layer for medication access: AI should not make coverage decisions; it should make the evidence inspectable. In the full product, every confirmed mapping carries its official source URL, source date, and refresh owner; this static preview shows the scoped candidate set only. <a href="/specialty/">All specialty previews</a>.
</footer>
</main>
</body>
</html>
"""

MATRIX_TMPL = """
<h2>Exact-row evidence matrix</h2>
<p>Each cell is ingredient-level source-listing evidence from the official source named in the plan-families table. <strong>Listed</strong> shows published tier and restriction signals as printed. Not listed means no exact row exists in that source and is never a denial. Ambiguous means the source has candidates that cannot be resolved to one product without confirmation.</p>
<table class="matrix">
<tr><th>Medication family</th>{headers}</tr>
{rows}
</table>
<p>Plan-family sources are family-level baselines, not exact member benefits. Exact-plan results require the clinic&#8217;s real plan list.</p>
"""

INDEX_TMPL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Specialty research previews | Formulary Finder</title>
<meta name="description" content="Bounded, PHI-free specialty medication-access research previews." />
<style>
body {{ font-family: Georgia, serif; margin: 0; background: #f6f1e7; color: #14213d; }}
main {{ max-width: 48rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }}
h1 {{ font-size: 2rem; }}
li {{ margin: .75rem 0; }}
a {{ color: #0e366e; }}
</style>
</head>
<body>
<main>
<h1>Specialty research previews</h1>
<p>Each preview is a bounded, source-visible demo scope for one clinical specialty. Unconfirmed is not a denial.</p>
<ul>
{items}
</ul>
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


def render_evidence_matrix(evidence_path) -> str:
    if not evidence_path:
        return ""
    data = json.loads(evidence_path.read_text())
    keys = list(data["sources"].keys())
    headers = "".join(f"<th>{esc(data['sources'][k]['name'])}</th>" for k in keys)
    rows = []
    for fam in data["families"]:
        cells = []
        for k in keys:
            cell = fam["cells"].get(k)
            if cell is None or cell["s"] == "absent":
                cells.append('<td class="absent">Not listed</td>')
            elif cell["s"] == "ambiguous":
                cells.append(f"<td>Ambiguous: {esc(cell['d'])}</td>")
            elif cell["s"] == "needs-extraction":
                cells.append('<td class="absent">Unconfirmed: evidence pass not yet run for this source; not a denial.</td>')
            else:
                cells.append(f"<td>Listed: {esc(cell['d'])}</td>")
        rows.append(f"<tr><td>{esc(fam['display'])}</td>{''.join(cells)}</tr>")
    return MATRIX_TMPL.format(headers=headers, rows="\n".join(rows))


def render_specialty_page(entry: dict) -> str:
    seed = json.loads(entry["seed"].read_text())
    evidence_block = render_evidence_matrix(entry.get("evidence"))
    plan_rows = "\n".join(
        "<tr><td>{name}</td><td>{ctype}</td><td>{state}</td><td><a href=\"{url}\">official source</a></td></tr>".format(
            name=esc(plan["display_name"]),
            ctype=esc(plan["coverage_type"]),
            state=esc(plan["source_status"]),
            url=esc(plan["source_url"]),
        )
        for plan in seed["plan_families"]
    )
    med_rows = "\n".join(
        "<tr><td class=\"num\">{i}</td><td>{name}</td><td>{bucket}</td><td>Source-listed where an exact product row exists; otherwise unconfirmed, not a denial.</td></tr>".format(
            i=i + 1,
            name=esc(med["display_name"]),
            bucket=esc(med["clinical_bucket"]),
        )
        for i, med in enumerate(seed["medications"])
    )
    html = PAGE_TMPL.format(
        title=f"{seed['specialty']} research preview | Formulary Finder",
        description=f"Bounded, PHI-free {seed['specialty'].lower()} medication-access research preview.",
        badge=esc(entry["status"]),
        tagline=esc(entry["tagline"]),
        name=esc(f"{seed['specialty']} research preview"),
        plan_rows=plan_rows,
        med_count=len(seed["medications"]),
        med_rows=med_rows,
        evidence_matrix=evidence_block,
    )
    forbidden = FORBIDDEN_CLAIMS.search(
        html.replace("coverage determination", "")
        .replace("not a coverage", "")
        .replace("Coverage type", "")
        .replace("coverage type", "")
    )
    if forbidden:
        raise ValueError(f"Forbidden claim word in generated page: {forbidden.group(0)}")
    return html


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    index_root = ROOT / "public" / "specialty"
    items = []
    for entry in SEEDS:
        out_dir = index_root / entry["slug"]
        page = render_specialty_page(entry)
        target = out_dir / "index.html"
        if args.check:
            if not target.exists() or target.read_text() != page:
                raise SystemExit(f"Generated page is stale: {target}")
        else:
            out_dir.mkdir(parents=True, exist_ok=True)
            target.write_text(page)
        items.append(f"<li><a href=\"/specialty/{entry['slug']}/\">{esc(json.loads(entry['seed'].read_text())['specialty'])} research preview</a></li>")
    index_html = INDEX_TMPL.format(items="\n".join(items))
    index_target = index_root / "index.html"
    if args.check:
        if not index_target.exists() or index_target.read_text() != index_html:
            raise SystemExit(f"Generated index is stale: {index_target}")
    else:
        index_root.mkdir(parents=True, exist_ok=True)
        index_target.write_text(index_html)
    print(f"specialty pages {'verified' if args.check else 'generated'}: {len(SEEDS)} pages plus index")


if __name__ == "__main__":
    main()
