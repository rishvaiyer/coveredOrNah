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
        "status": "starter catalog: 20 products, evidence pass in progress",
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
<footer>
Formulary Finder is an evidence layer for medication access: AI should not make coverage decisions; it should make the evidence inspectable. Source dates, official URLs, and refresh ownership accompany every confirmed mapping. <a href="/specialty/">All specialty previews</a>.
</footer>
</main>
</body>
</html>
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


def render_specialty_page(entry: dict) -> str:
    seed = json.loads(entry["seed"].read_text())
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
        items.append(f"<li><a href=\"/specialty/{entry['slug']}/\">{esc(entry['seed_name'] if 'seed_name' in entry else json.loads(entry['seed'].read_text())['specialty'])} research preview</a></li>")
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
