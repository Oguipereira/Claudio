import { describe, expect, it } from "vitest";
import { formatSecondsToPace, parsePaceToSeconds } from "./pace";

describe("parsePaceToSeconds", () => {
  it("converte mm:ss para segundos", () => {
    expect(parsePaceToSeconds("5:30")).toBe(330);
    expect(parsePaceToSeconds("4:05")).toBe(245);
    expect(parsePaceToSeconds("10:00")).toBe(600);
  });

  it("rejeita formatos invalidos", () => {
    expect(parsePaceToSeconds("abc")).toBeNull();
    expect(parsePaceToSeconds("5:60")).toBeNull();
    expect(parsePaceToSeconds("")).toBeNull();
  });
});

describe("formatSecondsToPace", () => {
  it("formata segundos como mm:ss", () => {
    expect(formatSecondsToPace(330)).toBe("5:30");
    expect(formatSecondsToPace(245)).toBe("4:05");
    expect(formatSecondsToPace(600)).toBe("10:00");
  });
});
