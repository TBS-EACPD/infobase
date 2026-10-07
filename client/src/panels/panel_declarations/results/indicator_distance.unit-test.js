import _ from "lodash";

import {
  bin_for_distance,
  build_departmental_result_distance_chart,
  count_indicators_by_distance,
  indicator_distance,
} from "./indicator_distance";

const indicator = (overrides) => ({
  target_type: "percent",
  seeking_to: "max",
  target_min: "100",
  target_max: "",
  actual_result: "100",
  status_key: "met",
  previous_year_target_type: "percent",
  result_id: "result-1",
  result_name: "Result one",
  parent_id: "cr-1",
  parent_name: "Core responsibility one",
  ...overrides,
});

describe("indicator_distance", () => {
  it("measures a minimum target as how far the result is above the target", () => {
    expect(indicator_distance(indicator({ actual_result: "120" }))).toBe(20);
    expect(indicator_distance(indicator({ actual_result: "80" }))).toBe(-20);
    expect(indicator_distance(indicator({ actual_result: "100" }))).toBe(0);
  });

  it("measures a maximum target as how far the result is below the target", () => {
    const maximum = {
      seeking_to: "min",
      target_min: "",
      target_max: "10",
    };
    expect(
      indicator_distance(indicator({ ...maximum, actual_result: "8" }))
    ).toBe(20);
    expect(
      indicator_distance(indicator({ ...maximum, actual_result: "12" }))
    ).toBe(-20);
    expect(
      indicator_distance(indicator({ ...maximum, actual_result: "10" }))
    ).toBe(0);
  });

  it("sets a range to zero inside the bounds and measures the missed bound outside", () => {
    const range = {
      target_type: "num",
      seeking_to: "range",
      target_min: "3.6",
      target_max: "5",
    };
    expect(
      indicator_distance(indicator({ ...range, actual_result: "4.02" }))
    ).toBe(0);
    expect(
      indicator_distance(
        indicator({ ...range, actual_result: "3.5", status_key: "not_met" })
      )
    ).toBeCloseTo(-2.777, 2);
    expect(
      indicator_distance(
        indicator({ ...range, actual_result: "6", status_key: "not_met" })
      )
    ).toBe(-20);
  });

  it("treats an exact target the same way as a range", () => {
    const exact = {
      seeking_to: "target",
      target_min: "100",
      target_max: "100",
    };
    expect(
      indicator_distance(indicator({ ...exact, actual_result: "100" }))
    ).toBe(0);
    expect(
      indicator_distance(
        indicator({ ...exact, actual_result: "90", status_key: "not_met" })
      )
    ).toBe(-10);
  });

  it("sends a missed zero target to the not-met overflow", () => {
    expect(
      indicator_distance(
        indicator({
          seeking_to: "max",
          target_min: "0",
          actual_result: "-1",
          status_key: "not_met",
        })
      )
    ).toBe("overflow_not_met");
    expect(
      indicator_distance(
        indicator({
          seeking_to: "max",
          target_min: "0",
          actual_result: "0",
        })
      )
    ).toBe(0);
    expect(
      indicator_distance(
        indicator({
          seeking_to: "min",
          target_min: "",
          target_max: "0",
          actual_result: "3",
          status_key: "not_met",
        })
      )
    ).toBe("overflow_not_met");
    expect(
      indicator_distance(
        indicator({
          seeking_to: "min",
          target_min: "",
          target_max: "0",
          actual_result: "0",
        })
      )
    ).toBe(0);
    expect(
      indicator_distance(
        indicator({
          seeking_to: "target",
          target_min: "0",
          target_max: "0",
          actual_result: "2",
          status_key: "not_met",
        })
      )
    ).toBe("overflow_not_met");
    expect(
      indicator_distance(
        indicator({
          seeking_to: "target",
          target_min: "0",
          target_max: "0",
          actual_result: "0",
        })
      )
    ).toBe(0);
  });

  it("leaves out non-numeric indicators, type switches, and indicators without a numeric result", () => {
    expect(indicator_distance(indicator({ target_type: "text" }))).toBeNull();
    expect(
      indicator_distance(
        indicator({
          target_type: "percent",
          previous_year_target_type: "text",
        })
      )
    ).toBeNull();
    expect(
      indicator_distance(
        indicator({
          target_type: "text",
          previous_year_target_type: "percent",
        })
      )
    ).toBeNull();
    expect(
      indicator_distance(indicator({ previous_year_target_type: null }))
    ).toBe(0);
    expect(
      indicator_distance(
        indicator({ status_key: "not_available", actual_result: "nan" })
      )
    ).toBeNull();
    expect(indicator_distance(indicator({ status_key: "future" }))).toBeNull();
  });
});

