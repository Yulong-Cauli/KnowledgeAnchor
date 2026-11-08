import unittest
from profile_stats import average_speed, past_speed, describe, full_ecdf, group_result


class ProfileChecks(unittest.TestCase):
    def test_average_speed_uses_path_and_real_time(self):
        self.assertEqual(average_speed({"path_length_m": 12, "horizon_seconds": 2.4}), 5)

    def test_start_speed_uses_past_only_and_real_time(self):
        self.assertEqual(past_speed((0, 0, 0, 0), (3, 4, 0, 250000)), (20, .25))
        self.assertEqual(past_speed(None, (3, 4, 0, 250000)), (None, None))
        with self.assertRaises(AssertionError):
            past_speed((0, 0, 0, 250000), (3, 4, 0, 250000))

    def test_quantiles_interpolate_and_missing_is_not_zero(self):
        values = describe([0, 10, 20, 30, None])
        self.assertEqual(values['n'], 4)
        self.assertEqual(values['p50'], 15)
        self.assertEqual(values['p25'], 7.5)
        self.assertEqual(describe([])['n'], 0)
        self.assertIsNone(describe([None])['mean'])

    def test_ecdf_distinguishes_strict_and_inclusive(self):
        rows = full_ecdf([0, 2, 2, 3, None])
        self.assertEqual(rows[1]['count_lt'], 1)
        self.assertEqual(rows[1]['count_le'], 3)
        self.assertEqual(rows[1]['n'], 4)

    def test_speed_bins_left_closed_right_open_and_no_missing_zero(self):
        rows = [dict(scene='s', start_speed_mps=v, abs_endpoint_lateral_m=2, max_abs_lateral_m=2) for v in [0, .5, 2, None]]
        group = group_result(rows, 'all', 'start_speed_mps', 'bin', .5, 2)
        self.assertEqual(group['n'], 1)
        self.assertEqual(group['eligible_n'], 3)
        self.assertEqual(group['missing_speed_n'], 1)
        self.assertEqual(group['endpoint_lt_2m_count'], 0)
        empty = group_result(rows, 'all', 'start_speed_mps', 'bin', 10, 15)
        self.assertEqual(empty['n'], 0)
        self.assertIsNone(empty['endpoint_p50_m'])


if __name__ == '__main__':
    unittest.main()
