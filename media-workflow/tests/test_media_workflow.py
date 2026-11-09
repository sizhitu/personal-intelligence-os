import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).parents[1] / "scripts" / "generate_shorts.py"
SPEC = importlib.util.spec_from_file_location("generate_shorts", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

class TimestampTests(unittest.TestCase):
    def test_srt_timestamp_round_trip(self):
        value = "00:01:02,345"
        self.assertAlmostEqual(MODULE.stamp_seconds(value), 62.345, places=3)
        self.assertEqual(MODULE.format_stamp(62.345), value)

    def test_parse_srt(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "zh.srt"
            path.write_text("1\n00:00:05,000 --> 00:00:07,000\n第一句\n\n2\n00:00:09,000 --> 00:00:11,000\n第二句\n", encoding="utf-8")
            cues = MODULE.parse_srt(path)
            self.assertEqual(len(cues), 2)
            self.assertEqual(cues[0][0], 5.0)
            self.assertEqual(cues[1][2], "第二句")

if __name__ == "__main__":
    unittest.main()
