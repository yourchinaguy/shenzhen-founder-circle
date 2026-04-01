import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows requests under the limit", () => {
    const result = rateLimit("sfc-test-under", 3);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("rejects requests at the limit", () => {
    for (let i = 0; i < 3; i++) {
      rateLimit("sfc-test-at-limit", 3);
    }
    const result = rateLimit("sfc-test-at-limit", 3);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("allows requests after the 24-hour window expires", () => {
    for (let i = 0; i < 3; i++) {
      rateLimit("sfc-test-expiry", 3);
    }
    expect(rateLimit("sfc-test-expiry", 3).allowed).toBe(false);

    vi.advanceTimersByTime(25 * 60 * 60 * 1000); // 25 hours

    const result = rateLimit("sfc-test-expiry", 3);
    expect(result.allowed).toBe(true);
  });

  it("tracks different keys independently", () => {
    for (let i = 0; i < 3; i++) {
      rateLimit("sfc-key-a", 3);
    }
    expect(rateLimit("sfc-key-a", 3).allowed).toBe(false);
    expect(rateLimit("sfc-key-b", 3).allowed).toBe(true);
  });
});
