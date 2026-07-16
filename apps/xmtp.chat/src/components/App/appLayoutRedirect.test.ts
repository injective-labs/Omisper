import { describe, expect, it } from "vitest";
import { getMissingClientRedirect } from "./appLayoutRedirect";

describe("getMissingClientRedirect", () => {
  it("returns the active application path when the XMTP client is lost", () => {
    expect(
      getMissingClientRedirect("/dev/conversations/abc", "?view=latest"),
    ).toBe("/dev/conversations/abc?view=latest");
  });

  it("does not preserve connection and disconnect routes", () => {
    expect(getMissingClientRedirect("/", "")).toBeNull();
    expect(getMissingClientRedirect("/disconnect", "")).toBeNull();
  });
});
