export function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function safeHttpsUrl(value: unknown) {
  const raw = cleanText(value, 2000);
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function officialSourceUrl(value: unknown) {
  const safe = safeHttpsUrl(value);
  if (!safe) return "";
  const host = new URL(safe).hostname.toLowerCase();
  const approved = host === "ddugu.ac.in" || host.endsWith(".ddugu.ac.in") || host === "dduguadm.samarth.edu.in" || host === "scholarship.up.gov.in";
  return approved ? safe : "";
}
