import test from "node:test";
import assert from "node:assert";
import { slugify, truncateText, getInitials, getPublicIdFromUrl } from "./utils";

test("slugify matches expected output", () => {
  assert.strictEqual(slugify("Hello World!"), "hello-world");
  assert.strictEqual(slugify("Festoryx - OS & Quiz Arena"), "festoryx---os-quiz-arena");
  assert.strictEqual(slugify("   Trim-Me   "), "trim-me");
});

test("truncateText cuts off and adds ellipses", () => {
  assert.strictEqual(truncateText("Hello World", 5), "Hello...");
  assert.strictEqual(truncateText("Short", 10), "Short");
});

test("getInitials returns uppercase first letters", () => {
  assert.strictEqual(getInitials("Md Warish Ansari"), "MW");
  assert.strictEqual(getInitials("John Doe"), "JD");
  assert.strictEqual(getInitials("Single"), "S");
});

test("getPublicIdFromUrl parses Cloudinary URL correctly", () => {
  const url = "https://res.cloudinary.com/demo/image/upload/v1570975200/sample.jpg";
  assert.strictEqual(getPublicIdFromUrl(url), "sample");
});
