// تطبيع أرقام الهاتف الأردنية إلى شكل موحّد دولي بدون "+" مثلاً: 962790000000
// يقبل: 07XXXXXXXX  أو  +9627XXXXXXXX  أو  9627XXXXXXXX  أو  00962...

export function normalizeJordanPhone(input: string | null | undefined): string | null {
  if (!input) return null;
  let v = String(input).trim();
  v = v.replace(/[\s\-()]/g, "");
  v = v.replace(/^00/, "");
  v = v.replace(/^\+/, "");

  // 07XXXXXXXX => 9627XXXXXXXX
  if (/^07\d{8}$/.test(v)) {
    v = "962" + v.slice(1);
  }
  // 7XXXXXXXX => 9627XXXXXXXX
  else if (/^7\d{8}$/.test(v)) {
    v = "962" + v;
  }

  if (/^9627\d{8}$/.test(v)) {
    return v;
  }
  return null;
}

export function isValidJordanPhone(input: string | null | undefined): boolean {
  return !!normalizeJordanPhone(input);
}

export function formatJordanPhoneDisplay(normalized: string | null | undefined): string {
  const n = normalizeJordanPhone(normalized ?? "");
  if (!n) return normalized ?? "";
  // 962 7X XXX XXXX
  return `+${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
}
