import importlib.util
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("run-pa-voice-sandbox.py")
SPEC = importlib.util.spec_from_file_location("voice_sandbox", SCRIPT)
voice_sandbox = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(voice_sandbox)


def case():
    return {
        "case_id": "syn_pa_001",
        "synthetic": True,
        "mode": "synthetic_local_only",
        "human_approved": True,
        "settings": {
            "provider": "mock",
            "external_network": False,
            "real_calls": False,
            "inbound_calls": False,
            "transfers": False,
            "recording": False,
            "audio_storage": False,
            "follow_up_execution": "internal_task_only",
            "require_disclosure": True,
            "require_human_review": True,
        },
    }


class VoiceSandboxTests(unittest.TestCase):
    def test_pending_creates_only_internal_follow_up(self):
        result = voice_sandbox.run_simulation(case(), "pending")
        self.assertEqual(result["final_state"], "follow_up_due")
        self.assertEqual(result["network_requests"], 0)
        self.assertFalse(result["real_call_placed"])
        self.assertFalse(result["external_follow_up_sent"])
        self.assertEqual(result["events"][1]["event"], "synthetic_disclosure_played")

    def test_real_call_flag_fails_closed(self):
        fixture = case()
        fixture["settings"]["real_calls"] = True
        with self.assertRaisesRegex(ValueError, "real_calls"):
            voice_sandbox.run_simulation(fixture, "pending")

    def test_phone_like_input_fails_closed(self):
        fixture = case()
        fixture["note"] = "call 212-555-0100"
        with self.assertRaisesRegex(ValueError, "Phone-like"):
            voice_sandbox.run_simulation(fixture, "pending")


if __name__ == "__main__":
    unittest.main()
