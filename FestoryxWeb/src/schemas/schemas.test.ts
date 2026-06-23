import { eventSchema } from "./event.schema";
import { registrationSchema } from "./registration.schema";
import { settingsSchema } from "./settings.schema";
import { loginSchema } from "./auth.schema";

describe("schemas validation", () => {
  describe("eventSchema", () => {
    it("validates correct event data", () => {
      const result = eventSchema.safeParse({
        name: "Test Event",
        slug: "test-event",
        description: "This is a detailed description of the test event.",
        participationType: "SOLO",
      });
      expect(result.success).toBe(true);
    });

    it("fails for short descriptions or invalid slugs", () => {
      const result = eventSchema.safeParse({
        name: "A",
        slug: "Test Event",
        description: "Short",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registrationSchema", () => {
    it("validates correct registration data", () => {
      const result = registrationSchema.safeParse({
        participantName: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        collegeName: "Test University",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("settingsSchema", () => {
    it("validates correct settings data", () => {
      const result = settingsSchema.safeParse({
        siteName: "Festoryx",
        contactEmail: "admin@example.com",
        contactPhone: "9876543210",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("loginSchema", () => {
    it("validates correct login credentials", () => {
      const result = loginSchema.safeParse({
        email: "admin@festoryx.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("fails for invalid email", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });
  });
});
