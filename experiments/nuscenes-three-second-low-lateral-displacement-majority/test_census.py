"""Boundary and counterexample checks for the scientific measurement."""
import math
import unittest
from census import motion_metrics, quat_yaw


def poses(points, yaw=0):
    return [(x, y, yaw, i * 500000) for i, (x, y) in enumerate(points)]


class MeasurementChecks(unittest.TestCase):
    def test_rotation_invariance(self):
        original = [(i, i / 5) for i in range(7)]
        angle = 1.2
        rotated = [(x * math.cos(angle) - y * math.sin(angle) + 100,
                    x * math.sin(angle) + y * math.cos(angle) - 40) for x, y in original]
        a, b = motion_metrics(poses(original)), motion_metrics(poses(rotated, angle))
        for field in ("abs_endpoint_lateral_m", "max_abs_lateral_m", "path_length_m"):
            self.assertAlmostEqual(a[field], b[field])

    def test_strict_lateral_boundary(self):
        r = motion_metrics(poses([(i, i / 3) for i in range(7)]))
        self.assertEqual(r["abs_endpoint_lateral_m"], 2)
        self.assertFalse(r["primary_low_lateral"])

    def test_endpoint_can_hide_excursion(self):
        r = motion_metrics(poses([(0, 0), (1, 1), (2, 3), (3, 4), (4, 3), (5, 1), (6, 0)]))
        self.assertTrue(r["primary_low_lateral"])
        self.assertEqual(r["max_abs_lateral_m"], 4)
        self.assertTrue(r["endpoint_only_excursion"])

    def test_stopped_and_speed_bins(self):
        stopped = motion_metrics(poses([(0, 0)] * 7))
        low = motion_metrics(poses([(i / 4, 0) for i in range(7)]))
        moving = motion_metrics(poses([(i, 0) for i in range(7)]))
        self.assertEqual([r["motion_state"] for r in (stopped, low, moving)], ["stopped", "low_speed", "moving"])
        self.assertIsNone(stopped["crosscheck_gap_deg"])
        self.assertEqual(moving["crosscheck_gap_deg"], 0)

    def test_accumulated_crosscheck_detects_old_false_negative(self):
        points = [(0, 0)]
        for angle in (0, 10, -10, 10, -10, 0):
            x, y = points[-1]
            points.append((x + math.cos(math.radians(angle)), y + math.sin(math.radians(angle))))
        r = motion_metrics(poses(points))
        self.assertTrue(r["crosscheck_eligible"])
        self.assertAlmostEqual(r["crosscheck_gap_deg"], 80)

    def test_wrap_across_pi(self):
        p = [(i, 0, math.radians(v), i * 500000) for i, v in enumerate((179, -179, -177, -175, -173, -171, -169))]
        self.assertAlmostEqual(motion_metrics(p)["cum_yaw_deg"], 12)

    def test_timestamp_and_quaternion_validation(self):
        p = poses([(i, 0) for i in range(7)])
        p[3] = (*p[3][:3], p[2][3])
        with self.assertRaises(AssertionError):
            motion_metrics(p)
        with self.assertRaises(AssertionError):
            quat_yaw([2, 0, 0, 0])
        self.assertAlmostEqual(quat_yaw([math.cos(.3), 0, 0, math.sin(.3)]), .6)


if __name__ == "__main__":
    unittest.main()
