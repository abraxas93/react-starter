import { describe, expect, it } from "vitest";
import { environmentSchema } from "./env";

describe("environment validation", () => {
	it("enables mocks by default only in development", () => {
		expect(environmentSchema.parse({ DEV: true }).VITE_ENABLE_MOCK).toBe(true);
		expect(
			environmentSchema.parse({
				DEV: false,
				VITE_API_URL: "https://api.example.com",
			}),
		).toEqual({
			VITE_API_URL: "https://api.example.com",
			VITE_ENABLE_MOCK: false,
		});
	});

	it("rejects a production build with neither an API URL nor explicit mocks", () => {
		for (const raw of [
			{ DEV: false },
			{ DEV: false, VITE_API_URL: "", VITE_ENABLE_MOCK: "" },
			{ DEV: true, VITE_ENABLE_MOCK: "false" },
		]) {
			expect(environmentSchema.safeParse(raw).success).toBe(false);
		}
	});

	it("allows a production build that explicitly opts in to mocks", () => {
		expect(
			environmentSchema.parse({ DEV: false, VITE_ENABLE_MOCK: "true" })
				.VITE_ENABLE_MOCK,
		).toBe(true);
	});
});