describe("bin_for_distance", () => {
  it("assigns the agreed bands, with overflow at both ends", () => {
    expect(bin_for_distance(-100)).toBe("lte_neg_100");
    expect(bin_for_distance(-150)).toBe("lte_neg_100");
    expect(bin_for_distance("overflow_not_met")).toBe("lte_neg_100");
    expect(bin_for_distance(-90)).toBe("neg_90");
    expect(bin_for_distance(-80)).toBe("neg_80");
    expect(bin_for_distance(-70)).toBe("neg_70");
    expect(bin_for_distance(-60)).toBe("neg_60");
    expect(bin_for_distance(-50)).toBe("neg_50");
    expect(bin_for_distance(-40)).toBe("neg_40");
    expect(bin_for_distance(-30)).toBe("neg_30");
    expect(bin_for_distance(-20)).toBe("neg_20");
    expect(bin_for_distance(-10)).toBe("neg_10");
    expect(bin_for_distance(-0.1)).toBe("neg_10");
    expect(bin_for_distance(0)).toBe("met");
    expect(bin_for_distance(10)).toBe("pos_10");
    expect(bin_for_distance(20)).toBe("pos_20");
    expect(bin_for_distance(30)).toBe("pos_30");
    expect(bin_for_distance(40)).toBe("pos_40");
    expect(bin_for_distance(50)).toBe("pos_50");
    expect(bin_for_distance(60)).toBe("pos_60");
    expect(bin_for_distance(70)).toBe("pos_70");
    expect(bin_for_distance(80)).toBe("pos_80");
    expect(bin_for_distance(90)).toBe("pos_90");
    expect(bin_for_distance(99)).toBe("pos_90");
    expect(bin_for_distance(100)).toBe("gte_pos_100");
  });
});

describe("build_departmental_result_distance_chart", () => {
  it("counts numeric indicators on each core responsibility and drops empty rows", () => {
    const chart = build_departmental_result_distance_chart([
      indicator({ actual_result: "80", status_key: "not_met" }),
      indicator({
        result_id: "result-2",
        result_name: "Another result under the same core responsibility",
        actual_result: "100",
      }),
      indicator({ target_type: "text", actual_result: "narrative" }),
      indicator({
        result_id: "result-3",
        result_name: "Result under a second core responsibility",
        parent_id: "cr-2",
        parent_name: "Core responsibility two",
        seeking_to: "min",
        target_min: "",
        target_max: "0",
        actual_result: "4",
        status_key: "not_met",
      }),
      indicator({
        result_id: "result-4",
        result_name: "Narrative only",
        parent_id: "cr-3",
        parent_name: "Core responsibility three",
        target_type: "text",
      }),
    ]);

    expect(chart.total_count).toBe(5);
    expect(chart.included_count).toBe(3);
    expect(chart.rows).toEqual([
      {
        id: "cr-1",
        name: "Core responsibility one",
        counts: expect.objectContaining({
          neg_20: 1,
          met: 1,
        }),
      },
      {
        id: "cr-2",
        name: "Core responsibility two",
        counts: expect.objectContaining({
          lte_neg_100: 1,
        }),
      },
    ]);
  });
});

describe("count_indicators_by_distance", () => {
  it("counts plottable indicators and leaves the rest out", () => {
    const summary = count_indicators_by_distance([
      indicator({ actual_result: "100" }),
      indicator({ actual_result: "80", status_key: "not_met" }),
      indicator({ target_type: "text", actual_result: "narrative" }),
    ]);

    expect(summary.total_count).toBe(3);
    expect(summary.included_count).toBe(2);
    expect(summary.counts.met).toBe(1);
    expect(summary.counts.neg_20).toBe(1);
    expect(_.sum(_.values(summary.counts))).toBe(2);
  });
});
