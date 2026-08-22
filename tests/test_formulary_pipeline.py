from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from dataclasses import replace
from pathlib import Path

from formulary_pipeline.adapters import parse_pdf_text, parse_tabular
from formulary_pipeline.match import match_products
from formulary_pipeline.models import Product, Source


SOURCE = Source(
    source_id="fixture-source",
    insurer="Fixture Payer",
    state="NJ",
    benefit_type="medicaid",
    plan_name="Fixture Plan",
    url="https://example.org/formulary.csv",
    source_type="full-machine-readable-feed",
    source_version="2026-08-19",
)


class PipelineTests(unittest.TestCase):
    def test_csv_ingestion_preserves_exact_product_and_restrictions(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "source.csv"
            path.write_text("medication,generic,strength,dosage_form,device,ndc,tier,pa,source_row\nAlbuterol HFA,albuterol,90 mcg,aerosol,inhaler,00000000001,2,yes,17\n", encoding="utf-8")
            rows = parse_tabular(SOURCE, path, "2026-08-19")
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0].product.ndc, "00000000001")
        self.assertEqual(rows[0].prior_authorization, "yes")
        self.assertEqual(rows[0].source_row, "17")

    def test_exact_match_does_not_confirm_strength_or_device_mismatch(self):
        evidence = parse_pdf_text(SOURCE, "# medication|generic|strength|form|device\nAlbuterol HFA|albuterol|90 mcg|aerosol|inhaler\n")
        result = match_products([Product(medication="albuterol", generic="albuterol", strength="108 mcg", dosage_form="aerosol", device="inhaler")], evidence)
        self.assertEqual(result.records[0].state, "unconfirmed")

    def test_exact_match_conflict_requires_review(self):
        evidence = parse_pdf_text(SOURCE, "Albuterol HFA|albuterol|90 mcg|aerosol|inhaler\n")
        evidence += parse_pdf_text(SOURCE, "Albuterol HFA|albuterol|90 mcg|aerosol|inhaler\n")
        evidence[1] = replace(evidence[1], tier="4")
        result = match_products([Product(medication="albuterol", generic="albuterol", strength="90 mcg", dosage_form="aerosol", device="inhaler")], evidence)
        self.assertEqual(result.records[0].state, "conflicting")

    def test_cli_ingest_and_audit(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "source.json"
            output = root / "ledger.json"
            report = root / "report.json"
            source.write_text(json.dumps({"rows": [{"medication": "Albuterol HFA", "generic": "albuterol", "strength": "90 mcg", "dosage_form": "aerosol", "device": "inhaler", "tier": "2"}]}), encoding="utf-8")
            subprocess.run([sys.executable, "-m", "formulary_pipeline", "ingest", "--input", str(source), "--output", str(output), "--source-type", "json", "--source-id", "fixture", "--insurer", "Fixture", "--state", "NJ", "--benefit-type", "medicaid", "--plan-name", "Fixture Plan", "--url", "https://example.org", "--source-version", "2026-08-19"], check=True, capture_output=True, text=True)
            subprocess.run([sys.executable, "-m", "formulary_pipeline", "audit", "--input", str(output), "--output", str(report)], check=True, capture_output=True, text=True)
            self.assertEqual(json.loads(report.read_text(encoding="utf-8"))["confirmed"], 1)

    def test_cli_match_writes_unconfirmed_for_missing_exact_product(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            evidence = root / "evidence.json"
            candidates = root / "candidates.json"
            output = root / "matched.json"
            evidence.write_text(json.dumps([{"source_id": "fixture", "plan_name": "Fixture Plan", "product": {"medication": "Albuterol HFA", "generic": "albuterol", "strength": "90 mcg", "dosage_form": "aerosol", "device": "inhaler"}, "state": "confirmed"}]), encoding="utf-8")
            candidates.write_text(json.dumps({"products": [{"medication": "albuterol", "generic": "albuterol", "strength": "108 mcg", "dosage_form": "aerosol", "device": "inhaler"}]}), encoding="utf-8")
            subprocess.run([sys.executable, "-m", "formulary_pipeline", "match", "--evidence", str(evidence), "--candidates", str(candidates), "--output", str(output)], check=True, capture_output=True, text=True)
            self.assertEqual(json.loads(output.read_text(encoding="utf-8"))[0]["state"], "unconfirmed")


if __name__ == "__main__":
    unittest.main()
