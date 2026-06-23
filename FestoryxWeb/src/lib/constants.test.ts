import {
  APP_NAME,
  APP_DESCRIPTION,
  EVENT_CODE_MAP,
  PAYMENT_STATUSES,
  REGISTRATION_STATUSES,
  PARTICIPATION_TYPES,
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
  ITEMS_PER_PAGE,
} from "./constants";

describe("constants", () => {
  it("exposes core app metadata", () => {
    expect(APP_NAME).toBe("Festoryx");
    expect(APP_DESCRIPTION).toContain("Event Management");
  });

  it("maps event categories to short codes", () => {
    expect(EVENT_CODE_MAP["hackathon"]).toBe("HACK");
    expect(EVENT_CODE_MAP["quiz"]).toBe("QUIZ");
  });

  it("defines status labels for payments and registrations", () => {
    expect(PAYMENT_STATUSES.APPROVED.label).toBe("Approved");
    expect(REGISTRATION_STATUSES.PENDING_VERIFICATION.label).toBe("Pending Verification");
  });

  it("defines participation types and upload constraints", () => {
    expect(PARTICIPATION_TYPES.SOLO.label).toBe("Solo");
    expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
    expect(ACCEPTED_IMAGE_TYPES).toContain("image/png");
    expect(ITEMS_PER_PAGE).toBe(10);
  });
});
