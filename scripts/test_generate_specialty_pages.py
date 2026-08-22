#!/usr/bin/env python3
"""Deterministic checks for the specialty demo subpages."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DERM = ROOT / "public" / "specialty" / "dermatology" / "index.html"
INDEX = ROOT / "public" / "specialty" / "index.html"
SEED = ROOT / "data" / "specialty-demo-dermatology-starter-v1.json"


def test_pages_exist_and_are_current() -> None:
    subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "generate_specialty_pages.py"), "--check"],
        check=True,
    )


def test_dermatology_page_lists_full_seed_and_safe_language() -> None:
    seed = json.loads(SEED.read_text())
    html = DERM.read_text()
    for medication in seed["medications"]:
        assert medication["display_name"] in html, f"missing {medication['display_name']}"
    assert "unconfirmed" in html and "not a denial" in html
    assert "Research preview" in html
    for plan in seed["plan_families"]:
        assert plan["display_name"].replace("&", "&amp;") in html
        assert plan["source_url"] in html


def test_no_overclaim_language_on_generated_pages() -> None:
    banned = [" is covered", " approved for", " eligible for", " guaranteed", " will pay"]
    for page in (DERM, INDEX):
        text = page.read_text().lower()
        for phrase in banned:
            assert phrase not in text, f"overclaim phrase '{phrase}' in {page.name}"


def test_derm_page_has_full_evidence_matrix() -> None:
    import json
    data = json.loads((ROOT / "data" / "dermatology-evidence-v1.json").read_text())
    html = DERM.read_text()
    assert "Exact-row evidence matrix" in html
    for fam in data["families"]:
        assert fam["display"] in html
    listed = sum(1 for f in data["families"] for c in f["cells"].values() if c["s"] == "listed")
    absent = sum(1 for f in data["families"] for c in f["cells"].values() if c["s"] == "absent")
    assert html.count('class="absent">Not listed<') == absent
    assert listed + absent + sum(1 for f in data["families"] for c in f["cells"].values() if c["s"] == "ambiguous") == 100


def test_index_links_all_specialties() -> None:
    html = INDEX.read_text()
    assert "/specialty/dermatology/" in html


if __name__ == "__main__":
    test_pages_exist_and_are_current()
    test_dermatology_page_lists_full_seed_and_safe_language()
    test_no_overclaim_language_on_generated_pages()
    test_derm_page_has_full_evidence_matrix()
    test_index_links_all_specialties()
    print("specialty page tests: 5/5 passed")
