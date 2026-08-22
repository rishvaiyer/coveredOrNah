#!/usr/bin/env python3
"""Deterministic checks for the PA tracker research preview generator."""

from __future__ import annotations

import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GENERATOR = ROOT / "scripts" / "generate_pa_tracker_demo.py"
OUT = ROOT / "public" / "pa-tracker" / "index.html"
CASES = ROOT / "data" / "pa-tracker-cases.synthetic.json"

EXPECTED_CASE_COUNT = 14
EXPECTED_SILENT = 3
EXPECTED_UNASSIGNED_PENDS = 2
EXPECTED_RENEWAL_WALL = 2


def _load_generator_module():
    spec = importlib.util.spec_from_file_location("generate_pa_tracker_demo", GENERATOR)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_check_passes_after_generation() -> None:
    subprocess.run([sys.executable, str(GENERATOR)], check=True)
    subprocess.run([sys.executable, str(GENERATOR), "--check"], check=True)


def test_all_cases_present_in_html() -> None:
    seed = json.loads(CASES.read_text())
    html = OUT.read_text()
    assert len(seed["cases"]) == EXPECTED_CASE_COUNT
    for case in seed["cases"]:
        assert case["caseId"] in html, f"missing {case['caseId']}"
        assert case["medicationFamily"] in html.replace("&amp;", "&"), (
            f"missing {case['medicationFamily']}"
        )


def test_radar_counts_match_expected() -> None:
    module = _load_generator_module()
    html = OUT.read_text()
    assert html.count('data-radar-kind="silent"') == EXPECTED_SILENT
    unassigned_pends = sum(
        1
        for item in module.build_radar(module.validate_cases(*module.load_seeds(
            ROOT / "data" / "pa-tracker-lifecycle.json", CASES
        )))["pend_deadlines"]
        if item["owner"] is None
    )
    assert unassigned_pends == EXPECTED_UNASSIGNED_PENDS
    radar_html = html[html.index('id="beat-radar"'):]
    radar_section = radar_html[: radar_html.index('id="beat-renewal"')]
    assert radar_section.count('data-radar-kind="pend"') == EXPECTED_UNASSIGNED_PENDS
    assert radar_section.count('data-radar-kind="renewal"') == EXPECTED_RENEWAL_WALL


def test_phi_stem_probe_fails_closed() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        cases_doc = json.loads(CASES.read_text())
        cases_doc["cases"][0]["patient_name"] = "Injected Probe"
        poisoned = tmp_path / "poisoned.json"
        poisoned.write_text(json.dumps(cases_doc))
        out = tmp_path / "out.html"
        result = subprocess.run(
            [
                sys.executable,
                str(GENERATOR),
                "--cases",
                str(poisoned),
                "--lifecycle",
                str(ROOT / "data" / "pa-tracker-lifecycle.json"),
                "--out",
                str(out),
            ],
            capture_output=True,
            text=True,
        )
        assert result.returncode != 0, "generator accepted a patient_name key"
        assert "ValueError" in result.stderr
        assert "patient" in result.stderr
        assert not out.exists(), "no page should be written on validation failure"


def test_no_banned_overclaim_strings() -> None:
    html = OUT.read_text().lower()
    banned = ["is covered", "guaranteed", "eligible for"]
    for phrase in banned:
        assert phrase not in html, f"overclaim phrase '{phrase}' in generated HTML"


def test_truth_language_present() -> None:
    html = OUT.read_text()
    for marker in ("synthetic", "research preview", "not a coverage determination", "Unconfirmed is not a denial"):
        assert marker in html, f"missing truth language: {marker}"


if __name__ == "__main__":
    test_check_passes_after_generation()
    test_all_cases_present_in_html()
    test_radar_counts_match_expected()
    test_phi_stem_probe_fails_closed()
    test_no_banned_overclaim_strings()
    test_truth_language_present()
    print("pa tracker generator tests: 6/6 passed")
