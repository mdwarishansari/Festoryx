import {
  slugify,
  truncateText,
  getInitials,
  getOrgTypeEmoji,
  getPublicIdFromUrl,
  cn,
  formatCurrency,
  serializePrisma,
  formatToISTInputString,
  formatDateTimeIST,
  formatDateIST,
  parseToISTDate,
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from "./utils";

describe("cn utility", () => {
  it("combines class names correctly", () => {
    expect(cn("bg-red-500", "text-white")).toContain("bg-red-500 text-white");
  });
});

describe("slugify", () => {
  it("matches expected output", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
    expect(slugify("Festoryx - OS & Quiz Arena")).toBe("festoryx---os-quiz-arena");
    expect(slugify("   Trim-Me   ")).toBe("trim-me");
  });
});

describe("truncateText", () => {
  it("cuts off and adds ellipses", () => {
    expect(truncateText("Hello World", 5)).toBe("Hello...");
    expect(truncateText("Short", 10)).toBe("Short");
  });
});

describe("getInitials", () => {
  it("returns uppercase first letters", () => {
    expect(getInitials("Md Warish Ansari")).toBe("MW");
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Single")).toBe("S");
  });
});

describe("getOrgTypeEmoji", () => {
  it("returns correct emoji", () => {
    expect(getOrgTypeEmoji("college")).toBe("🎓");
    expect(getOrgTypeEmoji("university")).toBe("🎓");
    expect(getOrgTypeEmoji("company")).toBe("💼");
    expect(getOrgTypeEmoji("startup")).toBe("💼");
    expect(getOrgTypeEmoji("community")).toBe("🌐");
    expect(getOrgTypeEmoji("club")).toBe("👥");
    expect(getOrgTypeEmoji("unknown")).toBe("🏢");
  });
});

describe("getPublicIdFromUrl", () => {
  it("parses Cloudinary URL correctly", () => {
    const url = "https://res.cloudinary.com/demo/image/upload/v1570975200/sample.jpg";
    expect(getPublicIdFromUrl(url)).toBe("sample");
    expect(getPublicIdFromUrl(null)).toBeNull();
    expect(getPublicIdFromUrl("invalid-url")).toBeNull();
  });

  it("handles URLs without version segment and parse errors", () => {
    const noVersion = "https://res.cloudinary.com/demo/image/upload/folder/asset.png";
    expect(getPublicIdFromUrl(noVersion)).toBe("folder/asset");

    const malformed = "https://res.cloudinary.com/demo/image/upload/";
    expect(getPublicIdFromUrl(malformed)).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats standard numbers to INR", () => {
    expect(formatCurrency(100)).toContain("100");
  });
});

describe("serializePrisma", () => {
  it("serializes dates and decimals", () => {
    const dateObj = new Date("2026-06-23T12:00:00Z");
    const testData = {
      id: "1",
      amount: { toNumber: () => 150.5 },
      createdAt: dateObj,
      nested: {
        updatedAt: dateObj,
      },
    };
    const result = serializePrisma(testData);
    expect(result.amount).toBe(150.5);
    expect(result.createdAt).toEqual(dateObj);
    expect(result.nested.updatedAt).toEqual(dateObj);
  });

  it("handles null, arrays, and primitives", () => {
    expect(serializePrisma(null)).toBeNull();
    expect(serializePrisma(undefined)).toBeUndefined();
    expect(serializePrisma("hello")).toBe("hello");
    expect(serializePrisma([{ amount: { toNumber: () => 10 } }])).toEqual([{ amount: 10 }]);
  });
});

describe("date formatting wrappers", () => {
  it("delegates formatDate and formatDateTime to IST helpers", () => {
    const d = new Date("2026-06-23T12:00:00Z");
    expect(formatDate(d)).toContain("2026");
    expect(formatDateTime(d)).toContain("2026");
  });

  it("returns relative time strings", () => {
    const recent = new Date(Date.now() - 60_000);
    expect(formatRelativeTime(recent)).toMatch(/minute|second|ago/i);
  });
});

describe("IST Date helpers", () => {
  it("formats to IST input string", () => {
    const d = new Date("2026-06-23T12:00:00Z"); // 12:00 UTC = 17:30 IST
    const str = formatToISTInputString(d);
    expect(str).toBe("2026-06-23T17:30");
    expect(formatToISTInputString(null)).toBe("");
  });

  it("formats date to IST string format", () => {
    const d = new Date("2026-06-23T12:00:00Z");
    expect(formatDateIST(d)).toContain("2026");
    expect(formatDateIST(null)).toBe("");
  });

  it("formats date & time to IST string format", () => {
    const d = new Date("2026-06-23T12:00:00Z");
    expect(formatDateTimeIST(d)).toContain("2026");
    expect(formatDateTimeIST(null)).toBe("");
  });

  it("parses IST date correctly", () => {
    const d = parseToISTDate("2026-06-23");
    expect(d).not.toBeNull();
    expect(parseToISTDate(null)).toBeNull();

    const withTime = parseToISTDate("2026-06-23T10:30");
    expect(withTime).not.toBeNull();
    expect(parseToISTDate("invalid-date")).toBeNull();
  });

  it("returns empty strings for invalid IST input dates", () => {
    expect(formatToISTInputString("invalid")).toBe("");
    expect(formatDateIST("invalid")).toBe("");
    expect(formatDateTimeIST("invalid")).toBe("");
  });
});
