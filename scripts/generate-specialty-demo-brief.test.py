import importlib.util
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("generate-specialty-demo-brief.py")
SPEC = importlib.util.spec_from_file_location("demo_brief", SCRIPT)
demo_brief = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(demo_brief)


def config():
    medications = []
    for index in range(12):
        medications.append({
            "id": f"med-{index}",
            "display_name": f"Example medication {index}",
            "clinical_bucket": f"bucket-{index % 4}",
            "specialty_relevance": 5 - (index % 3),
            "service_line_match": 3,
            "public_condition_match": 2,
            "source_readiness": 4,
            "therapy_friction": 1,
            "requires_exact_product": True,
        })
    return {
        "clinic_display_name": "Example Pulmonary Clinic",
        "clinic_website_url": "https://example.invalid",
        "specialty": "Pulmonology",
        "region": {"state": "NJ"},
        "privacy_mode": "phi_free_only",
        "outbound_mode": "draft_only",
        "max_medication_families": 10,
        "plan_families": [{
            "id": "example-plan",
            "display_name": "Example Plan Family",
            "coverage_type": "commercial",
            "local_relevance": 4,
            "source_status": "public_current",
            "source_url": "https://example.invalid/formulary",
        }],
        "medications": medications,
    }


class SpecialtyDemoBriefTests(unittest.TestCase):
    def test_selects_bounded_diverse_medication_set(self):
        intake = config()
        demo_brief.validate_config(intake)
        selected = demo_brief.select_medications(intake)
        self.assertEqual(len(selected), 10)
        self.assertEqual(len({item["clinical_bucket"] for item in selected[:4]}), 4)

    def test_rejects_patient_data_key(self):
        intake = config()
        intake["patient_name"] = "Not allowed"
        with self.assertRaisesRegex(ValueError, "PHI-like"):
            demo_brief.validate_config(intake)

    def test_outputs_draft_only_and_safe_language(self):
        intake = config()
        selected = demo_brief.select_medications(intake)
        brief = demo_brief.markdown_brief(intake, selected, "2026-08-21T00:00:00+00:00")
        self.assertIn("draft-only", brief)
        self.assertIn("Do not send automatically", brief)
        self.assertIn("NOT SENT", brief)
        self.assertNotIn("guaranteed approval", brief.lower())


if __name__ == "__main__":
    unittest.main()
