/// <reference path="../../types/index.d.ts" />
describe("the api", () => {
  test("utf8", () => {
    expect(utf8("The test")).toStrictEqual([0x54, 0x68, 0x65, 0x20, 0x74, 0x65, 0x73, 0x74]);
  });
  test("char", () => {
    expect(char("0")).toBe(<u8>"0".charCodeAt(0));
    expect(char("1")).toBe(<u8>"1".charCodeAt(0));
    expect(char("2")).toBe(<u8>"2".charCodeAt(0));
    expect(char("a")).toBe(<u8>"a".charCodeAt(0));
    expect(char("V")).toBe(<u8>"V".charCodeAt(0));
    expect(char("E")).toBe(<u8>"E".charCodeAt(0));
    expect(char("$")).toBe(<u8>"$".charCodeAt(0));
    expect(char("*")).toBe(<u8>"*".charCodeAt(0));
    expect(char("_")).toBe(<u8>"_".charCodeAt(0));
  });
});
