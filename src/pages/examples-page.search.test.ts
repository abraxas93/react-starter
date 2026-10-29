import { describe, expect, it } from "vitest";
import { examplesSearchSchema } from "./examples-page.search";

describe("example search validation", () => {
	it("normalizes absent, non-string, and oversized input", () => {
		for (const q of [undefined, 12, ["routing"], "x".repeat(101)]) {
			expect(examplesSearchSchema.parse({ q })).toEqual({ q: "" });
		}
	});
	it("keeps a valid search and strips unrelated parameters", () => {
		expect(
			examplesSearchSchema.parse({ q: "routing", unrelated: true }),
		).toEqual({ q: "routing" });
	});
});
