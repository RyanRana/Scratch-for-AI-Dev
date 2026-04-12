import { describe, it, expect } from "vitest";
import { parseImportPlanJson } from "./importPlan.js";

describe("parseImportPlanJson", () => {
  it("parses raw JSON", () => {
    const plan = parseImportPlanJson(
      '{"nodes":[{"blockId":"data-io.load-csv","parameters":{"file_path":"a.csv"}}],"edges":[]}'
    );
    expect(plan.nodes).toHaveLength(1);
    expect(plan.nodes[0].blockId).toBe("data-io.load-csv");
  });

  it("strips markdown fences", () => {
    const plan = parseImportPlanJson(
      '```json\n{"nodes":[{"blockId":"evaluation.accuracy"}],"edges":[]}\n```'
    );
    expect(plan.nodes[0].blockId).toBe("evaluation.accuracy");
  });
});
